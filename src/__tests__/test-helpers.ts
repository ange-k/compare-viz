import type { IScenario, IMetric, IYamlConfig } from '@/types'

export function createMockScenario(override?: Partial<IScenario>): IScenario {
  return {
    id: 'test-scenario',
    name: 'テストシナリオ',
    file: 'test.csv',
    description: 'テストシナリオの説明',
    target_a_name: '対象A',
    target_b_name: '対象B',
    metrics: [
      { id: 'metric1', name: 'メトリクス1', unit: 'unit', higher_is_better: true }
    ],
    parameters: {
      param1: { name: 'パラメータ1', unit: 'unit' }
    },
    ...override
  }
}

export function createMockMetric(override?: Partial<IMetric>): IMetric {
  return {
    id: 'test-metric',
    name: 'テストメトリクス',
    unit: 'unit',
    higher_is_better: true,
    ...override
  }
}

export function createMockYamlConfig(override?: Partial<IYamlConfig>): IYamlConfig {
  return {
    scenarios: [createMockScenario()],
    column_mappings: [
      {
        file: 'test.csv',
        mappings: {
          test_condition: 'test_condition',
          parameter_1: 'param1',
          scenario_a_metric1: 'a_metric',
          scenario_b_metric1: 'b_metric',
        }
      }
    ],
    ...override
  }
}