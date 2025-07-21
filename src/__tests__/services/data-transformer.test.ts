import { describe, it, expect } from 'vitest'
import { applyColumnMapping, normalizeData } from '@/services/data-transformer'
import type { ICsvRow, IColumnMapping, IYamlConfig } from '@/types'

describe('データ変換機能', () => {
  describe('applyColumnMapping', () => {
    it('カラムマッピングに基づいてデータを変換できる', () => {
      const csvRows: ICsvRow[] = [
        {
          'test_condition': 'test-1',
          'param1': '100',
          'param2': '10',
          'ScenarioA-Throughput': '1000',
          'ScenarioB-Throughput': '1200',
        },
        {
          'test_condition': 'test-2',
          'param1': '200',
          'param2': '20',
          'ScenarioA-Throughput': '2000',
          'ScenarioB-Throughput': '2400',
        },
      ]

      const mapping: IColumnMapping = {
        file: 'test.csv',
        mappings: {
          test_condition: 'test_condition',
          parameter_1: 'param1',
          parameter_2: 'param2',
          scenario_a_throughput: 'ScenarioA-Throughput',
          scenario_b_throughput: 'ScenarioB-Throughput',
        },
      }

      const result = applyColumnMapping(csvRows, mapping)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toHaveLength(2)
        expect(result.data[0]).toHaveProperty('test_condition', 'test-1')
        expect(result.data[0]).toHaveProperty('parameter_1', '100')
        expect(result.data[0]).toHaveProperty('parameter_2', '10')
        expect(result.data[0]).toHaveProperty('scenario_a_throughput', '1000')
        expect(result.data[0]).toHaveProperty('scenario_b_throughput', '1200')
      }
    })

    it('マッピングに存在しないカラムは無視される', () => {
      const csvRows: ICsvRow[] = [
        {
          'test_condition': 'test-1',
          'param1': '100',
          'extra_column': 'ignored',
        },
      ]

      const mapping: IColumnMapping = {
        file: 'test.csv',
        mappings: {
          test_condition: 'test_condition',
          parameter_1: 'param1',
        },
      }

      const result = applyColumnMapping(csvRows, mapping)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data[0]).toHaveProperty('test_condition', 'test-1')
        expect(result.data[0]).toHaveProperty('parameter_1', '100')
        expect(result.data[0]).not.toHaveProperty('extra_column')
      }
    })

    it('CSVに存在しないマッピングカラムは空文字列になる', () => {
      const csvRows: ICsvRow[] = [
        {
          'test_condition': 'test-1',
        },
      ]

      const mapping: IColumnMapping = {
        file: 'test.csv',
        mappings: {
          test_condition: 'test_condition',
          parameter_1: 'non_existent_column',
        },
      }

      const result = applyColumnMapping(csvRows, mapping)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data[0]).toHaveProperty('parameter_1', '')
      }
    })

    it('空のデータ配列でもエラーにならない', () => {
      const csvRows: ICsvRow[] = []
      const mapping: IColumnMapping = {
        file: 'test.csv',
        mappings: {
          test_condition: 'test_condition',
        },
      }

      const result = applyColumnMapping(csvRows, mapping)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toHaveLength(0)
      }
    })
  })

  describe('normalizeData', () => {
    const mockYamlConfig: IYamlConfig = {
      scenarios: [
        {
          id: 'scenario-1',
          name: 'シナリオ1',
          file: 'test.csv',
          description: 'テスト',
        },
      ],
      metrics: [
        {
          id: 'throughput',
          name: 'スループット',
          scenario_a_column: 'scenario_a_throughput',
          scenario_b_column: 'scenario_b_throughput',
          unit: 'req/s',
        },
        {
          id: 'latency',
          name: 'レイテンシー',
          scenario_a_column: 'scenario_a_latency',
          scenario_b_column: 'scenario_b_latency',
          unit: 'ms',
        },
      ],
      column_mappings: [],
    }

    it('マッピングされたデータを正規化できる', () => {
      const mappedData: ICsvRow[] = [
        {
          test_condition: 'test-1',
          parameter_1: '100',
          parameter_2: '10',
          parameter_3: '1',
          scenario_a_throughput: '1000',
          scenario_b_throughput: '1200',
          scenario_a_latency: '50',
          scenario_b_latency: '45',
        },
        {
          test_condition: 'test-2',
          parameter_1: '200',
          parameter_2: '20',
          parameter_3: '2',
          scenario_a_throughput: '2000',
          scenario_b_throughput: '2400',
          scenario_a_latency: '40',
          scenario_b_latency: '35',
        },
      ]

      const result = normalizeData(mappedData, 'scenario-1', mockYamlConfig)

      expect(result.success).toBe(true)
      if (result.success) {
        const data = result.data
        expect(data.scenarioId).toBe('scenario-1')
        expect(data.results).toHaveLength(2)
        
        // 最初のレコードの検証
        expect(data.results[0].testCondition).toBe('test-1')
        expect(data.results[0].parameters.parameter_1).toBe(100)
        expect(data.results[0].scenarioA.throughput).toBe(1000)
        expect(data.results[0].scenarioB.throughput).toBe(1200)
        expect(data.results[0].scenarioA.latency).toBe(50)
        expect(data.results[0].scenarioB.latency).toBe(45)

        // 利用可能なパラメータの検証
        expect(data.availableParameters.parameter_1).toEqual([100, 200])
        expect(data.availableParameters.parameter_2).toEqual([10, 20])
        expect(data.availableParameters.parameter_3).toEqual([1, 2])

        // 利用可能なメトリクスの検証
        expect(data.availableMetrics).toContain('throughput')
        expect(data.availableMetrics).toContain('latency')
      }
    })

    it('数値に変換できない値はNaNになる', () => {
      const mappedData: ICsvRow[] = [
        {
          test_condition: 'test-1',
          parameter_1: 'invalid',
          scenario_a_throughput: 'not a number',
          scenario_b_throughput: '1200',
        },
      ]

      const result = normalizeData(mappedData, 'scenario-1', mockYamlConfig)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(Number.isNaN(result.data.results[0].parameters.parameter_1)).toBe(true)
        expect(Number.isNaN(result.data.results[0].scenarioA.throughput)).toBe(true)
        expect(result.data.results[0].scenarioB.throughput).toBe(1200)
      }
    })

    it('空の値は0として扱われる', () => {
      const mappedData: ICsvRow[] = [
        {
          test_condition: 'test-1',
          parameter_1: '',
          scenario_a_throughput: '',
          scenario_b_throughput: '1200',
        },
      ]

      const result = normalizeData(mappedData, 'scenario-1', mockYamlConfig)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.results[0].parameters.parameter_1).toBe(0)
        expect(result.data.results[0].scenarioA.throughput).toBe(0)
      }
    })

    it('存在しないシナリオIDの場合エラーを返す', () => {
      const mappedData: ICsvRow[] = [
        {
          test_condition: 'test-1',
        },
      ]

      const result = normalizeData(mappedData, 'non-existent', mockYamlConfig)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.message).toContain('Scenario not found')
      }
    })

    it('重複するパラメータ値を排除して一意な値のリストを作成する', () => {
      const mappedData: ICsvRow[] = [
        {
          test_condition: 'test-1',
          parameter_1: '100',
        },
        {
          test_condition: 'test-2',
          parameter_1: '100', // 重複
        },
        {
          test_condition: 'test-3',
          parameter_1: '200',
        },
      ]

      const result = normalizeData(mappedData, 'scenario-1', mockYamlConfig)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.availableParameters.parameter_1).toEqual([100, 200])
      }
    })
  })
})