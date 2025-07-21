import type { ITestResult, IComparison, TResultStatus } from '@/types'

/**
 * テスト結果を比較データに集計
 * @param results テスト結果の配列
 * @param metric 集計対象のメトリクス
 * @returns 比較データの配列
 */
export function aggregateMetrics(
  results: ITestResult[],
  metric: string
): TResultStatus<IComparison[]> {
  try {
    const comparisons: IComparison[] = results.map((result) => {
      const valueA = result.scenarioA[metric] ?? 0
      const valueB = result.scenarioB[metric] ?? 0

      // NaN値を0に変換
      const normalizedValueA = isNaN(valueA) ? 0 : valueA
      const normalizedValueB = isNaN(valueB) ? 0 : valueB

      const difference = calculateDifference(normalizedValueA, normalizedValueB)
      const improvementRate = calculateImprovementRate(
        normalizedValueA,
        normalizedValueB,
        metric
      )

      return {
        testCondition: result.testCondition,
        scenarioA: {
          value: normalizedValueA,
          label: 'シナリオA',
        },
        scenarioB: {
          value: normalizedValueB,
          label: 'シナリオB',
        },
        difference,
        improvementRate,
      }
    })

    return {
      success: true,
      data: comparisons,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error : new Error('Failed to aggregate metrics'),
    }
  }
}

/**
 * 2つの値の差分を計算
 * @param valueA 値A
 * @param valueB 値B
 * @returns 差分（B - A）
 */
export function calculateDifference(valueA: number, valueB: number): number {
  return valueB - valueA
}

/**
 * 改善率を計算
 * @param valueA ベース値（シナリオA）
 * @param valueB 比較値（シナリオB）
 * @param metric メトリクス名
 * @returns 改善率（%）
 */
export function calculateImprovementRate(
  valueA: number,
  valueB: number,
  metric: string
): number {
  // ベース値が0の場合は改善率を計算できない
  if (valueA === 0) {
    return 0
  }

  // 同じ値の場合は0%
  if (valueA === valueB) {
    return 0
  }

  // メトリクスの種類によって改善の方向が異なる
  const lowerIsBetter = ['latency', 'error_rate', 'errorRate'].includes(metric)

  let improvementRate: number
  if (lowerIsBetter) {
    // 小さい方が良いメトリクス（レイテンシー、エラー率など）
    // 例: 50ms -> 45ms = (50 - 45) / 50 * 100 = 10%改善
    improvementRate = ((valueA - valueB) / valueA) * 100
  } else {
    // 大きい方が良いメトリクス（スループットなど）
    // 例: 1000 -> 1200 = (1200 - 1000) / 1000 * 100 = 20%改善
    improvementRate = ((valueB - valueA) / valueA) * 100
  }

  // 小数点以下2桁に丸める
  return Math.round(improvementRate * 100) / 100
}