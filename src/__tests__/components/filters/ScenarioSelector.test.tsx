import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ScenarioSelector } from '@/components/filters/ScenarioSelector'
import type { IScenario } from '@/types'
import { createMockScenario } from '@/__tests__/test-helpers'

describe('ScenarioSelector', () => {
  const mockScenarios: IScenario[] = [
    createMockScenario({
      id: 'scenario-1',
      name: 'シナリオ1',
      file: 'scenario1.csv',
      description: 'テストシナリオ1の説明',
    }),
    createMockScenario({
      id: 'scenario-2',
      name: 'シナリオ2',
      file: 'scenario2.csv',
      description: 'テストシナリオ2の説明',
    }),
    createMockScenario({
      id: 'scenario-3',
      name: 'シナリオ3',
      file: 'scenario3.csv',
      description: 'テストシナリオ3の説明',
    }),
  ]

  it('シナリオのリストを表示する', () => {
    render(
      <ScenarioSelector
        scenarios={mockScenarios}
        selectedScenario=""
        onScenarioChange={() => {}}
      />
    )

    expect(screen.getByText('シナリオを選択')).toBeInTheDocument()
    expect(screen.getByText('シナリオ1')).toBeInTheDocument()
    expect(screen.getByText('シナリオ2')).toBeInTheDocument()
    expect(screen.getByText('シナリオ3')).toBeInTheDocument()
  })

  it('選択されたシナリオを表示する', () => {
    render(
      <ScenarioSelector
        scenarios={mockScenarios}
        selectedScenario="scenario-2"
        onScenarioChange={() => {}}
      />
    )

    const select = screen.getByRole('combobox')
    expect(select).toHaveValue('scenario-2')
  })

  it('シナリオ選択時にコールバックを実行する', () => {
    const onScenarioChange = vi.fn()
    
    render(
      <ScenarioSelector
        scenarios={mockScenarios}
        selectedScenario=""
        onScenarioChange={onScenarioChange}
      />
    )

    const select = screen.getByRole('combobox')
    fireEvent.change(select, { target: { value: 'scenario-1' } })

    expect(onScenarioChange).toHaveBeenCalledWith('scenario-1')
  })

  it('空のシナリオリストの場合、無効化される', () => {
    render(
      <ScenarioSelector
        scenarios={[]}
        selectedScenario=""
        onScenarioChange={() => {}}
      />
    )

    const select = screen.getByRole('combobox')
    expect(select).toBeDisabled()
  })

  it('プレースホルダーオプションを表示する', () => {
    render(
      <ScenarioSelector
        scenarios={mockScenarios}
        selectedScenario=""
        onScenarioChange={() => {}}
      />
    )

    const placeholderOption = screen.getByText('シナリオを選択してください')
    expect(placeholderOption).toBeInTheDocument()
  })

  it('シナリオの説明をツールチップで表示する', () => {
    render(
      <ScenarioSelector
        scenarios={mockScenarios}
        selectedScenario=""
        onScenarioChange={() => {}}
      />
    )

    // option要素のtitle属性で説明を表示
    const option1 = screen.getByRole('option', { name: 'シナリオ1' })
    expect(option1).toHaveAttribute('title', 'テストシナリオ1の説明')
  })

  it('適切なラベルを持つ', () => {
    render(
      <ScenarioSelector
        scenarios={mockScenarios}
        selectedScenario=""
        onScenarioChange={() => {}}
      />
    )

    const label = screen.getByText('シナリオを選択')
    expect(label).toBeInTheDocument()
    expect(label.tagName).toBe('LABEL')
  })

  it('必須フィールドマークを表示する', () => {
    render(
      <ScenarioSelector
        scenarios={mockScenarios}
        selectedScenario=""
        onScenarioChange={() => {}}
        required
      />
    )

    const requiredMark = screen.getByText('*')
    expect(requiredMark).toBeInTheDocument()
    expect(requiredMark).toHaveClass('text-red-500')
  })
})