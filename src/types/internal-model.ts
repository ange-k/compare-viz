import type { IYamlConfig } from './yaml-schema'
import type { INormalizedData } from './csv-data'

// フィルター設定
export interface IFilter {
  selectedScenario: string
  selectedMetric: string
  parameters: {
    parameter_1?: number | null
    parameter_2?: number | null
    parameter_3?: number | null
    [key: string]: number | null | undefined
  }
  chartXAxis?: string  // チャートの横軸パラメータ
}

// グラフ表示用データ
export interface IChartData {
  labels: string[]
  datasets: Array<{
    label: string
    data: number[]
    backgroundColor: string
  }>
  unit: string
}

// 比較結果データ
export interface IComparison {
  testCondition: string
  scenarioA: {
    value: number
    label: string
  }
  scenarioB: {
    value: number
    label: string
  }
  difference: number
  improvementRate: number
}

// Result型（エラーハンドリング用）
export type TResultStatus<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E }

// アプリケーション全体の状態
export interface IAppState {
  yamlConfig: IYamlConfig | null
  currentData: INormalizedData | null
  filter: IFilter
  loading: boolean
  error: Error | null
}