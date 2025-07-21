import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from './App'

describe('App', () => {
  it('アプリケーションタイトルが表示される', () => {
    render(<App />)
    expect(screen.getByText('負荷試験データ可視化')).toBeInTheDocument()
  })
})