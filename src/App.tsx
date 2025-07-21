import { Layout } from '@/components/layout/Layout'
import { Loading } from '@/components/common/Loading'
import { ErrorDisplay } from '@/components/common/ErrorDisplay'
import { ScenarioSelector } from '@/components/filters/ScenarioSelector'
import { ScenarioDetail } from '@/components/filters/ScenarioDetail'
import { ParameterFilter } from '@/components/filters/ParameterFilter'
import { MetricSelector } from '@/components/filters/MetricSelector'
import { DataTable } from '@/components/data-display/DataTable'
import { BarChart } from '@/components/charts/BarChart'
import { DifferenceDisplay } from '@/components/data-display/DifferenceDisplay'
import { useLoadTestData } from '@/hooks/useLoadTestData'

function App() {
  const {
    config,
    filteredData,
    chartData,
    comparison,
    filter,
    availableFilters,
    loading,
    error,
    updateFilter,
  } = useLoadTestData()

  if (loading) {
    return (
      <Layout title={config?.title} description={config?.description}>
        <Loading />
      </Layout>
    )
  }

  if (error) {
    return (
      <Layout title={config?.title} description={config?.description}>
        <ErrorDisplay error={error} onRetry={() => window.location.reload()} />
      </Layout>
    )
  }

  const selectedScenario = config?.scenarios.find(s => s.id === filter.selectedScenario)
  const selectedMetric = selectedScenario?.metrics.find(m => m.id === filter.selectedMetric)
  
  // パラメータ定義を取得
  const getParameterInfo = (paramKey: string) => {
    return selectedScenario?.parameters?.[paramKey] || { name: paramKey, unit: '' }
  }

  return (
    <Layout title={config?.title} description={config?.description}>
      <div className="space-y-6">
        {/* フィルターセクション */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            フィルター設定
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <ScenarioSelector
              scenarios={availableFilters.scenarios}
              selectedScenario={filter.selectedScenario}
              onScenarioChange={(id) => updateFilter({ selectedScenario: id })}
            />
            
            <ParameterFilter
              label={getParameterInfo('parameter_1').name}
              parameterKey="parameter_1"
              options={availableFilters.parameters.parameter_1 || []}
              selectedValue={filter.parameters.parameter_1 || null}
              onChange={(key, value) => 
                updateFilter({ parameters: { ...filter.parameters, [key]: value } })
              }
            />
            
            <ParameterFilter
              label={getParameterInfo('parameter_2').name}
              parameterKey="parameter_2"
              options={availableFilters.parameters.parameter_2 || []}
              selectedValue={filter.parameters.parameter_2 || null}
              onChange={(key, value) => 
                updateFilter({ parameters: { ...filter.parameters, [key]: value } })
              }
            />
            
            <ParameterFilter
              label={getParameterInfo('parameter_3').name}
              parameterKey="parameter_3"
              options={availableFilters.parameters.parameter_3 || []}
              selectedValue={filter.parameters.parameter_3 || null}
              onChange={(key, value) => 
                updateFilter({ parameters: { ...filter.parameters, [key]: value } })
              }
            />
          </div>

          {selectedScenario && (
            <div className="mt-4">
              <ScenarioDetail scenario={selectedScenario} />
            </div>
          )}
        </div>

        {/* メトリクス選択 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <MetricSelector
            metrics={availableFilters.metrics}
            selectedMetric={filter.selectedMetric}
            onMetricChange={(id) => updateFilter({ selectedMetric: id })}
            defaultMetric={availableFilters.metrics[0]?.id}
          />
        </div>

        {/* 結果表示 */}
        {filteredData.length > 0 && (
          <>
            {/* 比較サマリー */}
            {comparison && (
              <DifferenceDisplay
                comparison={comparison}
                scenarioALabel={selectedScenario?.target_a_name || '対象 A'}
                scenarioBLabel={selectedScenario?.target_b_name || '対象 B'}
                showIndicator
              />
            )}

            {/* グラフ */}
            {chartData.length > 0 && selectedMetric && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  {selectedMetric.name}の比較
                </h3>
                <BarChart
                  data={chartData}
                  dataKeys={['scenario_a', 'scenario_b']}
                  xAxisKey="label"
                  yAxisLabel={`${selectedMetric.name} (${selectedMetric.unit})`}
                  labels={{
                    scenario_a: selectedScenario?.target_a_name || '対象 A',
                    scenario_b: selectedScenario?.target_b_name || '対象 B',
                  }}
                  ariaLabel={`${selectedMetric.name}の比較グラフ`}
                />
              </div>
            )}

            {/* データテーブル */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                詳細データ
              </h3>
              <DataTable
                data={filteredData}
                columns={[
                  { 
                    key: 'parameter_1', 
                    label: `${getParameterInfo('parameter_1').name}${getParameterInfo('parameter_1').unit ? ` (${getParameterInfo('parameter_1').unit})` : ''}`
                  },
                  { 
                    key: 'parameter_2', 
                    label: `${getParameterInfo('parameter_2').name}${getParameterInfo('parameter_2').unit ? ` (${getParameterInfo('parameter_2').unit})` : ''}`
                  },
                  { 
                    key: 'parameter_3', 
                    label: `${getParameterInfo('parameter_3').name}${getParameterInfo('parameter_3').unit ? ` (${getParameterInfo('parameter_3').unit})` : ''}`
                  },
                  { 
                    key: `scenario_a_${filter.selectedMetric}`,
                    label: `${selectedScenario?.target_a_name || '対象 A'} (${selectedMetric?.unit})`,
                    format: 'number'
                  },
                  { 
                    key: `scenario_b_${filter.selectedMetric}`,
                    label: `${selectedScenario?.target_b_name || '対象 B'} (${selectedMetric?.unit})`,
                    format: 'number'
                  },
                ]}
                responsive
              />
            </div>
          </>
        )}

        {filteredData.length === 0 && !loading && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <p className="text-center text-gray-500 dark:text-gray-400">
              フィルター条件に一致するデータがありません
            </p>
          </div>
        )}
      </div>
    </Layout>
  )
}

export default App