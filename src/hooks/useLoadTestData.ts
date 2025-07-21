import { useState, useEffect } from 'react'
import type { IYamlConfig, INormalizedData, IFilter, IFlatTestResult, IAggregatedComparison, IScenario, IMetric } from '@/types'
import { loadYamlConfig } from '@/services/yaml-loader'
import { loadCsvFile } from '@/services/csv-loader'
import { transformCsvToNormalizedData } from '@/services/data-transformer'
import { initializeDuckDB, createTableFromData, executeQuery, closeDuckDB } from '@/services/duckdb-service'
import { generateFilterQuery, extractAvailableFilters } from '@/services/filter-service'
import { prepareChartData } from '@/services/chart-service'

interface UseLoadTestDataReturn {
  config: IYamlConfig | null
  data: INormalizedData | null
  filteredData: IFlatTestResult[]
  chartData: any[]
  comparison: IAggregatedComparison | null
  filter: IFilter
  availableFilters: {
    scenarios: IScenario[]
    parameters: Record<string, number[]>
    metrics: IMetric[]
  }
  loading: boolean
  error: Error | null
  updateFilter: (newFilter: Partial<IFilter>) => void
}

export function useLoadTestData(configPath: string = '/config.yaml'): UseLoadTestDataReturn {
  const [config, setConfig] = useState<IYamlConfig | null>(null)
  const [data, setData] = useState<INormalizedData | null>(null)
  const [filteredData, setFilteredData] = useState<IFlatTestResult[]>([])
  const [chartData, setChartData] = useState<any[]>([])
  const [comparison, setComparison] = useState<IAggregatedComparison | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [filter, setFilter] = useState<IFilter>({
    selectedScenario: '',
    selectedMetric: '',
    parameters: {},
  })

  // 初期データ読み込み
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true)
        setError(null)

        // YAML設定を読み込む
        const yamlResult = await loadYamlConfig(configPath)
        if (!yamlResult.success) {
          throw yamlResult.error
        }
        setConfig(yamlResult.data)

        // 最初のシナリオのCSVを読み込む
        if (yamlResult.data.scenarios.length > 0) {
          const scenario = yamlResult.data.scenarios[0]
          const csvResult = await loadCsvFile(`/${scenario.file}`)
          if (!csvResult.success) {
            throw csvResult.error
          }

          // データを正規化
          const transformResult = transformCsvToNormalizedData(
            csvResult.data,
            yamlResult.data,
            scenario.id
          )
          if (!transformResult.success) {
            throw transformResult.error
          }
          setData(transformResult.data)

          // デフォルトフィルターを設定
          setFilter({
            selectedScenario: scenario.id,
            selectedMetric: yamlResult.data.metrics[0]?.id || '',
            parameters: {},
          })
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'))
      } finally {
        setLoading(false)
      }
    }

    loadInitialData()
  }, [configPath])

  // DuckDBでフィルタリング
  useEffect(() => {
    const filterData = async () => {
      if (!data || !config || !filter.selectedMetric) return

      try {
        // DuckDB初期化
        const dbResult = await initializeDuckDB()
        if (!dbResult.success) {
          throw dbResult.error
        }

        // テーブル作成
        const tableResult = await createTableFromData(data, 'test_data')
        if (!tableResult.success) {
          throw tableResult.error
        }

        // フィルタークエリ生成・実行
        const queryGenResult = generateFilterQuery(filter, 'test_data')
        if (!queryGenResult.success) {
          throw queryGenResult.error
        }
        const queryResult = await executeQuery<IFlatTestResult>(queryGenResult.data)
        if (!queryResult.success) {
          throw queryResult.error
        }

        setFilteredData(queryResult.data)

        // 比較データを計算
        const metric = config.metrics.find(m => m.id === filter.selectedMetric)
        if (metric && queryResult.data.length > 0) {
          // フラットデータから平均値を計算
          const scenarioAKey = `scenario_a_${filter.selectedMetric}` as keyof IFlatTestResult
          const scenarioBKey = `scenario_b_${filter.selectedMetric}` as keyof IFlatTestResult
          
          const scenarioAValues = queryResult.data
            .map(row => row[scenarioAKey] as number)
            .filter(val => typeof val === 'number' && !isNaN(val))
          
          const scenarioBValues = queryResult.data
            .map(row => row[scenarioBKey] as number)
            .filter(val => typeof val === 'number' && !isNaN(val))
          
          if (scenarioAValues.length > 0 && scenarioBValues.length > 0) {
            const scenarioAAvg = scenarioAValues.reduce((a, b) => a + b, 0) / scenarioAValues.length
            const scenarioBAvg = scenarioBValues.reduce((a, b) => a + b, 0) / scenarioBValues.length
            const difference = scenarioBAvg - scenarioAAvg
            const improvementRate = ((scenarioBAvg - scenarioAAvg) / scenarioAAvg) * 100
            
            setComparison({
              metric_id: metric.id,
              metric_name: metric.name,
              unit: metric.unit,
              scenario_a_avg: scenarioAAvg,
              scenario_b_avg: scenarioBAvg,
              difference,
              improvement_rate: improvementRate,
            })
          }
        }

        // チャートデータを準備
        if (queryResult.data.length > 0) {
          const chartResult = prepareChartData(
            queryResult.data as any,
            config.metrics.find(m => m.id === filter.selectedMetric)!,
            'parameter_1'
          )
          if (chartResult.success) {
            setChartData(chartResult.data)
          }
        }
      } catch (err) {
        console.error('Filter error:', err)
      }
    }

    filterData()
  }, [data, config, filter])

  // フィルター更新
  const updateFilter = (newFilter: Partial<IFilter>) => {
    setFilter(prev => ({ ...prev, ...newFilter }))
  }

  // 利用可能なフィルター
  const availableFilters = {
    scenarios: config?.scenarios || [],
    parameters: data ? extractAvailableFilters(data).parameters : {},
    metrics: config?.metrics || [],
  }

  // クリーンアップ
  useEffect(() => {
    return () => {
      closeDuckDB()
    }
  }, [])

  return {
    config,
    data,
    filteredData,
    chartData,
    comparison,
    filter,
    availableFilters,
    loading,
    error,
    updateFilter,
  }
}