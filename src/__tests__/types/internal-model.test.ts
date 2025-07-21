import { describe, it, expect } from 'vitest'
import type {
  IFilter,
  IChartData,
  IComparison,
  IAppState,
  TResultStatus,
} from '@/types/internal-model'

describe('内部データモデル型定義', () => {
  describe('IFilter', () => {
    it('フィルター設定が型定義に適合する', () => {
      const filter: IFilter = {
        selectedScenario: 'scenario-a-vs-b',
        selectedMetric: 'throughput',
        parameters: {
          parameter_1: 100,
          parameter_2: 10,
          parameter_3: 1,
        },
      }

      expect(filter.selectedScenario).toBe('scenario-a-vs-b')
      expect(filter.selectedMetric).toBe('throughput')
      expect(filter.parameters.parameter_1).toBe(100)
    })

    it('部分的なパラメータでもフィルターが型定義に適合する', () => {
      const filter: IFilter = {
        selectedScenario: 'scenario-a-vs-b',
        selectedMetric: 'latency',
        parameters: {
          parameter_1: 200,
        },
      }

      expect(filter.parameters.parameter_2).toBeUndefined()
      expect(filter.parameters.parameter_3).toBeUndefined()
    })
  })

  describe('IChartData', () => {
    it('グラフデータが型定義に適合する', () => {
      const chartData: IChartData = {
        labels: ['Test 1', 'Test 2', 'Test 3'],
        datasets: [
          {
            label: 'シナリオA',
            data: [1000, 1100, 1200],
            backgroundColor: '#3b82f6',
          },
          {
            label: 'シナリオB',
            data: [1200, 1300, 1400],
            backgroundColor: '#10b981',
          },
        ],
        unit: 'req/s',
      }

      expect(chartData.labels).toHaveLength(3)
      expect(chartData.datasets).toHaveLength(2)
      expect(chartData.datasets[0].label).toBe('シナリオA')
      expect(chartData.unit).toBe('req/s')
    })
  })

  describe('IComparison', () => {
    it('比較データが型定義に適合する', () => {
      const comparison: IComparison = {
        testCondition: 'test-1',
        scenarioA: {
          value: 1000,
          label: 'シナリオA',
        },
        scenarioB: {
          value: 1200,
          label: 'シナリオB',
        },
        difference: 200,
        improvementRate: 20,
      }

      expect(comparison.testCondition).toBe('test-1')
      expect(comparison.scenarioA.value).toBe(1000)
      expect(comparison.scenarioB.value).toBe(1200)
      expect(comparison.difference).toBe(200)
      expect(comparison.improvementRate).toBe(20)
    })
  })

  describe('TResultStatus', () => {
    it('Result型が成功状態を表現できる', () => {
      const successResult: TResultStatus<string> = {
        success: true,
        data: 'テストデータ',
      }

      expect(successResult.success).toBe(true)
      if (successResult.success) {
        expect(successResult.data).toBe('テストデータ')
      }
    })

    it('Result型がエラー状態を表現できる', () => {
      const errorResult: TResultStatus<string> = {
        success: false,
        error: new Error('エラーメッセージ'),
      }

      expect(errorResult.success).toBe(false)
      if (!errorResult.success) {
        expect(errorResult.error.message).toBe('エラーメッセージ')
      }
    })
  })

  describe('IAppState', () => {
    it('アプリケーション状態が型定義に適合する', () => {
      const appState: IAppState = {
        yamlConfig: null,
        currentData: null,
        filter: {
          selectedScenario: '',
          selectedMetric: 'throughput',
          parameters: {},
        },
        loading: false,
        error: null,
      }

      expect(appState.yamlConfig).toBeNull()
      expect(appState.currentData).toBeNull()
      expect(appState.filter.selectedMetric).toBe('throughput')
      expect(appState.loading).toBe(false)
      expect(appState.error).toBeNull()
    })

    it('データ読み込み完了後の状態が型定義に適合する', () => {
      const appState: IAppState = {
        yamlConfig: {
          scenarios: [],
          metrics: [],
          column_mappings: [],
        },
        currentData: {
          scenarioId: 'scenario-a-vs-b',
          results: [],
          availableParameters: {},
          availableMetrics: [],
        },
        filter: {
          selectedScenario: 'scenario-a-vs-b',
          selectedMetric: 'throughput',
          parameters: {},
        },
        loading: false,
        error: null,
      }

      expect(appState.yamlConfig).not.toBeNull()
      expect(appState.currentData).not.toBeNull()
      expect(appState.currentData?.scenarioId).toBe('scenario-a-vs-b')
    })
  })
})