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
 * @param appliedFilters 適用されているフィルタの情報
 * @returns チャートデータ
 */
export function prepareChartData(
  data: any[],
  metric: { id: string; name: string; unit: string },
  groupBy: string,
  appliedFilters?: { parameter_1?: number | null; parameter_2?: number | null; parameter_3?: number | null }
): TResultStatus<any[]> {
  try {
    // フィルタが適用されているパラメータを確認
    const filteredParams = appliedFilters ? Object.entries(appliedFilters)
      .filter(([_, value]) => value !== null && value !== undefined)
      .map(([key, _]) => key) : []

    // グループ化するパラメータがフィルタされている場合の警告（test_conditionは除外）
    if (groupBy !== 'test_condition' && filteredParams.includes(groupBy)) {
      console.warn(`Grouping by ${groupBy} which is already filtered`)
    }

    // パラメータでグループ化
    const grouped = new Map<string, any[]>()
    data.forEach(row => {
      const key = row[groupBy]
      if (key !== undefined && key !== null) {
        const keyStr = key.toString()
        if (!grouped.has(keyStr)) {
          grouped.set(keyStr, [])
        }
        grouped.get(keyStr)!.push(row)
      }
    })

    // グループが1つしかない場合、他のパラメータの組み合わせでグループ化（test_conditionを除く）
    if (groupBy !== 'test_condition' && grouped.size <= 1 && filteredParams.length > 0) {
      // フィルタされていない他のパラメータの値を表示用に使用
      const otherParams = ['parameter_1', 'parameter_2', 'parameter_3']
        .filter(p => p !== groupBy && !filteredParams.includes(p))
      
      if (otherParams.length > 0) {
        // 詳細なラベルを作成
        grouped.clear()
        data.forEach(row => {
          const mainKey = row[groupBy]
          const otherValues = otherParams.map(p => `${p.replace('parameter_', 'P')}=${row[p]}`).join(', ')
          const compositeKey = `${groupBy.replace('parameter_', 'P')}=${mainKey}${otherValues ? ' (' + otherValues + ')' : ''}`
          
          if (!grouped.has(compositeKey)) {
            grouped.set(compositeKey, [])
          }
          grouped.get(compositeKey)!.push(row)
        })
      }
    }

    // 各グループの平均値を計算
    const chartData = Array.from(grouped.entries()).map(([label, rows]) => {
      const scenarioAKey = `scenario_a_${metric.id}`
      const scenarioBKey = `scenario_b_${metric.id}`
      
      const avgA = rows.reduce((sum, row) => sum + (row[scenarioAKey] || 0), 0) / rows.length
      const avgB = rows.reduce((sum, row) => sum + (row[scenarioBKey] || 0), 0) / rows.length
      
      return {
        label,
        scenario_a: avgA,
        scenario_b: avgB,
        _sortKey: groupBy === 'test_condition' ? label : rows[0][groupBy], // ソート用の値を保持
      }
    })

    // ソート処理
    chartData.sort((a, b) => {
      // test_conditionの場合は文字列としてソート
      if (groupBy === 'test_condition') {
        return a.label.localeCompare(b.label)
      }
      // パラメータの場合は数値でソート
      const aNum = Number(a._sortKey)
      const bNum = Number(b._sortKey)
      if (!isNaN(aNum) && !isNaN(bNum)) {
        return aNum - bNum
      }
      return a.label.localeCompare(b.label)
    })

    // ソート用のキーを削除
    chartData.forEach(item => delete item._sortKey)

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