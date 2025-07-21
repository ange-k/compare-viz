import { describe, it, expect } from 'vitest'
import {
  aggregateMetrics,
  calculateDifference,
  calculateImprovementRate,
} from '@/services/aggregation-service'
import type { ITestResult } from '@/types'

describe('集計サービス', () => {
  const mockTestResults: ITestResult[] = [
    {
      testCondition: 'test-1',
      parameters: { parameter_1: 100, parameter_2: 10 },
      scenarioA: { throughput: 1000, latency: 50 },
      scenarioB: { throughput: 1200, latency: 45 },
    },
    {
      testCondition: 'test-2',
      parameters: { parameter_1: 200, parameter_2: 20 },
      scenarioA: { throughput: 2000, latency: 40 },
      scenarioB: { throughput: 2400, latency: 35 },
    },
    {
      testCondition: 'test-3',
      parameters: { parameter_1: 300, parameter_2: 30 },
      scenarioA: { throughput: 3000, latency: 30 },
      scenarioB: { throughput: 3600, latency: 25 },
    },
  ]

  describe('aggregateMetrics', () => {
    it('指定されたメトリクスでテスト結果を集計できる', () => {
      const result = aggregateMetrics(mockTestResults, 'throughput')

      expect(result.success).toBe(true)
      if (result.success) {
        const comparisons = result.data
        expect(comparisons).toHaveLength(3)

        // 最初の結果を検証
        expect(comparisons[0].testCondition).toBe('test-1')
        expect(comparisons[0].scenarioA.value).toBe(1000)
        expect(comparisons[0].scenarioA.label).toBe('シナリオA')
        expect(comparisons[0].scenarioB.value).toBe(1200)
        expect(comparisons[0].scenarioB.label).toBe('シナリオB')
        expect(comparisons[0].difference).toBe(200)
        expect(comparisons[0].improvementRate).toBe(20)
      }
    })

    it('latencyメトリクスで集計する場合、改善率の計算が逆になる', () => {
      const result = aggregateMetrics(mockTestResults, 'latency')

      expect(result.success).toBe(true)
      if (result.success) {
        const comparisons = result.data
        
        // レイテンシーの場合、値が小さい方が良いので改善率の計算が異なる
        // test-1: 50ms -> 45ms = 10%改善
        expect(comparisons[0].scenarioA.value).toBe(50)
        expect(comparisons[0].scenarioB.value).toBe(45)
        expect(comparisons[0].difference).toBe(-5)
        expect(comparisons[0].improvementRate).toBe(10)
      }
    })

    it('空のテスト結果でも正常に処理できる', () => {
      const result = aggregateMetrics([], 'throughput')

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toHaveLength(0)
      }
    })

    it('存在しないメトリクスを指定した場合、undefinedとして処理される', () => {
      const result = aggregateMetrics(mockTestResults, 'non_existent_metric')

      expect(result.success).toBe(true)
      if (result.success) {
        const comparisons = result.data
        expect(comparisons[0].scenarioA.value).toBe(0)
        expect(comparisons[0].scenarioB.value).toBe(0)
        expect(comparisons[0].difference).toBe(0)
        expect(comparisons[0].improvementRate).toBe(0)
      }
    })

    it('NaN値を含むデータを適切に処理する', () => {
      const resultsWithNaN: ITestResult[] = [
        {
          testCondition: 'test-nan',
          parameters: {},
          scenarioA: { throughput: NaN },
          scenarioB: { throughput: 1000 },
        },
      ]

      const result = aggregateMetrics(resultsWithNaN, 'throughput')

      expect(result.success).toBe(true)
      if (result.success) {
        const comparisons = result.data
        expect(comparisons[0].scenarioA.value).toBe(0)
        expect(comparisons[0].scenarioB.value).toBe(1000)
      }
    })
  })

  describe('calculateDifference', () => {
    it('正の差分を計算できる', () => {
      const result = calculateDifference(100, 150)
      expect(result).toBe(50)
    })

    it('負の差分を計算できる', () => {
      const result = calculateDifference(150, 100)
      expect(result).toBe(-50)
    })

    it('同じ値の場合0を返す', () => {
      const result = calculateDifference(100, 100)
      expect(result).toBe(0)
    })

    it('0値を含む計算を処理できる', () => {
      expect(calculateDifference(0, 100)).toBe(100)
      expect(calculateDifference(100, 0)).toBe(-100)
    })
  })

  describe('calculateImprovementRate', () => {
    it('throughputの改善率を計算できる（大きい方が良い）', () => {
      const result = calculateImprovementRate(1000, 1200, 'throughput')
      expect(result).toBe(20) // 20%改善
    })

    it('latencyの改善率を計算できる（小さい方が良い）', () => {
      const result = calculateImprovementRate(50, 45, 'latency')
      expect(result).toBe(10) // 10%改善
    })

    it('error_rateの改善率を計算できる（小さい方が良い）', () => {
      const result = calculateImprovementRate(5, 2.5, 'error_rate')
      expect(result).toBe(50) // 50%改善
    })

    it('ベース値が0の場合、0を返す', () => {
      const result = calculateImprovementRate(0, 100, 'throughput')
      expect(result).toBe(0)
    })

    it('改善がない場合0を返す', () => {
      const result = calculateImprovementRate(100, 100, 'throughput')
      expect(result).toBe(0)
    })

    it('悪化した場合、負の値を返す', () => {
      const result = calculateImprovementRate(1200, 1000, 'throughput')
      expect(result).toBe(-16.67) // 16.67%悪化
    })

    it('小数点以下2桁に丸める', () => {
      const result = calculateImprovementRate(100, 133.333, 'throughput')
      expect(result).toBe(33.33)
    })

    it('未知のメトリクスタイプはthroughputと同じ扱い', () => {
      const result = calculateImprovementRate(100, 150, 'unknown_metric')
      expect(result).toBe(50)
    })
  })
})