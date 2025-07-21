import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Layout } from '@/components/layout/Layout'

describe('Layout', () => {
  it('タイトルを表示する', () => {
    render(<Layout>Content</Layout>)
    
    expect(screen.getByText('負荷試験データ可視化')).toBeInTheDocument()
  })

  it('子要素を表示する', () => {
    render(
      <Layout>
        <div>Test Content</div>
      </Layout>
    )
    
    expect(screen.getByText('Test Content')).toBeInTheDocument()
  })

  it('適切なレイアウト構造を持つ', () => {
    const { container } = render(
      <Layout>
        <div>Content</div>
      </Layout>
    )
    
    // ヘッダーが存在する
    const header = container.querySelector('header')
    expect(header).toBeInTheDocument()
    
    // メインコンテンツエリアが存在する
    const main = container.querySelector('main')
    expect(main).toBeInTheDocument()
  })

  it('レスポンシブなコンテナクラスを適用する', () => {
    const { container } = render(<Layout>Content</Layout>)
    
    const mainContainer = container.querySelector('main > div')
    expect(mainContainer).toHaveClass('container')
    expect(mainContainer).toHaveClass('mx-auto')
  })

  it('ダークモード対応のクラスを持つ', () => {
    const { container } = render(<Layout>Content</Layout>)
    
    const root = container.firstElementChild
    expect(root).toHaveClass('min-h-screen')
    expect(root).toHaveClass('bg-gray-50')
    expect(root).toHaveClass('dark:bg-gray-900')
  })
})