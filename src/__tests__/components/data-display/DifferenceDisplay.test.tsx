import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { DifferenceDisplay } from '@/components/data-display/DifferenceDisplay'
import type { IAggregatedComparison } from '@/types'

describe('DifferenceDisplay', () => {
  const mockComparison: IAggregatedComparison = {
    metric_id: 'throughput',
    metric_name: 'スループット',
    unit: 'req/s',
    scenario_a_avg: 1000,
    scenario_b_avg: 1200,
    difference: 200,
    improvement_rate: 20,
  }

  it('メトリクス名を表示する', () => {
    render(<DifferenceDisplay comparison={mockComparison} />)
    
    expect(screen.getByText('スループット')).toBeInTheDocument()
  })

  it('シナリオAとBの平均値を表示する', () => {
    render(<DifferenceDisplay comparison={mockComparison} />)
    
    expect(screen.getByText(/シナリオ A/)).toBeInTheDocument()
    expect(screen.getByText('1,000')).toBeInTheDocument()
    
    expect(screen.getByText(/シナリオ B/)).toBeInTheDocument()
    expect(screen.getByText('1,200')).toBeInTheDocument()
  })

  it('単位を表示する', () => {
    render(<DifferenceDisplay comparison={mockComparison} />)
    
    expect(screen.getAllByText('req/s')).toHaveLength(2)
  })

  it('改善率を表示する', () => {
    render(<DifferenceDisplay comparison={mockComparison} />)
    
    expect(screen.getByText('+20.0%')).toBeInTheDocument()
  })

  it('改善時に緑色のスタイルを適用する', () => {
    render(<DifferenceDisplay comparison={mockComparison} />)
    
    const improvementElement = screen.getByText('+20.0%')
    expect(improvementElement).toHaveClass('text-green-600')
  })

  it('悪化時に赤色のスタイルを適用する', () => {
    const worsening: IAggregatedComparison = {
      ...mockComparison,
      scenario_a_avg: 1200,
      scenario_b_avg: 1000,
      difference: -200,
      improvement_rate: -16.67,
    }
    
    render(<DifferenceDisplay comparison={worsening} />)
    
    const improvementElement = screen.getByText('-16.7%')
    expect(improvementElement).toHaveClass('text-red-600')
  })

  it('変化なしの場合、グレーのスタイルを適用する', () => {
    const noChange: IAggregatedComparison = {
      ...mockComparison,
      scenario_a_avg: 1000,
      scenario_b_avg: 1000,
      difference: 0,
      improvement_rate: 0,
    }
    
    render(<DifferenceDisplay comparison={noChange} />)
    
    const improvementElement = screen.getByText('0.0%')
    expect(improvementElement).toHaveClass('text-gray-600')
  })

  it('差分の絶対値を表示する', () => {
    render(<DifferenceDisplay comparison={mockComparison} />)
    
    expect(screen.getByText(/差分: \+200/)).toBeInTheDocument()
  })

  it('マイナスの差分を正しく表示する', () => {
    const negativeDiff: IAggregatedComparison = {
      ...mockComparison,
      scenario_a_avg: 1200,
      scenario_b_avg: 1000,
      difference: -200,
      improvement_rate: -16.67,
    }
    
    render(<DifferenceDisplay comparison={negativeDiff} />)
    
    expect(screen.getByText(/差分: -200/)).toBeInTheDocument()
  })

  it('小数点を含む値を適切にフォーマットする', () => {
    const decimalValues: IAggregatedComparison = {
      ...mockComparison,
      scenario_a_avg: 1234.5678,
      scenario_b_avg: 2345.6789,
      difference: 1111.1111,
      improvement_rate: 90.0001,
    }
    
    render(<DifferenceDisplay comparison={decimalValues} />)
    
    expect(screen.getByText('1,234.57')).toBeInTheDocument()
    expect(screen.getByText('2,345.68')).toBeInTheDocument()
    expect(screen.getByText('+90.0%')).toBeInTheDocument()
  })

  it('コンパクトモードで表示できる', () => {
    render(<DifferenceDisplay comparison={mockComparison} compact />)
    
    // コンパクトモードでは差分詳細が非表示
    expect(screen.queryByText(/差分:/)).not.toBeInTheDocument()
    
    // 改善率は表示される
    expect(screen.getByText('+20.0%')).toBeInTheDocument()
  })

  it('カスタムラベルを使用できる', () => {
    render(
      <DifferenceDisplay 
        comparison={mockComparison}
        scenarioALabel="ベースライン"
        scenarioBLabel="最適化後"
      />
    )
    
    expect(screen.getByText(/ベースライン/)).toBeInTheDocument()
    expect(screen.getByText(/最適化後/)).toBeInTheDocument()
  })

  it('視覚的な改善インジケーターを表示する', () => {
    render(<DifferenceDisplay comparison={mockComparison} showIndicator />)
    
    // 上向き矢印アイコンが表示される
    const indicator = screen.getByRole('img', { name: '改善' })
    expect(indicator).toBeInTheDocument()
  })

  it('悪化時に下向き矢印を表示する', () => {
    const worsening: IAggregatedComparison = {
      ...mockComparison,
      improvement_rate: -16.67,
    }
    
    render(<DifferenceDisplay comparison={worsening} showIndicator />)
    
    const indicator = screen.getByRole('img', { name: '悪化' })
    expect(indicator).toBeInTheDocument()
  })
})