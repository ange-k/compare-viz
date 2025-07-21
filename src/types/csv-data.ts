// CSVファイルの生の行データ
export interface ICsvRow {
  [key: string]: string
}

// メトリクスデータ
export interface IMetricData {
  throughput?: number
  latency?: number
  errorRate?: number
  [key: string]: number | undefined
}

// テスト結果の構造化データ
export interface ITestResult {
  testCondition: string
  parameters: {
    parameter_1?: number
    parameter_2?: number
    parameter_3?: number
    [key: string]: number | undefined
  }
  scenarioA: IMetricData
  scenarioB: IMetricData
  startTime?: string
  endTime?: string
}

// 正規化されたデータセット
export interface INormalizedData {
  scenarioId: string
  results: ITestResult[]
  availableParameters: {
    [key: string]: number[]
  }
  availableMetrics: string[]
}