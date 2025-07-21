import type { IFlatTestResult } from '@/types'

interface Column {
  key: string
  label: string
  sortable?: boolean
  format?: 'number' | 'decimal' | 'default'
  width?: string
  render?: (value: any, row: IFlatTestResult) => React.ReactNode
}

interface DataTableProps {
  data: IFlatTestResult[]
  columns: Column[]
  highlightRow?: (row: IFlatTestResult) => boolean
  caption?: string
  responsive?: boolean
}

export function DataTable({
  data,
  columns,
  highlightRow,
  caption,
  responsive = false,
}: DataTableProps) {
  const formatValue = (value: any, format?: string): string => {
    if (value == null) return '-'
    
    switch (format) {
      case 'number':
        return typeof value === 'number' 
          ? new Intl.NumberFormat('en-US', { 
              minimumFractionDigits: 2,
              maximumFractionDigits: 2 
            }).format(value)
          : String(value)
      case 'decimal':
        return typeof value === 'number'
          ? new Intl.NumberFormat('en-US', {
              minimumFractionDigits: 4,
              maximumFractionDigits: 4
            }).format(value)
          : String(value)
      default:
        return String(value)
    }
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        データがありません
      </div>
    )
  }

  const tableContent = (
    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
      {caption && (
        <caption className="sr-only">{caption}</caption>
      )}
      <thead className="bg-gray-50 dark:bg-gray-800">
        <tr>
          {columns.map((column) => (
            <th
              key={column.key}
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              style={{ width: column.width }}
              aria-sort={column.sortable ? 'none' : undefined}
            >
              {column.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
        {data.map((row, rowIndex) => (
          <tr 
            key={rowIndex}
            className={`
              ${highlightRow?.(row) ? 'bg-blue-50 dark:bg-blue-900/20' : ''}
              hover:bg-gray-50 dark:hover:bg-gray-800
            `}
          >
            {columns.map((column) => (
              <td
                key={column.key}
                className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100"
              >
                {column.render
                  ? column.render(row[column.key as keyof IFlatTestResult], row)
                  : formatValue(row[column.key as keyof IFlatTestResult], column.format)}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )

  if (responsive) {
    return (
      <div className="overflow-x-auto shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
        {tableContent}
      </div>
    )
  }

  return (
    <div className="shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
      {tableContent}
    </div>
  )
}