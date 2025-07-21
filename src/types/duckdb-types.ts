// DuckDBで使用するフラットな構造のデータ型

// フラットなテスト結果（DuckDBテーブル用）
export interface IFlatTestResult {
  parameter_1: number
  parameter_2: number
  parameter_3: number
  scenario_a_throughput?: number
  scenario_b_throughput?: number
  scenario_a_latency?: number
  scenario_b_latency?: number
  scenario_a_error_rate?: number
  scenario_b_error_rate?: number
  [key: string]: number | undefined
}

// チャートデータポイント
export interface IChartDataPoint {
  label: string
  scenario_a: number
  scenario_b: number
  parameter_1: number
  parameter_2: number
  parameter_3: number
}

// 集計比較結果
export interface IAggregatedComparison {
  metric_id: string
  metric_name: string
  unit: string
  scenario_a_avg: number
  scenario_b_avg: number
  difference: number
  improvement_rate: number
}