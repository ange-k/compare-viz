import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ScenarioDetail } from '@/components/filters/ScenarioDetail'
import type { IScenario } from '@/types'

describe('ScenarioDetail', () => {
  const mockScenario: IScenario = {
    id: 'test-scenario',
    name: 'テストシナリオ',
    file: 'test.csv',
    description: 'これはテストシナリオの詳細な説明です。',
  }

  it('シナリオが選択されていない場合、何も表示しない', () => {
    const { container } = render(<ScenarioDetail scenario={null} />)
    
    expect(container.firstChild).toBeNull()
  })

  it('シナリオ名を表示する', () => {
    render(<ScenarioDetail scenario={mockScenario} />)
    
    expect(screen.getByText('テストシナリオ')).toBeInTheDocument()
  })

  it('シナリオの説明を表示する', () => {
    render(<ScenarioDetail scenario={mockScenario} />)
    
    expect(screen.getByText('これはテストシナリオの詳細な説明です。')).toBeInTheDocument()
  })

  it('ファイル名を表示する', () => {
    render(<ScenarioDetail scenario={mockScenario} />)
    
    expect(screen.getByText('データファイル:')).toBeInTheDocument()
    expect(screen.getByText('test.csv')).toBeInTheDocument()
  })

  it('適切なスタイリングを適用する', () => {
    const { container } = render(<ScenarioDetail scenario={mockScenario} />)
    
    const detailContainer = container.firstElementChild
    expect(detailContainer).toHaveClass('bg-blue-50')
    expect(detailContainer).toHaveClass('border')
    expect(detailContainer).toHaveClass('border-blue-200')
    expect(detailContainer).toHaveClass('rounded-lg')
  })

  it('情報アイコンを表示する', () => {
    const { container } = render(<ScenarioDetail scenario={mockScenario} />)
    
    const infoIcon = container.querySelector('svg')
    expect(infoIcon).toBeInTheDocument()
    expect(infoIcon).toHaveClass('text-blue-500')
  })

  it('長い説明文も適切に表示する', () => {
    const longDescriptionScenario: IScenario = {
      ...mockScenario,
      description: 'これは非常に長い説明文です。'.repeat(20),
    }
    
    render(<ScenarioDetail scenario={longDescriptionScenario} />)
    
    const description = screen.getByText(/これは非常に長い説明文です。/)
    expect(description).toBeInTheDocument()
  })

  it('ダークモード対応のクラスを持つ', () => {
    const { container } = render(<ScenarioDetail scenario={mockScenario} />)
    
    const detailContainer = container.firstElementChild
    expect(detailContainer).toHaveClass('dark:bg-blue-900/20')
    expect(detailContainer).toHaveClass('dark:border-blue-800')
  })
})