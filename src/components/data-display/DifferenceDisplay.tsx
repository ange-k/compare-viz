import type { IAggregatedComparison } from '@/types'

interface DifferenceDisplayProps {
  comparison: IAggregatedComparison
  compact?: boolean
  scenarioALabel?: string
  scenarioBLabel?: string
  showIndicator?: boolean
  higherIsBetter?: boolean
}

export function DifferenceDisplay({
  comparison,
  compact = false,
  scenarioALabel = 'シナリオ A',
  scenarioBLabel = 'シナリオ B',
  showIndicator = false,
  higherIsBetter = true,
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

  // 改善かどうかを判定（higher_is_betterを考慮）
  const isImprovement = higherIsBetter 
    ? comparison.scenario_b_avg > comparison.scenario_a_avg
    : comparison.scenario_b_avg < comparison.scenario_a_avg

  const getColorClass = (isImprovement: boolean): string => {
    if (comparison.scenario_b_avg === comparison.scenario_a_avg) {
      return 'text-gray-600 dark:text-gray-400'
    }
    return isImprovement 
      ? 'text-green-600 dark:text-green-400' 
      : 'text-red-600 dark:text-red-400'
  }

  const getImprovementText = (): string => {
    if (comparison.scenario_b_avg === comparison.scenario_a_avg) {
      return '変化なし'
    }
    return isImprovement ? '改善' : '悪化'
  }

  const renderIndicator = () => {
    if (!showIndicator) return null
    
    if (comparison.scenario_b_avg === comparison.scenario_a_avg) {
      return null
    }

    if (isImprovement) {
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

  // より良い値を強調表示
  const getValueClass = (isA: boolean): string => {
    if (comparison.scenario_a_avg === comparison.scenario_b_avg) {
      return 'text-gray-900 dark:text-gray-100'
    }
    const isBetter = higherIsBetter 
      ? (isA ? comparison.scenario_a_avg > comparison.scenario_b_avg : comparison.scenario_b_avg > comparison.scenario_a_avg)
      : (isA ? comparison.scenario_a_avg < comparison.scenario_b_avg : comparison.scenario_b_avg < comparison.scenario_a_avg)
    
    return isBetter 
      ? 'text-green-600 dark:text-green-400 font-bold' 
      : 'text-gray-900 dark:text-gray-100'
  }

  if (compact) {
    return (
      <div className="flex items-center gap-4">
        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
          {comparison.metric_name}
        </h3>
        <span className={`text-lg font-semibold ${getColorClass(isImprovement)}`}>
          {formatPercentage(Math.abs(comparison.improvement_rate))}
          {renderIndicator()}
        </span>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {comparison.metric_name}の比較
        </h3>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {higherIsBetter ? '高い値が良い' : '低い値が良い'}
        </span>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{scenarioALabel}</p>
          <p className={`text-2xl font-medium ${getValueClass(true)}`}>
            {formatNumber(comparison.scenario_a_avg)}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{comparison.unit}</p>
        </div>
        <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{scenarioBLabel}</p>
          <p className={`text-2xl font-medium ${getValueClass(false)}`}>
            {formatNumber(comparison.scenario_b_avg)}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{comparison.unit}</p>
        </div>
      </div>
      
      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {scenarioBLabel}は{scenarioALabel}と比較して
            </span>
            <p className="text-lg font-medium mt-1">
              <span className={getColorClass(isImprovement)}>
                {Math.abs(comparison.difference)} {comparison.unit} 
                {comparison.scenario_b_avg > comparison.scenario_a_avg ? '増加' : '減少'}
              </span>
            </p>
          </div>
          <div className="text-right">
            <span className={`text-2xl font-bold ${getColorClass(isImprovement)}`}>
              {formatPercentage(Math.abs(comparison.improvement_rate))}
            </span>
            <p className={`text-sm font-medium ${getColorClass(isImprovement)}`}>
              {getImprovementText()}
              {renderIndicator()}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}