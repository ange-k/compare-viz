interface ChartAxisSelectorProps {
  selectedAxis: string
  onAxisChange: (axis: string) => void
  parameters: Array<{
    key: string
    name: string
  }>
}

export function ChartAxisSelector({ 
  selectedAxis, 
  onAxisChange, 
  parameters 
}: ChartAxisSelectorProps) {
  return (
    <div className="flex items-center gap-2">
      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
        横軸:
      </label>
      <select
        value={selectedAxis}
        onChange={(e) => onAxisChange(e.target.value)}
        className="
          text-sm
          rounded-md
          border-gray-300
          dark:border-gray-600
          dark:bg-gray-700
          dark:text-gray-300
          focus:ring-blue-500
          focus:border-blue-500
        "
      >
        {parameters.map((param) => (
          <option key={param.key} value={param.key}>
            {param.name}
          </option>
        ))}
      </select>
    </div>
  )
}