import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ParameterFilter } from '@/components/filters/ParameterFilter'

describe('ParameterFilter', () => {
  const mockParameterOptions = [100, 200, 300, 400, 500]

  it('パラメータ名とラベルを表示する', () => {
    render(
      <ParameterFilter
        label="パラメータ1"
        parameterKey="parameter_1"
        options={mockParameterOptions}
        selectedValue={null}
        onChange={() => {}}
      />
    )

    expect(screen.getByText('パラメータ1')).toBeInTheDocument()
  })

  it('選択可能なオプションを表示する', () => {
    render(
      <ParameterFilter
        label="パラメータ1"
        parameterKey="parameter_1"
        options={mockParameterOptions}
        selectedValue={null}
        onChange={() => {}}
      />
    )

    const select = screen.getByRole('combobox')
    expect(select).toBeInTheDocument()
    
    // オプション数の確認（プレースホルダー + 実際のオプション）
    const options = screen.getAllByRole('option')
    expect(options).toHaveLength(mockParameterOptions.length + 1)
    
    // 各オプションの値を確認
    expect(screen.getByRole('option', { name: '100' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: '200' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: '300' })).toBeInTheDocument()
  })

  it('選択された値を表示する', () => {
    render(
      <ParameterFilter
        label="パラメータ1"
        parameterKey="parameter_1"
        options={mockParameterOptions}
        selectedValue={200}
        onChange={() => {}}
      />
    )

    const select = screen.getByRole('combobox')
    expect(select).toHaveValue('200')
  })

  it('値選択時にコールバックを実行する', () => {
    const onChange = vi.fn()
    
    render(
      <ParameterFilter
        label="パラメータ1"
        parameterKey="parameter_1"
        options={mockParameterOptions}
        selectedValue={null}
        onChange={onChange}
      />
    )

    const select = screen.getByRole('combobox')
    fireEvent.change(select, { target: { value: '300' } })

    expect(onChange).toHaveBeenCalledWith('parameter_1', 300)
  })

  it('すべてを選択するオプションがある', () => {
    render(
      <ParameterFilter
        label="パラメータ1"
        parameterKey="parameter_1"
        options={mockParameterOptions}
        selectedValue={null}
        onChange={() => {}}
      />
    )

    expect(screen.getByText('すべて')).toBeInTheDocument()
  })

  it('空の値を選択するとnullで通知する', () => {
    const onChange = vi.fn()
    
    render(
      <ParameterFilter
        label="パラメータ1"
        parameterKey="parameter_1"
        options={mockParameterOptions}
        selectedValue={200}
        onChange={onChange}
      />
    )

    const select = screen.getByRole('combobox')
    fireEvent.change(select, { target: { value: '' } })

    expect(onChange).toHaveBeenCalledWith('parameter_1', null)
  })

  it('オプションが空の場合、セレクトボックスを無効化する', () => {
    render(
      <ParameterFilter
        label="パラメータ1"
        parameterKey="parameter_1"
        options={[]}
        selectedValue={null}
        onChange={() => {}}
      />
    )

    const select = screen.getByRole('combobox')
    expect(select).toBeDisabled()
  })

  it('オプションをソートして表示する', () => {
    const unsortedOptions = [300, 100, 500, 200, 400]
    
    render(
      <ParameterFilter
        label="パラメータ1"
        parameterKey="parameter_1"
        options={unsortedOptions}
        selectedValue={null}
        onChange={() => {}}
      />
    )

    const options = screen.getAllByRole('option')
    // 最初は「すべて」オプション
    expect(options[0]).toHaveTextContent('すべて')
    // その後はソートされた値
    expect(options[1]).toHaveTextContent('100')
    expect(options[2]).toHaveTextContent('200')
    expect(options[3]).toHaveTextContent('300')
    expect(options[4]).toHaveTextContent('400')
    expect(options[5]).toHaveTextContent('500')
  })

  it('カスタムプレースホルダーを設定できる', () => {
    render(
      <ParameterFilter
        label="パラメータ1"
        parameterKey="parameter_1"
        options={mockParameterOptions}
        selectedValue={null}
        onChange={() => {}}
        placeholder="選択してください"
      />
    )

    expect(screen.getByText('選択してください')).toBeInTheDocument()
  })
})