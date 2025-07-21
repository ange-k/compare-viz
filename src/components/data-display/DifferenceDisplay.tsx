import type { IAggregatedComparison } from '@/types'

interface DifferenceDisplayProps {
  comparison: IAggregatedComparison
  compact?: boolean
  scenarioALabel?: string
  scenarioBLabel?: string
  showIndicator?: boolean
}

export function DifferenceDisplay({
  comparison,
  compact = false,
  scenarioALabel = 'シナリオ A',
  scenarioBLabel = 'シナリオ B',
  showIndicator = false,
}: DifferenceDisplayProps) {
  const formatNumber = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(value)
  }

  const formatPercentage = (value: number): string => {
    const sign = value > 0 ? '+' : value < 0 ? '-' : ''
    const formatted = Math.abs(value).toFixed(1)
    return `${sign}${formatted}%`
  }

  const getColorClass = (rate: number): string => {
    if (rate > 0) return 'text-green-600 dark:text-green-400'
    if (rate < 0) return 'text-red-600 dark:text-red-400'
    return 'text-gray-600 dark:text-gray-400'
  }

  const renderIndicator = () => {
    if (!showIndicator) return null
    
    if (comparison.improvement_rate > 0) {
      return (
        <svg 
          className="w-4 h-4 inline-block ml-1" 
          fill="currentColor" 
          viewBox="0 0 20 20"
          role="img"
          aria-label="改善"
        >
          <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
        </svg>
      )
    }
    
    if (comparison.improvement_rate < 0) {
      return (
        <svg 
          className="w-4 h-4 inline-block ml-1" 
          fill="currentColor" 
          viewBox="0 0 20 20"
          role="img"
          aria-label="悪化"
        >
          <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      )
    }
    
    return null
  }

  if (compact) {
    return (
      <div className="flex items-center gap-4">
        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
          {comparison.metric_name}
        </h3>
        <span className={`text-lg font-semibold ${getColorClass(comparison.improvement_rate)}`}>
          {formatPercentage(comparison.improvement_rate)}
          {renderIndicator()}
        </span>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
        {comparison.metric_name}
      </h3>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">{scenarioALabel}</p>
          <p className="text-xl font-medium text-gray-900 dark:text-gray-100">
            {formatNumber(comparison.scenario_a_avg)} <span className="text-sm text-gray-500">{comparison.unit}</span>
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">{scenarioBLabel}</p>
          <p className="text-xl font-medium text-gray-900 dark:text-gray-100">
            {formatNumber(comparison.scenario_b_avg)} <span className="text-sm text-gray-500">{comparison.unit}</span>
          </p>
        </div>
      </div>
      
      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            差分: {comparison.difference > 0 ? '+' : ''}{formatNumber(comparison.difference)} {comparison.unit}
          </span>
          <span className={`text-2xl font-bold ${getColorClass(comparison.improvement_rate)}`}>
            {formatPercentage(comparison.improvement_rate)}
            {renderIndicator()}
          </span>
        </div>
      </div>
    </div>
  )
}