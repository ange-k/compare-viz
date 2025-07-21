import { describe, it, expect, vi } from 'vitest'
import { loadYamlConfig } from '@/services/yaml-loader'

// モックデータ
const mockYamlContent = `
scenarios:
  - id: scenario-a-vs-b
    name: シナリオA vs シナリオB
    file: comparison_results.csv
    description: 同一環境での2つの実装の性能比較
    target_a_name: シナリオA
    target_b_name: シナリオB
    metrics:
      - id: throughput
        name: スループット
        unit: req/s
        higher_is_better: true
      - id: latency
        name: レイテンシー
        unit: ms
        higher_is_better: false
    parameters:
      parameter_1:
        name: パラメータ1
        unit: unit1
      parameter_2:
        name: パラメータ2
        unit: unit2
  - id: config-comparison
    name: 設定値による性能比較
    file: config_comparison.csv
    description: 異なる設定値での性能差を比較
    target_a_name: 設定A
    target_b_name: 設定B
    metrics:
      - id: throughput
        name: スループット
        unit: req/s
        higher_is_better: true
    parameters:
      config_param:
        name: 設定パラメータ
        unit: value

column_mappings:
  - file: comparison_results.csv
    mappings:
      test_condition: test_condition
      parameter_1: parameter_1
      parameter_2: parameter_2
      scenario_a_throughput: "Scenario A - Throughput"
      scenario_b_throughput: "Scenario B - Throughput"
`


describe('YAML読み込み機能', () => {
  describe('loadYamlConfig', () => {
    it('正常なYAMLファイルを読み込んでパースできる', async () => {
      // fetchのモック
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        text: async () => mockYamlContent,
      } as Response)

      const result = await loadYamlConfig('/config.yaml')

      expect(result.success).toBe(true)
      if (result.success) {
        const config = result.data
        expect(config.scenarios).toHaveLength(2)
        expect(config.scenarios[0].id).toBe('scenario-a-vs-b')
        expect(config.scenarios[0].target_a_name).toBe('シナリオA')
        expect(config.scenarios[0].target_b_name).toBe('シナリオB')
        expect(config.scenarios[0].metrics).toHaveLength(2)
        expect(config.scenarios[0].metrics[0].id).toBe('throughput')
        expect(config.scenarios[0].parameters).toHaveProperty('parameter_1')
        expect(config.column_mappings).toHaveLength(1)
      }
    })

    it('存在しないファイルパスの場合エラーを返す', async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      } as Response)

      const result = await loadYamlConfig('/not-found.yaml')

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.message).toContain('Failed to fetch YAML file')
      }
    })

    it('不正なYAML形式の場合エラーを返す', async () => {
      const invalidYaml = 'invalid: yaml: content: :'
      
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        text: async () => invalidYaml,
      } as Response)

      const result = await loadYamlConfig('/invalid.yaml')

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.message).toContain('Failed to parse YAML')
      }
    })

    it('ネットワークエラーの場合適切なエラーを返す', async () => {
      global.fetch = vi.fn().mockRejectedValueOnce(
        new Error('Network error')
      )

      const result = await loadYamlConfig('/config.yaml')

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.message).toContain('Network error')
      }
    })

    it('空のYAMLファイルの場合エラーを返す', async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        text: async () => '',
      } as Response)

      const result = await loadYamlConfig('/empty.yaml')

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.message).toContain('Empty YAML file')
      }
    })
  })
})