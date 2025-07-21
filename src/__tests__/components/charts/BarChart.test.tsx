import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BarChart } from '@/components/charts/BarChart'
import type { IChartDataPoint } from '@/types'

// Mock recharts
vi.mock('recharts', () => ({
  BarChart: ({ children, ...props }: any) => (
    <div data-testid="bar-chart" {...props}>{children}</div>
  ),
  Bar: ({ dataKey, fill, name }: any) => (
    <div data-testid={`bar-${dataKey}`} data-fill={fill} data-name={name} />
  ),
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  XAxis: ({ dataKey }: any) => <div data-testid="x-axis" data-key={dataKey} />,
  YAxis: ({ label }: any) => <div data-testid="y-axis">{label?.value}</div>,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
  ResponsiveContainer: ({ children, ...props }: any) => (
    <div data-testid="responsive-container" {...props}>{children}</div>
  ),
}))

describe('BarChart', () => {
  const mockData: IChartDataPoint[] = [
    {
      label: 'Test 1',
      scenario_a: 100,
      scenario_b: 120,
      parameter_1: 10,
      parameter_2: 20,
      parameter_3: 30,
    },
    {
      label: 'Test 2',
      scenario_a: 200,
      scenario_b: 240,
      parameter_1: 20,
      parameter_2: 40,
      parameter_3: 60,
    },
    {
      label: 'Test 3',
      scenario_a: 300,
      scenario_b: 360,
      parameter_1: 30,
      parameter_2: 60,
      parameter_3: 90,
    },
  ]

  it('チャートコンテナをレンダリングする', () => {
    render(
      <BarChart
        data={mockData}
        dataKeys={['scenario_a', 'scenario_b']}
        xAxisKey="label"
        yAxisLabel="Value"
      />
    )

    expect(screen.getByTestId('bar-chart')).toBeInTheDocument()
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument()
  })

  it('指定されたデータキーでバーを表示する', () => {
    render(
      <BarChart
        data={mockData}
        dataKeys={['scenario_a', 'scenario_b']}
        xAxisKey="label"
        yAxisLabel="Value"
      />
    )

    expect(screen.getByTestId('bar-scenario_a')).toBeInTheDocument()
    expect(screen.getByTestId('bar-scenario_b')).toBeInTheDocument()
  })

  it('軸を正しく設定する', () => {
    render(
      <BarChart
        data={mockData}
        dataKeys={['scenario_a', 'scenario_b']}
        xAxisKey="label"
        yAxisLabel="スループット (req/s)"
      />
    )

    const xAxis = screen.getByTestId('x-axis')
    expect(xAxis).toHaveAttribute('data-key', 'label')
    
    const yAxis = screen.getByTestId('y-axis')
    expect(yAxis).toHaveTextContent('スループット (req/s)')
  })

  it('凡例とツールチップを表示する', () => {
    render(
      <BarChart
        data={mockData}
        dataKeys={['scenario_a', 'scenario_b']}
        xAxisKey="label"
        yAxisLabel="Value"
      />
    )

    expect(screen.getByTestId('legend')).toBeInTheDocument()
    expect(screen.getByTestId('tooltip')).toBeInTheDocument()
  })

  it('カスタムカラーを適用する', () => {
    const customColors = {
      scenario_a: '#ff0000',
      scenario_b: '#00ff00',
    }

    render(
      <BarChart
        data={mockData}
        dataKeys={['scenario_a', 'scenario_b']}
        xAxisKey="label"
        yAxisLabel="Value"
        colors={customColors}
      />
    )

    const barA = screen.getByTestId('bar-scenario_a')
    const barB = screen.getByTestId('bar-scenario_b')
    
    expect(barA).toHaveAttribute('data-fill', '#ff0000')
    expect(barB).toHaveAttribute('data-fill', '#00ff00')
  })

  it('カスタムラベルを使用する', () => {
    const customLabels = {
      scenario_a: 'シナリオ A',
      scenario_b: 'シナリオ B',
    }

    render(
      <BarChart
        data={mockData}
        dataKeys={['scenario_a', 'scenario_b']}
        xAxisKey="label"
        yAxisLabel="Value"
        labels={customLabels}
      />
    )

    const barA = screen.getByTestId('bar-scenario_a')
    const barB = screen.getByTestId('bar-scenario_b')
    
    expect(barA).toHaveAttribute('data-name', 'シナリオ A')
    expect(barB).toHaveAttribute('data-name', 'シナリオ B')
  })

  it('データが空の場合、メッセージを表示する', () => {
    render(
      <BarChart
        data={[]}
        dataKeys={['scenario_a', 'scenario_b']}
        xAxisKey="label"
        yAxisLabel="Value"
      />
    )

    expect(screen.getByText('表示するデータがありません')).toBeInTheDocument()
  })

  it('高さを指定できる', () => {
    render(
      <BarChart
        data={mockData}
        dataKeys={['scenario_a', 'scenario_b']}
        xAxisKey="label"
        yAxisLabel="Value"
        height={500}
      />
    )

    const container = screen.getByTestId('responsive-container')
    expect(container).toHaveAttribute('height', '500')
  })

  it('グリッドラインを表示する', () => {
    render(
      <BarChart
        data={mockData}
        dataKeys={['scenario_a', 'scenario_b']}
        xAxisKey="label"
        yAxisLabel="Value"
      />
    )

    expect(screen.getByTestId('cartesian-grid')).toBeInTheDocument()
  })

  it('アクセシブルな属性を設定する', () => {
    render(
      <BarChart
        data={mockData}
        dataKeys={['scenario_a', 'scenario_b']}
        xAxisKey="label"
        yAxisLabel="Value"
        ariaLabel="負荷試験結果の比較チャート"
      />
    )

    const chart = screen.getByRole('img')
    expect(chart).toHaveAttribute('aria-label', '負荷試験結果の比較チャート')
  })
})