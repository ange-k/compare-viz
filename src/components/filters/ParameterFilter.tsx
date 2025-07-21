interface ParameterFilterProps {
  label: string
  parameterKey: string
  options: number[]
  selectedValue: number | null
  onChange: (parameterKey: string, value: number | null) => void
  placeholder?: string
}

export function ParameterFilter({
  label,
  parameterKey,
  options,
  selectedValue,
  onChange,
  placeholder = 'すべて',
}: ParameterFilterProps) {
  // オプションをソート
  const sortedOptions = [...options].sort((a, b) => a - b)

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value
    onChange(parameterKey, value === '' ? null : Number(value))
  }

  return (
    <div className="space-y-2">
      <label 
        htmlFor={`filter-${parameterKey}`} 
        className="block text-sm font-medium text-gray-700 dark:text-gray-300"
      >
        {label}
      </label>
      <select
        id={`filter-${parameterKey}`}
        value={selectedValue ?? ''}
        onChange={handleChange}
        disabled={options.length === 0}
        className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:cursor-not-allowed"
      >
        <option value="">{placeholder}</option>
        {sortedOptions.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  )
}