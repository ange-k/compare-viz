import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ErrorDisplay } from '@/components/common/ErrorDisplay'

describe('ErrorDisplay', () => {
  it('エラーメッセージを表示する', () => {
    const error = new Error('テストエラー')
    render(<ErrorDisplay error={error} />)
    
    expect(screen.getByText('エラーが発生しました')).toBeInTheDocument()
    expect(screen.getByText('テストエラー')).toBeInTheDocument()
  })

  it('リトライボタンを表示する', () => {
    const error = new Error('テストエラー')
    const onRetry = vi.fn()
    
    render(<ErrorDisplay error={error} onRetry={onRetry} />)
    
    const retryButton = screen.getByRole('button', { name: '再試行' })
    expect(retryButton).toBeInTheDocument()
  })

  it('リトライボタンクリックでコールバックを実行する', () => {
    const error = new Error('テストエラー')
    const onRetry = vi.fn()
    
    render(<ErrorDisplay error={error} onRetry={onRetry} />)
    
    const retryButton = screen.getByRole('button', { name: '再試行' })
    fireEvent.click(retryButton)
    
    expect(onRetry).toHaveBeenCalledTimes(1)
  })

  it('onRetryが未定義の場合、リトライボタンを表示しない', () => {
    const error = new Error('テストエラー')
    render(<ErrorDisplay error={error} />)
    
    const retryButton = screen.queryByRole('button', { name: '再試行' })
    expect(retryButton).not.toBeInTheDocument()
  })

  it('エラーアイコンを表示する', () => {
    const error = new Error('テストエラー')
    const { container } = render(<ErrorDisplay error={error} />)
    
    // エラーアイコンのSVGまたは適切なクラスを持つ要素を探す
    const errorIcon = container.querySelector('.text-red-500')
    expect(errorIcon).toBeInTheDocument()
  })

  it('適切なスタイリングを適用する', () => {
    const error = new Error('テストエラー')
    const { container } = render(<ErrorDisplay error={error} />)
    
    const errorContainer = container.firstElementChild
    expect(errorContainer).toHaveClass('bg-red-50')
    expect(errorContainer).toHaveClass('border')
    expect(errorContainer).toHaveClass('border-red-200')
  })

  it('長いエラーメッセージも適切に表示する', () => {
    const longMessage = 'これは非常に長いエラーメッセージです。'.repeat(10)
    const error = new Error(longMessage)
    
    render(<ErrorDisplay error={error} />)
    
    expect(screen.getByText(longMessage)).toBeInTheDocument()
  })

  it('カスタムタイトルを表示できる', () => {
    const error = new Error('テストエラー')
    render(<ErrorDisplay error={error} title="カスタムエラータイトル" />)
    
    expect(screen.getByText('カスタムエラータイトル')).toBeInTheDocument()
  })
})