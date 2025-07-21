import { describe, it, expect } from 'vitest'
import { validateYamlConfig } from '@/services/yaml-validator'
import type { IYamlConfig } from '@/types'
import { createMockScenario, createMockMetric, createMockYamlConfig } from '../test-helpers'

describe('YAMLバリデーション機能', () => {
  describe('validateYamlConfig', () => {
    it('正常なYAML設定を検証できる', () => {
      const validConfig = createMockYamlConfig({
        scenarios: [
          createMockScenario({
            id: 'scenario-a-vs-b',
            name: 'シナリオA vs シナリオB',
            file: 'comparison_results.csv',
            description: '同一環境での2つの実装の性能比較',
          }),
        ],
      })

      const result = validateYamlConfig(validConfig)

      expect(result.success).toBe(true)
    })

    it('scenariosが存在しない場合エラーを返す', () => {
      const invalidConfig = {
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
            target_a_name: 'A',
            target_b_name: 'B',
            metrics: [],
            parameters: {},
          },
        ],
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
            target_a_name: 'A',
            target_b_name: 'B',
            metrics: [
              {
                id: 'throughput',
                name: 'スループット',
                // unitが不足
                higher_is_better: true,
              },
            ],
            parameters: {},
          },
        ],
        column_mappings: [],
      } as unknown as IYamlConfig

      const result = validateYamlConfig(invalidConfig)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.message).toContain('unit')
      }
    })

    it('カラムマッピングのファイル参照が無効な場合エラーを返す', () => {
      const invalidConfig: IYamlConfig = {
        scenarios: [
          createMockScenario({
            id: 'test',
            name: 'Test',
            file: 'test.csv',
            description: 'Test',
          }),
        ],
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
          createMockScenario({
            id: 'duplicate-id',
            name: 'Test 1',
            file: 'test1.csv',
            description: 'Test 1',
          }),
          createMockScenario({
            id: 'duplicate-id',
            name: 'Test 2',
            file: 'test2.csv',
            description: 'Test 2',
          }),
        ],
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
          createMockScenario({
            id: 'test',
            name: 'Test',
            file: 'test.csv',
            description: 'Test',
            metrics: [
              createMockMetric({
                id: 'duplicate-metric',
                name: 'Metric 1',
                unit: 'unit1',
              }),
              createMockMetric({
                id: 'duplicate-metric',
                name: 'Metric 2',
                unit: 'unit2',
              }),
            ],
          }),
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