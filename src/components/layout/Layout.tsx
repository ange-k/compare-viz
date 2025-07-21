import { ReactNode, useEffect } from 'react'

interface LayoutProps {
  children: ReactNode
  title?: string
  description?: string
}

export function Layout({ children, title = '負荷試験データ可視化', description }: LayoutProps) {
  // ブラウザのタイトルを更新
  useEffect(() => {
    document.title = title
  }, [title])
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {title}
          </h1>
          {description && (
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              {description}
            </p>
          )}
        </div>
      </header>
      
      <main className="py-8">
        <div className="container mx-auto px-4">
          {children}
        </div>
      </main>
    </div>
  )
}