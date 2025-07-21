import { ReactNode } from 'react'

interface LayoutProps {
  children: ReactNode
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            負荷試験データ可視化
          </h1>
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