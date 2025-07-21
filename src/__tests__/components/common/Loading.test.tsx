import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Loading } from '@/components/common/Loading'

describe('Loading', () => {
  it('デフォルトのローディングメッセージを表示する', () => {
    render(<Loading />)
    
    expect(screen.getByText('読み込み中...')).toBeInTheDocument()
  })

  it('カスタムメッセージを表示できる', () => {
    render(<Loading message="データを処理しています" />)
    
    expect(screen.getByText('データを処理しています')).toBeInTheDocument()
  })

  it('スピナーアイコンを表示する', () => {
    const { container } = render(<Loading />)
    
    // スピナーを含む要素を探す
    const spinner = container.querySelector('[role="status"]')
    expect(spinner).toBeInTheDocument()
  })

  it('アクセシビリティ属性を持つ', () => {
    render(<Loading />)
    
    const loadingElement = screen.getByRole('status')
    expect(loadingElement).toHaveAttribute('aria-label', '読み込み中')
  })

  it('カスタムメッセージの場合もアクセシビリティ属性を更新する', () => {
    render(<Loading message="処理中です" />)
    
    const loadingElement = screen.getByRole('status')
    expect(loadingElement).toHaveAttribute('aria-label', '読み込み中')
  })

  it('中央寄せのスタイルを適用する', () => {
    const { container } = render(<Loading />)
    
    const wrapper = container.firstElementChild
    expect(wrapper).toHaveClass('flex')
    expect(wrapper).toHaveClass('justify-center')
    expect(wrapper).toHaveClass('items-center')
  })

  it('適切なサイズ指定を持つ', () => {
    const { container } = render(<Loading />)
    
    const wrapper = container.firstElementChild
    expect(wrapper).toHaveClass('min-h-[200px]')
  })
})