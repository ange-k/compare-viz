import { useEffect } from 'react'
import type { IMetric } from '@/types'

interface MetricSelectorProps {
  metrics: IMetric[]
  selectedMetric: string
  onMetricChange: (metricId: string) => void
  defaultMetric?: string
}

export function MetricSelector({
  metrics,
  selectedMetric,
  onMetricChange,
  defaultMetric,
}: MetricSelectorProps) {
  // デフォルトメトリクスの設定
  useEffect(() => {
    if (defaultMetric && !selectedMetric && metrics.some(m => m.id === defaultMetric)) {
      onMetricChange(defaultMetric)
    }
  }, [defaultMetric, selectedMetric, metrics, onMetricChange])

  if (metrics.length === 0) {
    return (
      <div className="space-y-2">
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">メトリクス</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">メトリクスがありません</p>
      </div>
    )
  }

  return (
    <fieldset className="space-y-2">
      <legend className="text-sm font-medium text-gray-700 dark:text-gray-300">
        メトリクス
      </legend>
      <div className="space-y-2">
        {metrics.map((metric) => (
          <label
            key={metric.id}
            className="flex items-center space-x-2 cursor-pointer"
            htmlFor={`metric-${metric.id}`}
          >
            <input
              id={`metric-${metric.id}`}
              type="radio"
              name="metric"
              value={metric.id}
              checked={selectedMetric === metric.id || (!selectedMetric && defaultMetric === metric.id)}
              onChange={(e) => onMetricChange(e.target.value)}
              className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              aria-label={metric.name}
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {metric.name}
              <span className="text-gray-500 dark:text-gray-400 ml-1">
                ({metric.unit})
              </span>
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}