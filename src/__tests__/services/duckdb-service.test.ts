import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  initializeDuckDB,
  createTableFromData,
  executeQuery,
  closeDuckDB,
} from '@/services/duckdb-service'
import type { INormalizedData } from '@/types'

// DuckDB-WASMのモック
const mockConnection = {
  query: vi.fn().mockResolvedValue({
    toArray: () => [{ toJSON: () => ({ test: 'data' }) }],
  }),
  close: vi.fn(),
}

const mockDB = {
  connect: vi.fn().mockResolvedValue(mockConnection),
  instantiate: vi.fn(),
  terminate: vi.fn(),
}

vi.mock('@duckdb/duckdb-wasm', () => ({
  selectBundle: vi.fn().mockResolvedValue({
    mainModule: 'mock-module',
    mainWorker: 'mock-worker',
  }),
  getJsDelivrBundles: vi.fn().mockReturnValue({
    mvp: { mainModule: 'mvp-module', mainWorker: 'mvp-worker' },
    eh: { mainModule: 'eh-module', mainWorker: 'eh-worker' },
  }),
  ConsoleLogger: vi.fn(),
  AsyncDuckDB: vi.fn().mockImplementation(() => mockDB),
}))

describe('DuckDBサービス', () => {
  describe('initializeDuckDB', () => {
    beforeEach(() => {
      vi.clearAllMocks()
    })

    afterEach(async () => {
      await closeDuckDB()
    })

    it('DuckDBインスタンスを初期化できる', async () => {
      const result = await initializeDuckDB()

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toBeTruthy()
      }
    })

    it('既に初期化されている場合は既存のインスタンスを返す', async () => {
      const result1 = await initializeDuckDB()
      const result2 = await initializeDuckDB()

      expect(result1.success).toBe(true)
      expect(result2.success).toBe(true)
      if (result1.success && result2.success) {
        expect(result1.data).toBe(result2.data)
      }
    })

    it('初期化エラーを適切に処理する', async () => {
      // モックを一時的に変更してエラーを発生させる
      const { selectBundle } = await import('@duckdb/duckdb-wasm')
      ;(selectBundle as any).mockRejectedValueOnce(
        new Error('Failed to load WASM')
      )

      const result = await initializeDuckDB()

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.message).toContain('Failed to initialize DuckDB')
      }
    })
  })

  describe('createTableFromData', () => {
    const mockNormalizedData: INormalizedData = {
      scenarioId: 'test-scenario',
      results: [
        {
          testCondition: 'test-1',
          parameters: { parameter_1: 100, parameter_2: 10 },
          scenarioA: { throughput: 1000, latency: 50 },
          scenarioB: { throughput: 1200, latency: 45 },
        },
        {
          testCondition: 'test-2',
          parameters: { parameter_1: 200, parameter_2: 20 },
          scenarioA: { throughput: 2000, latency: 40 },
          scenarioB: { throughput: 2400, latency: 35 },
        },
      ],
      availableParameters: {
        parameter_1: [100, 200],
        parameter_2: [10, 20],
      },
      availableMetrics: ['throughput', 'latency'],
    }

    it('正規化されたデータからテーブルを作成できる', async () => {
      const initResult = await initializeDuckDB()
      expect(initResult.success).toBe(true)

      const result = await createTableFromData(
        mockNormalizedData,
        'test_table'
      )

      expect(result.success).toBe(true)
    })

    it('空のデータでもテーブルを作成できる', async () => {
      const emptyData: INormalizedData = {
        scenarioId: 'empty',
        results: [],
        availableParameters: {},
        availableMetrics: [],
      }

      const initResult = await initializeDuckDB()
      expect(initResult.success).toBe(true)

      const result = await createTableFromData(emptyData, 'empty_table')

      expect(result.success).toBe(true)
    })

    it('DuckDBが初期化されていない場合エラーを返す', async () => {
      await closeDuckDB() // 確実に閉じる

      const result = await createTableFromData(
        mockNormalizedData,
        'test_table'
      )

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.message).toContain('DuckDB is not initialized')
      }
    })

    it('無効なテーブル名の場合エラーを返す', async () => {
      const initResult = await initializeDuckDB()
      expect(initResult.success).toBe(true)

      const result = await createTableFromData(
        mockNormalizedData,
        'invalid-table-name!' // 無効な文字を含む
      )

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.message).toContain('Invalid table name')
      }
    })
  })

  describe('executeQuery', () => {
    it('SQLクエリを実行できる', async () => {
      await initializeDuckDB()

      const mockData: INormalizedData = {
        scenarioId: 'test',
        results: [
          {
            testCondition: 'test-1',
            parameters: { parameter_1: 100 },
            scenarioA: { throughput: 1000 },
            scenarioB: { throughput: 1200 },
          },
        ],
        availableParameters: { parameter_1: [100] },
        availableMetrics: ['throughput'],
      }

      await createTableFromData(mockData, 'query_test')

      const result = await executeQuery('SELECT * FROM query_test')

      expect(result.success).toBe(true)
      if (result.success) {
        expect(Array.isArray(result.data)).toBe(true)
      }
    })

    it('無効なSQLクエリの場合エラーを返す', async () => {
      const initResult = await initializeDuckDB()
      expect(initResult.success).toBe(true)

      // クエリエラーをシミュレート
      mockConnection.query.mockRejectedValueOnce(new Error('Invalid SQL'))

      const result = await executeQuery('INVALID SQL SYNTAX')

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.message).toContain('Query execution failed')
      }
    })

    it('DuckDBが初期化されていない場合エラーを返す', async () => {
      await closeDuckDB()

      const result = await executeQuery('SELECT 1')

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.message).toContain('DuckDB is not initialized')
      }
    })
  })

  describe('closeDuckDB', () => {
    it('DuckDBインスタンスを正常に閉じることができる', async () => {
      await initializeDuckDB()
      await closeDuckDB()

      // 閉じた後に操作を試みるとエラーになることを確認
      const result = await executeQuery('SELECT 1')
      expect(result.success).toBe(false)
    })

    it('既に閉じられている場合でもエラーにならない', async () => {
      await closeDuckDB()
      await closeDuckDB() // 2回目の呼び出し

      // エラーが発生しないことを確認
      expect(true).toBe(true)
    })
  })
})