import { describe, it, expect } from 'vitest'
import { validateYamlConfig } from '@/services/yaml-validator'
import type { IYamlConfig } from '@/types'

describe('YAMLバリデーション機能', () => {
  describe('validateYamlConfig', () => {
    it('正常なYAML設定を検証できる', () => {
      const validConfig: IYamlConfig = {
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
            },
          },
        ],
      }

      const result = validateYamlConfig(validConfig)

      expect(result.success).toBe(true)
    })

    it('scenariosが存在しない場合エラーを返す', () => {
      const invalidConfig = {
        metrics: [],
        column_mappings: [],
      } as unknown as IYamlConfig

      const result = validateYamlConfig(invalidConfig)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.message).toContain('scenarios')
      }
    })

    it('scenariosが空配列の場合エラーを返す', () => {
      const invalidConfig: IYamlConfig = {
        scenarios: [],
        metrics: [],
        column_mappings: [],
      }

      const result = validateYamlConfig(invalidConfig)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.message).toContain('At least one scenario')
      }
    })

    it('シナリオの必須フィールドが不足している場合エラーを返す', () => {
      const invalidConfig = {
        scenarios: [
          {
            id: 'test',
            name: 'Test',
            // fileフィールドが不足
            description: 'Test description',
          },
        ],
        metrics: [],
        column_mappings: [],
      } as unknown as IYamlConfig

      const result = validateYamlConfig(invalidConfig)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.message).toContain('file')
      }
    })

    it('メトリクスの必須フィールドが不足している場合エラーを返す', () => {
      const invalidConfig = {
        scenarios: [
          {
            id: 'test',
            name: 'Test',
            file: 'test.csv',
            description: 'Test',
          },
        ],
        metrics: [
          {
            id: 'throughput',
            name: 'スループット',
            scenario_a_column: 'Scenario A - Throughput',
            // scenario_b_columnが不足
            unit: 'req/s',
          },
        ],
        column_mappings: [],
      } as unknown as IYamlConfig

      const result = validateYamlConfig(invalidConfig)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.message).toContain('scenario_b_column')
      }
    })

    it('カラムマッピングのファイル参照が無効な場合エラーを返す', () => {
      const invalidConfig: IYamlConfig = {
        scenarios: [
          {
            id: 'test',
            name: 'Test',
            file: 'test.csv',
            description: 'Test',
          },
        ],
        metrics: [],
        column_mappings: [
          {
            file: 'non-existent.csv', // scenariosに存在しないファイル
            mappings: {
              test_condition: 'test_condition',
            },
          },
        ],
      }

      const result = validateYamlConfig(invalidConfig)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.message).toContain('non-existent.csv')
      }
    })

    it('重複するシナリオIDがある場合エラーを返す', () => {
      const invalidConfig: IYamlConfig = {
        scenarios: [
          {
            id: 'duplicate-id',
            name: 'Test 1',
            file: 'test1.csv',
            description: 'Test 1',
          },
          {
            id: 'duplicate-id',
            name: 'Test 2',
            file: 'test2.csv',
            description: 'Test 2',
          },
        ],
        metrics: [],
        column_mappings: [],
      }

      const result = validateYamlConfig(invalidConfig)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.message).toContain('Duplicate scenario ID')
      }
    })

    it('重複するメトリクスIDがある場合エラーを返す', () => {
      const invalidConfig: IYamlConfig = {
        scenarios: [
          {
            id: 'test',
            name: 'Test',
            file: 'test.csv',
            description: 'Test',
          },
        ],
        metrics: [
          {
            id: 'duplicate-metric',
            name: 'Metric 1',
            scenario_a_column: 'A1',
            scenario_b_column: 'B1',
            unit: 'unit1',
          },
          {
            id: 'duplicate-metric',
            name: 'Metric 2',
            scenario_a_column: 'A2',
            scenario_b_column: 'B2',
            unit: 'unit2',
          },
        ],
        column_mappings: [],
      }

      const result = validateYamlConfig(invalidConfig)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.message).toContain('Duplicate metric ID')
      }
    })

    it('nullまたはundefinedの入力に対してエラーを返す', () => {
      const result1 = validateYamlConfig(null as unknown as IYamlConfig)
      const result2 = validateYamlConfig(undefined as unknown as IYamlConfig)

      expect(result1.success).toBe(false)
      expect(result2.success).toBe(false)
    })
  })
})