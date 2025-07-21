import { describe, it, expect } from 'vitest'
import {
  extractAvailableFilters,
  generateFilterQuery,
} from '@/services/filter-service'
import type { INormalizedData, IFilter } from '@/types'

describe('フィルターサービス', () => {
  const mockNormalizedData: INormalizedData = {
    scenarioId: 'test-scenario',
    results: [
      {
        testCondition: 'test-1',
        parameters: { parameter_1: 100, parameter_2: 10, parameter_3: 1 },
        scenarioA: { throughput: 1000, latency: 50 },
        scenarioB: { throughput: 1200, latency: 45 },
      },
      {
        testCondition: 'test-2',
        parameters: { parameter_1: 200, parameter_2: 20, parameter_3: 2 },
        scenarioA: { throughput: 2000, latency: 40 },
        scenarioB: { throughput: 2400, latency: 35 },
      },
      {
        testCondition: 'test-3',
        parameters: { parameter_1: 100, parameter_2: 30, parameter_3: 3 },
        scenarioA: { throughput: 1500, latency: 45 },
        scenarioB: { throughput: 1800, latency: 40 },
      },
    ],
    availableParameters: {
      parameter_1: [100, 200],
      parameter_2: [10, 20, 30],
      parameter_3: [1, 2, 3],
    },
    availableMetrics: ['throughput', 'latency'],
  }

  describe('extractAvailableFilters', () => {
    it('利用可能なフィルター選択肢を抽出できる', () => {
      const filters = extractAvailableFilters(mockNormalizedData)

      // パラメータの選択肢
      expect(filters.parameters.parameter_1).toEqual([100, 200])
      expect(filters.parameters.parameter_2).toEqual([10, 20, 30])
      expect(filters.parameters.parameter_3).toEqual([1, 2, 3])

      // メトリクスの選択肢
      expect(filters.metrics).toEqual(['throughput', 'latency'])

      // テスト条件の選択肢
      expect(filters.testConditions).toEqual(['test-1', 'test-2', 'test-3'])
    })

    it('空のデータから空のフィルター選択肢を返す', () => {
      const emptyData: INormalizedData = {
        scenarioId: 'empty',
        results: [],
        availableParameters: {},
        availableMetrics: [],
      }

      const filters = extractAvailableFilters(emptyData)
      expect(filters.parameters).toEqual({})
      expect(filters.metrics).toEqual([])
      expect(filters.testConditions).toEqual([])
    })

    it('重複するテスト条件を排除する', () => {
      const dataWithDuplicates: INormalizedData = {
        ...mockNormalizedData,
        results: [
          ...mockNormalizedData.results,
          {
            testCondition: 'test-1', // 重複
            parameters: { parameter_1: 300 },
            scenarioA: { throughput: 3000 },
            scenarioB: { throughput: 3600 },
          },
        ],
      }

      const filters = extractAvailableFilters(dataWithDuplicates)

      expect(filters.testConditions).toEqual(['test-1', 'test-2', 'test-3'])
    })
  })

  describe('generateFilterQuery', () => {
    it('フィルター条件に基づいてSQLクエリを生成できる', () => {
      const filter: IFilter = {
        selectedScenario: 'test-scenario',
        selectedMetric: 'throughput',
        parameters: {
          parameter_1: 100,
        },
      }

      const result = generateFilterQuery(filter, 'test_table')

      expect(result.success).toBe(true)
      if (result.success) {
        const query = result.data
        expect(query).toContain('SELECT')
        expect(query).toContain('FROM test_table')
        expect(query).toContain('WHERE')
        expect(query).toContain('parameter_1 = 100')
        expect(query).toContain('scenario_a_throughput')
        expect(query).toContain('scenario_b_throughput')
      }
    })

    it('複数のパラメータフィルターを適用できる', () => {
      const filter: IFilter = {
        selectedScenario: 'test-scenario',
        selectedMetric: 'latency',
        parameters: {
          parameter_1: 200,
          parameter_2: 20,
          parameter_3: 2,
        },
      }

      const result = generateFilterQuery(filter, 'test_table')

      expect(result.success).toBe(true)
      if (result.success) {
        const query = result.data
        expect(query).toContain('parameter_1 = 200')
        expect(query).toContain('AND parameter_2 = 20')
        expect(query).toContain('AND parameter_3 = 2')
      }
    })

    it('パラメータフィルターなしでも有効なクエリを生成する', () => {
      const filter: IFilter = {
        selectedScenario: 'test-scenario',
        selectedMetric: 'throughput',
        parameters: {},
      }

      const result = generateFilterQuery(filter, 'test_table')

      expect(result.success).toBe(true)
      if (result.success) {
        const query = result.data
        expect(query).toContain('SELECT')
        expect(query).not.toContain('WHERE')
      }
    })

    it('無効なテーブル名の場合エラーを返す', () => {
      const filter: IFilter = {
        selectedScenario: 'test-scenario',
        selectedMetric: 'throughput',
        parameters: {},
      }

      const result = generateFilterQuery(filter, 'invalid-table!')

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.message).toContain('Invalid table name')
      }
    })

    it('メトリクスが未選択の場合エラーを返す', () => {
      const filter: IFilter = {
        selectedScenario: 'test-scenario',
        selectedMetric: '',
        parameters: {},
      }

      const result = generateFilterQuery(filter, 'test_table')

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.message).toContain('Metric must be selected')
      }
    })

    it('SQLインジェクションを防ぐため危険な文字をエスケープする', () => {
      const filter: IFilter = {
        selectedScenario: 'test-scenario',
        selectedMetric: 'throughput',
        parameters: {
          parameter_1: 100,
        },
      }

      // テーブル名に危険な文字が含まれる場合
      const result = generateFilterQuery(filter, "test'; DROP TABLE users; --")

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.message).toContain('Invalid table name')
      }
    })

    it('ORDER BY句を含むクエリを生成する', () => {
      const filter: IFilter = {
        selectedScenario: 'test-scenario',
        selectedMetric: 'throughput',
        parameters: {
          parameter_1: 100,
        },
      }

      const result = generateFilterQuery(filter, 'test_table')

      expect(result.success).toBe(true)
      if (result.success) {
        const query = result.data
        expect(query).toContain('ORDER BY')
        expect(query).toContain('test_condition')
      }
    })
  })
})