import { describe, it, expect } from 'vitest'
import {
  transformToBarChartData,
  transformToMultiSeriesData,
} from '@/services/chart-service'
import type { IComparison, ITestResult } from '@/types'

describe('チャートサービス', () => {
  const mockComparisons: IComparison[] = [
    {
      testCondition: 'test-1',
      scenarioA: { value: 1000, label: 'シナリオA' },
      scenarioB: { value: 1200, label: 'シナリオB' },
      difference: 200,
      improvementRate: 20,
    },
    {
      testCondition: 'test-2',
      scenarioA: { value: 2000, label: 'シナリオA' },
      scenarioB: { value: 2400, label: 'シナリオB' },
      difference: 400,
      improvementRate: 20,
    },
    {
      testCondition: 'test-3',
      scenarioA: { value: 3000, label: 'シナリオA' },
      scenarioB: { value: 3600, label: 'シナリオB' },
      difference: 600,
      improvementRate: 20,
    },
  ]

  describe('transformToBarChartData', () => {
    it('比較データをバーチャート用データに変換できる', () => {
      const result = transformToBarChartData(mockComparisons, 'req/s')

      expect(result.success).toBe(true)
      if (result.success) {
        const chartData = result.data

        // ラベルの確認
        expect(chartData.labels).toEqual(['test-1', 'test-2', 'test-3'])

        // データセットの確認
        expect(chartData.datasets).toHaveLength(2)

        // シナリオAのデータセット
        expect(chartData.datasets[0].label).toBe('シナリオA')
        expect(chartData.datasets[0].data).toEqual([1000, 2000, 3000])
        expect(chartData.datasets[0].backgroundColor).toBeTruthy()

        // シナリオBのデータセット
        expect(chartData.datasets[1].label).toBe('シナリオB')
        expect(chartData.datasets[1].data).toEqual([1200, 2400, 3600])
        expect(chartData.datasets[1].backgroundColor).toBeTruthy()

        // 単位の確認
        expect(chartData.unit).toBe('req/s')
      }
    })

    it('空の比較データでも正常に処理できる', () => {
      const result = transformToBarChartData([], 'ms')

      expect(result.success).toBe(true)
      if (result.success) {
        const chartData = result.data
        expect(chartData.labels).toEqual([])
        expect(chartData.datasets[0].data).toEqual([])
        expect(chartData.datasets[1].data).toEqual([])
        expect(chartData.unit).toBe('ms')
      }
    })

    it('データセットに異なる色が設定される', () => {
      const result = transformToBarChartData(mockComparisons, 'req/s')

      expect(result.success).toBe(true)
      if (result.success) {
        const chartData = result.data
        const colorA = chartData.datasets[0].backgroundColor
        const colorB = chartData.datasets[1].backgroundColor
        expect(colorA).not.toBe(colorB)
      }
    })

    it('単位が正しく設定される', () => {
      const units = ['req/s', 'ms', '%', 'MB/s']
      
      for (const unit of units) {
        const result = transformToBarChartData(mockComparisons, unit)
        expect(result.success).toBe(true)
        if (result.success) {
          expect(result.data.unit).toBe(unit)
        }
      }
    })
  })

  describe('transformToMultiSeriesData', () => {
    const mockTestResults: ITestResult[] = [
      {
        testCondition: '100-threads',
        parameters: { parameter_1: 100, parameter_2: 10 },
        scenarioA: { throughput: 1000, latency: 50 },
        scenarioB: { throughput: 1200, latency: 45 },
      },
      {
        testCondition: '200-threads',
        parameters: { parameter_1: 200, parameter_2: 10 },
        scenarioA: { throughput: 1800, latency: 60 },
        scenarioB: { throughput: 2200, latency: 55 },
      },
      {
        testCondition: '300-threads',
        parameters: { parameter_1: 300, parameter_2: 10 },
        scenarioA: { throughput: 2500, latency: 70 },
        scenarioB: { throughput: 3000, latency: 65 },
      },
    ]

    it('パラメータ変化による複数系列データを生成できる', () => {
      const result = transformToMultiSeriesData(
        mockTestResults,
        'throughput',
        'parameter_1',
        'req/s'
      )

      expect(result.success).toBe(true)
      if (result.success) {
        const chartData = result.data

        // X軸ラベル（パラメータ値）
        expect(chartData.labels).toEqual(['100', '200', '300'])

        // 2つのデータセット（シナリオA/B）
        expect(chartData.datasets).toHaveLength(2)

        // データポイントの確認
        expect(chartData.datasets[0].data).toEqual([1000, 1800, 2500])
        expect(chartData.datasets[1].data).toEqual([1200, 2200, 3000])
      }
    })

    it('指定されたパラメータでグループ化してソートする', () => {
      // 順序を変えたテスト結果
      const unorderedResults: ITestResult[] = [
        {
          testCondition: 'test-3',
          parameters: { parameter_1: 300 },
          scenarioA: { throughput: 3000 },
          scenarioB: { throughput: 3600 },
        },
        {
          testCondition: 'test-1',
          parameters: { parameter_1: 100 },
          scenarioA: { throughput: 1000 },
          scenarioB: { throughput: 1200 },
        },
        {
          testCondition: 'test-2',
          parameters: { parameter_1: 200 },
          scenarioA: { throughput: 2000 },
          scenarioB: { throughput: 2400 },
        },
      ]

      const result = transformToMultiSeriesData(
        unorderedResults,
        'throughput',
        'parameter_1',
        'req/s'
      )

      expect(result.success).toBe(true)
      if (result.success) {
        // パラメータ値でソートされていることを確認
        expect(result.data.labels).toEqual(['100', '200', '300'])
        expect(result.data.datasets[0].data).toEqual([1000, 2000, 3000])
      }
    })

    it('同じパラメータ値の場合は最初の値を使用する', () => {
      const duplicateResults: ITestResult[] = [
        {
          testCondition: 'test-1a',
          parameters: { parameter_1: 100 },
          scenarioA: { throughput: 1000 },
          scenarioB: { throughput: 1200 },
        },
        {
          testCondition: 'test-1b',
          parameters: { parameter_1: 100 }, // 重複
          scenarioA: { throughput: 1100 },
          scenarioB: { throughput: 1300 },
        },
      ]

      const result = transformToMultiSeriesData(
        duplicateResults,
        'throughput',
        'parameter_1',
        'req/s'
      )

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.labels).toEqual(['100'])
        expect(result.data.datasets[0].data).toEqual([1000]) // 最初の値
        expect(result.data.datasets[1].data).toEqual([1200]) // 最初の値
      }
    })

    it('存在しないメトリクスの場合0として扱う', () => {
      const result = transformToMultiSeriesData(
        mockTestResults,
        'non_existent',
        'parameter_1',
        'unit'
      )

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.datasets[0].data).toEqual([0, 0, 0])
        expect(result.data.datasets[1].data).toEqual([0, 0, 0])
      }
    })

    it('パラメータ値がundefinedの場合スキップする', () => {
      const resultsWithUndefined: ITestResult[] = [
        {
          testCondition: 'test-1',
          parameters: { parameter_1: 100 },
          scenarioA: { throughput: 1000 },
          scenarioB: { throughput: 1200 },
        },
        {
          testCondition: 'test-2',
          parameters: {}, // parameter_1がundefined
          scenarioA: { throughput: 2000 },
          scenarioB: { throughput: 2400 },
        },
      ]

      const result = transformToMultiSeriesData(
        resultsWithUndefined,
        'throughput',
        'parameter_1',
        'req/s'
      )

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.labels).toEqual(['100'])
        expect(result.data.datasets[0].data).toEqual([1000])
      }
    })

    it('空のテスト結果でも正常に処理できる', () => {
      const result = transformToMultiSeriesData([], 'throughput', 'parameter_1', 'req/s')

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.labels).toEqual([])
        expect(result.data.datasets[0].data).toEqual([])
        expect(result.data.datasets[1].data).toEqual([])
      }
    })
  })
})