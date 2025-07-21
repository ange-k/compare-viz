import { describe, it, expect } from 'vitest'
import type {
  IYamlConfig,
  IScenario,
  IMetric,
  IColumnMapping,
} from '@/types/yaml-schema'

describe('YAMLスキーマ型定義', () => {
  describe('IScenario', () => {
    it('必須フィールドを持つシナリオが型定義に適合する', () => {
      const scenario: IScenario = {
        id: 'scenario-a-vs-b',
        name: 'シナリオA vs シナリオB',
        file: 'comparison_results.csv',
        description: '同一環境での2つの実装の性能比較',
      }

      expect(scenario.id).toBe('scenario-a-vs-b')
      expect(scenario.name).toBe('シナリオA vs シナリオB')
      expect(scenario.file).toBe('comparison_results.csv')
      expect(scenario.description).toBe('同一環境での2つの実装の性能比較')
    })
  })

  describe('IMetric', () => {
    it('必須フィールドを持つメトリクスが型定義に適合する', () => {
      const metric: IMetric = {
        id: 'throughput',
        name: 'スループット',
        scenario_a_column: 'Scenario A - Throughput',
        scenario_b_column: 'Scenario B - Throughput',
        unit: 'req/s',
      }

      expect(metric.id).toBe('throughput')
      expect(metric.name).toBe('スループット')
      expect(metric.scenario_a_column).toBe('Scenario A - Throughput')
      expect(metric.scenario_b_column).toBe('Scenario B - Throughput')
      expect(metric.unit).toBe('req/s')
    })
  })

  describe('IColumnMapping', () => {
    it('カラムマッピングが型定義に適合する', () => {
      const columnMapping: IColumnMapping = {
        file: 'comparison_results.csv',
        mappings: {
          test_condition: 'test_condition',
          parameter_1: 'parameter_1',
          parameter_2: 'parameter_2',
          parameter_3: 'parameter_3',
          scenario_a_throughput: 'Scenario A - Throughput',
          scenario_b_throughput: 'Scenario B - Throughput',
        },
      }

      expect(columnMapping.file).toBe('comparison_results.csv')
      expect(columnMapping.mappings.test_condition).toBe('test_condition')
      expect(columnMapping.mappings.parameter_1).toBe('parameter_1')
    })
  })

  describe('IYamlConfig', () => {
    it('完全なYAML設定が型定義に適合する', () => {
      const yamlConfig: IYamlConfig = {
        scenarios: [
          {
            id: 'scenario-a-vs-b',
            name: 'シナリオA vs シナリオB',
            file: 'comparison_results.csv',
            description: '同一環境での2つの実装の性能比較',
          },
        ],
        metrics: [
          {
            id: 'throughput',
            name: 'スループット',
            scenario_a_column: 'Scenario A - Throughput',
            scenario_b_column: 'Scenario B - Throughput',
            unit: 'req/s',
          },
        ],
        column_mappings: [
          {
            file: 'comparison_results.csv',
            mappings: {
              test_condition: 'test_condition',
              parameter_1: 'parameter_1',
              parameter_2: 'parameter_2',
              parameter_3: 'parameter_3',
              scenario_a_throughput: 'Scenario A - Throughput',
              scenario_b_throughput: 'Scenario B - Throughput',
            },
          },
        ],
      }

      expect(yamlConfig.scenarios).toHaveLength(1)
      expect(yamlConfig.metrics).toHaveLength(1)
      expect(yamlConfig.column_mappings).toHaveLength(1)
    })
  })
})