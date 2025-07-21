import {
  BarChart as RechartsBarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import type { IChartDataPoint } from '@/types'

interface BarChartProps {
  data: IChartDataPoint[]
  dataKeys: string[]
  xAxisKey: string
  xAxisLabel?: string
  yAxisLabel: string
  colors?: Record<string, string>
  labels?: Record<string, string>
  height?: number
  ariaLabel?: string
}

const DEFAULT_COLORS = {
  scenario_a: '#3B82F6', // blue-500
  scenario_b: '#10B981', // emerald-500
}

export function BarChart({
  data,
  dataKeys,
  xAxisKey,
  xAxisLabel,
  yAxisLabel,
  colors = DEFAULT_COLORS,
  labels = {},
  height = 400,
  ariaLabel,
}: BarChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-96 text-gray-500 dark:text-gray-400">
        表示するデータがありません
      </div>
    )
  }

  return (
    <div role="img" aria-label={ariaLabel}>
      <ResponsiveContainer width="100%" height={height}>
        <RechartsBarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: xAxisLabel ? 50 : 20 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
          <XAxis 
            dataKey={xAxisKey}
            className="text-xs"
            tick={{ fill: 'currentColor' }}
            label={xAxisLabel ? { 
              value: xAxisLabel, 
              position: 'insideBottom',
              offset: -10,
              style: { textAnchor: 'middle', fill: 'currentColor', fontSize: '14px' }
            } : undefined}
          />
          <YAxis 
            label={{ 
              value: yAxisLabel, 
              angle: -90, 
              position: 'insideLeft',
              style: { textAnchor: 'middle', fill: 'currentColor' }
            }}
            className="text-xs"
            tick={{ fill: 'currentColor' }}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: 'var(--tooltip-bg)',
              border: '1px solid var(--tooltip-border)',
              borderRadius: '6px',
            }}
          />
          <Legend 
            wrapperStyle={{
              paddingTop: '20px',
            }}
          />
          {dataKeys.map((key) => (
            <Bar 
              key={key}
              dataKey={key}
              fill={colors[key] || DEFAULT_COLORS[key as keyof typeof DEFAULT_COLORS] || '#94A3B8'}
              name={labels[key] || key}
            />
          ))}
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  )
}