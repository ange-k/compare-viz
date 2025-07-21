import { describe, it, expect } from 'vitest'
import type {
  IYamlConfig,
  IScenario,
  IMetric,
  IColumnMapping,
  IParameterDef,
} from '@/types/yaml-schema'
import { createMockScenario, createMockMetric, createMockYamlConfig } from '../test-helpers'

describe('YAMLスキーマ型定義', () => {
  describe('IScenario', () => {
    it('必須フィールドを持つシナリオが型定義に適合する', () => {
      const scenario: IScenario = {
        id: 'scenario-a-vs-b',
        name: 'シナリオA vs シナリオB',
        file: 'comparison_results.csv',
        description: '同一環境での2つの実装の性能比較',
        target_a_name: 'シナリオA',
        target_b_name: 'シナリオB',
        metrics: [
          {
            id: 'throughput',
            name: 'スループット',
            unit: 'req/s',
            higher_is_better: true,
          },
        ],
        parameters: {
          threads: { name: 'スレッド数', unit: 'threads' },
          duration: { name: '実行時間', unit: 's' },
        },
      }

      expect(scenario.id).toBe('scenario-a-vs-b')
      expect(scenario.name).toBe('シナリオA vs シナリオB')
      expect(scenario.file).toBe('comparison_results.csv')
      expect(scenario.description).toBe('同一環境での2つの実装の性能比較')
      expect(scenario.target_a_name).toBe('シナリオA')
      expect(scenario.target_b_name).toBe('シナリオB')
      expect(scenario.metrics).toHaveLength(1)
      expect(scenario.parameters).toHaveProperty('threads')
    })

    it('ヘルパー関数でモックシナリオを作成できる', () => {
      const scenario = createMockScenario({
        id: 'custom-id',
        name: 'カスタムシナリオ',
      })

      expect(scenario.id).toBe('custom-id')
      expect(scenario.name).toBe('カスタムシナリオ')
      expect(scenario.target_a_name).toBeDefined()
      expect(scenario.target_b_name).toBeDefined()
      expect(scenario.metrics).toHaveLength(1)
      expect(scenario.parameters).toBeDefined()
    })
  })

  describe('IMetric', () => {
    it('必須フィールドを持つメトリクスが型定義に適合する', () => {
      const metric: IMetric = {
        id: 'throughput',
        name: 'スループット',
        unit: 'req/s',
        higher_is_better: true,
      }

      expect(metric.id).toBe('throughput')
      expect(metric.name).toBe('スループット')
      expect(metric.unit).toBe('req/s')
      expect(metric.higher_is_better).toBe(true)
    })

    it('ヘルパー関数でモックメトリクスを作成できる', () => {
      const metric = createMockMetric({
        id: 'latency',
        name: 'レイテンシ',
        unit: 'ms',
        higher_is_better: false,
      })

      expect(metric.id).toBe('latency')
      expect(metric.name).toBe('レイテンシ')
      expect(metric.unit).toBe('ms')
      expect(metric.higher_is_better).toBe(false)
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
            target_a_name: 'シナリオA',
            target_b_name: 'シナリオB',
            metrics: [
              {
                id: 'throughput',
                name: 'スループット',
                unit: 'req/s',
                higher_is_better: true,
              },
            ],
            parameters: {
              threads: { name: 'スレッド数', unit: 'threads' },
            },
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
      expect(yamlConfig.column_mappings).toHaveLength(1)
      expect(yamlConfig.scenarios[0].metrics).toHaveLength(1)
    })

    it('ヘルパー関数でモックYAML設定を作成できる', () => {
      const yamlConfig = createMockYamlConfig()

      expect(yamlConfig.scenarios).toHaveLength(1)
      expect(yamlConfig.column_mappings).toHaveLength(1)
      expect(yamlConfig.scenarios[0].metrics).toBeDefined()
      expect(yamlConfig.scenarios[0].parameters).toBeDefined()
    })
  })

  describe('IParameterDef', () => {
    it('パラメータ定義が型定義に適合する', () => {
      const paramDef: IParameterDef = {
        name: 'スレッド数',
        unit: 'threads',
      }

      expect(paramDef.name).toBe('スレッド数')
      expect(paramDef.unit).toBe('threads')
    })
  })
})