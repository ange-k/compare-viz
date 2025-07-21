import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MetricSelector } from '@/components/filters/MetricSelector'
import type { IMetric } from '@/types'

describe('MetricSelector', () => {
  const mockMetrics: IMetric[] = [
    {
      id: 'throughput',
      name: 'スループット',
      unit: 'req/s',
      higher_is_better: true,
    },
    {
      id: 'latency',
      name: 'レイテンシー',
      unit: 'ms',
      higher_is_better: false,
    },
    {
      id: 'error_rate',
      name: 'エラー率',
      unit: '%',
      higher_is_better: false,
    },
  ]

  it('メトリクス選択のラベルを表示する', () => {
    render(
      <MetricSelector
        metrics={mockMetrics}
        selectedMetric=""
        onMetricChange={() => {}}
      />
    )

    expect(screen.getByText('メトリクス')).toBeInTheDocument()
  })

  it('利用可能なメトリクスをラジオボタンで表示する', () => {
    render(
      <MetricSelector
        metrics={mockMetrics}
        selectedMetric=""
        onMetricChange={() => {}}
      />
    )

    expect(screen.getByLabelText('スループット')).toBeInTheDocument()
    expect(screen.getByLabelText('レイテンシー')).toBeInTheDocument()
    expect(screen.getByLabelText('エラー率')).toBeInTheDocument()

    // ラジオボタンであることを確認
    const radios = screen.getAllByRole('radio')
    expect(radios).toHaveLength(3)
  })

  it('選択されたメトリクスを表示する', () => {
    render(
      <MetricSelector
        metrics={mockMetrics}
        selectedMetric="latency"
        onMetricChange={() => {}}
      />
    )

    const latencyRadio = screen.getByLabelText('レイテンシー')
    expect(latencyRadio).toBeChecked()

    const throughputRadio = screen.getByLabelText('スループット')
    expect(throughputRadio).not.toBeChecked()
  })

  it('メトリクス選択時にコールバックを実行する', () => {
    const onMetricChange = vi.fn()
    
    render(
      <MetricSelector
        metrics={mockMetrics}
        selectedMetric="throughput"
        onMetricChange={onMetricChange}
      />
    )

    const latencyRadio = screen.getByLabelText('レイテンシー')
    fireEvent.click(latencyRadio)

    expect(onMetricChange).toHaveBeenCalledWith('latency')
  })

  it('単位を表示する', () => {
    render(
      <MetricSelector
        metrics={mockMetrics}
        selectedMetric=""
        onMetricChange={() => {}}
      />
    )

    expect(screen.getByText('(req/s)')).toBeInTheDocument()
    expect(screen.getByText('(ms)')).toBeInTheDocument()
    expect(screen.getByText('(%)')).toBeInTheDocument()
  })

  it('メトリクスが空の場合、メッセージを表示する', () => {
    render(
      <MetricSelector
        metrics={[]}
        selectedMetric=""
        onMetricChange={() => {}}
      />
    )

    expect(screen.getByText('メトリクスがありません')).toBeInTheDocument()
  })

  it('デフォルトで最初のメトリクスが選択される', () => {
    const onMetricChange = vi.fn()
    
    render(
      <MetricSelector
        metrics={mockMetrics}
        selectedMetric=""
        onMetricChange={onMetricChange}
        defaultMetric="throughput"
      />
    )

    const throughputRadio = screen.getByLabelText('スループット')
    expect(throughputRadio).toBeChecked()
  })

  it('各ラジオボタンに適切なname属性を設定する', () => {
    render(
      <MetricSelector
        metrics={mockMetrics}
        selectedMetric=""
        onMetricChange={() => {}}
      />
    )

    const radios = screen.getAllByRole('radio')
    radios.forEach(radio => {
      expect(radio).toHaveAttribute('name', 'metric')
    })
  })

  it('スタイリングクラスが適用される', () => {
    const { container } = render(
      <MetricSelector
        metrics={mockMetrics}
        selectedMetric=""
        onMetricChange={() => {}}
      />
    )

    const fieldset = container.querySelector('fieldset')
    expect(fieldset).toBeInTheDocument()
    expect(fieldset).toHaveClass('space-y-2')
  })
})