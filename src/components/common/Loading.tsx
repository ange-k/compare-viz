interface LoadingProps {
  message?: string
}

export function Loading({ message = '読み込み中...' }: LoadingProps) {
  return (
    <div className="flex justify-center items-center min-h-[200px]">
      <div className="text-center" role="status" aria-label="読み込み中">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-400">{message}</p>
      </div>
    </div>
  )
}