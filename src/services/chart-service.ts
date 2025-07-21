import type { IComparison, ITestResult, IChartData, TResultStatus } from '@/types'

// グラフ用の色定義
const CHART_COLORS = {
  scenarioA: '#3b82f6', // Blue
  scenarioB: '#10b981', // Green
}

/**
 * 比較データをバーチャート用データに変換
 * @param comparisons 比較データの配列
 * @param unit 単位
 * @returns チャートデータ
 */
export function transformToBarChartData(
  comparisons: IComparison[],
  unit: string
): TResultStatus<IChartData> {
  try {
    const labels = comparisons.map((c) => c.testCondition)
    const scenarioAData = comparisons.map((c) => c.scenarioA.value)
    const scenarioBData = comparisons.map((c) => c.scenarioB.value)

    const chartData: IChartData = {
      labels,
      datasets: [
        {
          label: 'シナリオA',
          data: scenarioAData,
          backgroundColor: CHART_COLORS.scenarioA,
        },
        {
          label: 'シナリオB',
          data: scenarioBData,
          backgroundColor: CHART_COLORS.scenarioB,
        },
      ],
      unit,
    }

    return {
      success: true,
      data: chartData,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error : new Error('Failed to transform chart data'),
    }
  }
}

/**
 * テスト結果を複数系列データ（パラメータ変化のトレンド）に変換
 * @param results テスト結果の配列
 * @param metric 表示するメトリクス
 * @param parameterKey X軸に使用するパラメータのキー
 * @param unit 単位
 * @returns チャートデータ
 */
export function transformToMultiSeriesData(
  results: ITestResult[],
  metric: string,
  parameterKey: string,
  unit: string
): TResultStatus<IChartData> {
  try {
    // パラメータ値でグループ化（重複排除）
    const parameterMap = new Map<number, ITestResult>()
    
    for (const result of results) {
      const paramValue = result.parameters[parameterKey]
      if (paramValue !== undefined && !isNaN(paramValue)) {
        if (!parameterMap.has(paramValue)) {
          parameterMap.set(paramValue, result)
        }
      }
    }

    // パラメータ値でソート
    const sortedEntries = Array.from(parameterMap.entries()).sort(
      ([a], [b]) => a - b
    )

    const labels = sortedEntries.map(([param]) => param.toString())
    const scenarioAData = sortedEntries.map(
      ([, result]) => result.scenarioA[metric] ?? 0
    )
    const scenarioBData = sortedEntries.map(
      ([, result]) => result.scenarioB[metric] ?? 0
    )

    const chartData: IChartData = {
      labels,
      datasets: [
        {
          label: 'シナリオA',
          data: scenarioAData,
          backgroundColor: CHART_COLORS.scenarioA,
        },
        {
          label: 'シナリオB',
          data: scenarioBData,
          backgroundColor: CHART_COLORS.scenarioB,
        },
      ],
      unit,
    }

    return {
      success: true,
      data: chartData,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error : new Error('Failed to transform multi-series data'),
    }
  }
}

/**
 * フラットデータをチャート用データに変換
 * @param data フラットなテスト結果データ
 * @param metric メトリクス情報
 * @param groupBy グループ化するパラメータ
 * @returns チャートデータ
 */
export function prepareChartData(
  data: any[],
  metric: { id: string; name: string; unit: string },
  groupBy: string
): TResultStatus<any[]> {
  try {
    // パラメータでグループ化
    const grouped = new Map<number, any[]>()
    data.forEach(row => {
      const key = row[groupBy]
      if (!grouped.has(key)) {
        grouped.set(key, [])
      }
      grouped.get(key)!.push(row)
    })

    // 各グループの平均値を計算
    const chartData = Array.from(grouped.entries()).map(([paramValue, rows]) => {
      const scenarioAKey = `scenario_a_${metric.id}`
      const scenarioBKey = `scenario_b_${metric.id}`
      
      const avgA = rows.reduce((sum, row) => sum + (row[scenarioAKey] || 0), 0) / rows.length
      const avgB = rows.reduce((sum, row) => sum + (row[scenarioBKey] || 0), 0) / rows.length
      
      return {
        label: paramValue.toString(),
        scenario_a: avgA,
        scenario_b: avgB,
        [groupBy]: paramValue,
      }
    })

    // ラベルでソート
    chartData.sort((a, b) => Number(a.label) - Number(b.label))

    return {
      success: true,
      data: chartData,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error : new Error('Failed to prepare chart data'),
    }
  }
}