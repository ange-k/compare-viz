import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { DataTable } from '@/components/data-display/DataTable'
import type { IFlatTestResult } from '@/types'

describe('DataTable', () => {
  const mockData: IFlatTestResult[] = [
    {
      parameter_1: 100,
      parameter_2: 10,
      parameter_3: 1,
      scenario_a_throughput: 1000,
      scenario_b_throughput: 1200,
      scenario_a_latency: 50,
      scenario_b_latency: 45,
      scenario_a_error_rate: 0.1,
      scenario_b_error_rate: 0.05,
    },
    {
      parameter_1: 200,
      parameter_2: 20,
      parameter_3: 2,
      scenario_a_throughput: 2000,
      scenario_b_throughput: 2400,
      scenario_a_latency: 60,
      scenario_b_latency: 55,
      scenario_a_error_rate: 0.2,
      scenario_b_error_rate: 0.1,
    },
    {
      parameter_1: 300,
      parameter_2: 30,
      parameter_3: 3,
      scenario_a_throughput: 3000,
      scenario_b_throughput: 3600,
      scenario_a_latency: 70,
      scenario_b_latency: 65,
      scenario_a_error_rate: 0.3,
      scenario_b_error_rate: 0.15,
    },
  ]

  const mockColumns = [
    { key: 'parameter_1', label: 'パラメータ1' },
    { key: 'parameter_2', label: 'パラメータ2' },
    { key: 'parameter_3', label: 'パラメータ3' },
    { key: 'scenario_a_throughput', label: 'シナリオA スループット' },
    { key: 'scenario_b_throughput', label: 'シナリオB スループット' },
  ]

  it('テーブルヘッダーを表示する', () => {
    render(
      <DataTable
        data={mockData}
        columns={mockColumns}
      />
    )

    expect(screen.getByText('パラメータ1')).toBeInTheDocument()
    expect(screen.getByText('パラメータ2')).toBeInTheDocument()
    expect(screen.getByText('パラメータ3')).toBeInTheDocument()
    expect(screen.getByText('シナリオA スループット')).toBeInTheDocument()
    expect(screen.getByText('シナリオB スループット')).toBeInTheDocument()
  })

  it('データ行を表示する', () => {
    render(
      <DataTable
        data={mockData}
        columns={mockColumns}
      />
    )

    // 最初の行のデータ
    expect(screen.getByText('100')).toBeInTheDocument()
    expect(screen.getByText('10')).toBeInTheDocument()
    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByText('1000')).toBeInTheDocument()
    expect(screen.getByText('1200')).toBeInTheDocument()

    // 2番目の行のデータ
    expect(screen.getByText('200')).toBeInTheDocument()
    expect(screen.getByText('20')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByText('2000')).toBeInTheDocument()
    expect(screen.getByText('2400')).toBeInTheDocument()
  })

  it('データが空の場合、メッセージを表示する', () => {
    render(
      <DataTable
        data={[]}
        columns={mockColumns}
      />
    )

    expect(screen.getByText('データがありません')).toBeInTheDocument()
  })

  it('数値データを適切にフォーマットする', () => {
    const dataWithDecimals: IFlatTestResult[] = [
      {
        parameter_1: 100,
        parameter_2: 10,
        parameter_3: 1,
        scenario_a_throughput: 1234.5678,
        scenario_b_throughput: 2345.6789,
        scenario_a_latency: 0.123456,
        scenario_b_latency: 0.234567,
        scenario_a_error_rate: 0.1,
        scenario_b_error_rate: 0.05,
      },
    ]

    render(
      <DataTable
        data={dataWithDecimals}
        columns={[
          { key: 'scenario_a_throughput', label: 'スループット A', format: 'number' },
          { key: 'scenario_b_throughput', label: 'スループット B', format: 'number' },
          { key: 'scenario_a_latency', label: 'レイテンシー A', format: 'decimal' },
          { key: 'scenario_b_latency', label: 'レイテンシー B', format: 'decimal' },
        ]}
      />
    )

    // 通常の数値フォーマット（小数点2桁）
    expect(screen.getByText('1,234.57')).toBeInTheDocument()
    expect(screen.getByText('2,345.68')).toBeInTheDocument()
    
    // 小数フォーマット（小数点4桁）
    expect(screen.getByText('0.1235')).toBeInTheDocument()
    expect(screen.getByText('0.2346')).toBeInTheDocument()
  })

  it('カスタムレンダラーを使用できる', () => {
    const columnsWithRenderer = [
      { 
        key: 'parameter_1', 
        label: 'パラメータ1',
        render: (value: any) => `P1: ${value}`
      },
      { 
        key: 'scenario_a_throughput', 
        label: 'スループット A',
        render: (value: any) => `${value} req/s`
      },
    ]

    render(
      <DataTable
        data={mockData.slice(0, 1)}
        columns={columnsWithRenderer}
      />
    )

    expect(screen.getByText('P1: 100')).toBeInTheDocument()
    expect(screen.getByText('1000 req/s')).toBeInTheDocument()
  })

  it('ソート可能な列を示す', () => {
    const sortableColumns = [
      { key: 'parameter_1', label: 'パラメータ1', sortable: true },
      { key: 'parameter_2', label: 'パラメータ2', sortable: false },
    ]

    render(
      <DataTable
        data={mockData}
        columns={sortableColumns}
      />
    )

    const headers = screen.getAllByRole('columnheader')
    expect(headers[0]).toHaveAttribute('aria-sort', 'none')
    expect(headers[1]).not.toHaveAttribute('aria-sort')
  })

  it('行のハイライトをサポートする', () => {
    render(
      <DataTable
        data={mockData}
        columns={mockColumns}
        highlightRow={(row) => row.parameter_1 === 200}
      />
    )

    const rows = screen.getAllByRole('row')
    // ヘッダー行を除く
    expect(rows[2]).toHaveClass('bg-blue-50')
  })

  it('テーブルにアクセシブルな属性を設定する', () => {
    render(
      <DataTable
        data={mockData}
        columns={mockColumns}
        caption="負荷試験結果の比較"
      />
    )

    const table = screen.getByRole('table')
    expect(table).toBeInTheDocument()
    expect(screen.getByText('負荷試験結果の比較')).toBeInTheDocument()
  })

  it('列の幅を指定できる', () => {
    const columnsWithWidth = [
      { key: 'parameter_1', label: 'パラメータ1', width: '100px' },
      { key: 'parameter_2', label: 'パラメータ2', width: '20%' },
    ]

    const { container } = render(
      <DataTable
        data={mockData}
        columns={columnsWithWidth}
      />
    )

    const headers = container.querySelectorAll('th')
    expect(headers[0]).toHaveStyle({ width: '100px' })
    expect(headers[1]).toHaveStyle({ width: '20%' })
  })

  it('レスポンシブデザインをサポートする', () => {
    const { container } = render(
      <DataTable
        data={mockData}
        columns={mockColumns}
        responsive
      />
    )

    const wrapper = container.querySelector('.overflow-x-auto')
    expect(wrapper).toBeInTheDocument()
  })
})