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
      <Layout>
        <Loading />
      </Layout>
    )
  }

  if (error) {
    return (
      <Layout>
        <ErrorDisplay error={error} onRetry={() => window.location.reload()} />
      </Layout>
    )
  }

  const selectedScenario = config?.scenarios.find(s => s.id === filter.selectedScenario)
  const selectedMetric = config?.metrics.find(m => m.id === filter.selectedMetric)

  return (
    <Layout>
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
              label="同時接続数"
              parameterKey="parameter_1"
              options={availableFilters.parameters.parameter_1 || []}
              selectedValue={filter.parameters.parameter_1 || null}
              onChange={(key, value) => 
                updateFilter({ parameters: { ...filter.parameters, [key]: value } })
              }
            />
            
            <ParameterFilter
              label="ワーカースレッド数"
              parameterKey="parameter_2"
              options={availableFilters.parameters.parameter_2 || []}
              selectedValue={filter.parameters.parameter_2 || null}
              onChange={(key, value) => 
                updateFilter({ parameters: { ...filter.parameters, [key]: value } })
              }
            />
            
            <ParameterFilter
              label="バッチサイズ"
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
                scenarioALabel={selectedScenario?.scenario_a_name || 'シナリオ A'}
                scenarioBLabel={selectedScenario?.scenario_b_name || 'シナリオ B'}
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
                    scenario_a: selectedScenario?.scenario_a_name || 'シナリオ A',
                    scenario_b: selectedScenario?.scenario_b_name || 'シナリオ B',
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
                  { key: 'parameter_1', label: '同時接続数' },
                  { key: 'parameter_2', label: 'ワーカースレッド数' },
                  { key: 'parameter_3', label: 'バッチサイズ' },
                  { 
                    key: `scenario_a_${filter.selectedMetric}`,
                    label: `${selectedScenario?.scenario_a_name || 'シナリオ A'} (${selectedMetric?.unit})`,
                    format: 'number'
                  },
                  { 
                    key: `scenario_b_${filter.selectedMetric}`,
                    label: `${selectedScenario?.scenario_b_name || 'シナリオ B'} (${selectedMetric?.unit})`,
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