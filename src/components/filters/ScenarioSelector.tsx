import type { IScenario } from '@/types'

interface ScenarioSelectorProps {
  scenarios: IScenario[]
  selectedScenario: string
  onScenarioChange: (scenarioId: string) => void
  required?: boolean
}

export function ScenarioSelector({
  scenarios,
  selectedScenario,
  onScenarioChange,
  required = false,
}: ScenarioSelectorProps) {
  return (
    <div className="space-y-2">
      <label htmlFor="scenario-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        シナリオを選択
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <select
        id="scenario-select"
        value={selectedScenario}
        onChange={(e) => onScenarioChange(e.target.value)}
        disabled={scenarios.length === 0}
        className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:cursor-not-allowed"
      >
        <option value="">シナリオを選択してください</option>
        {scenarios.map((scenario) => (
          <option 
            key={scenario.id} 
            value={scenario.id}
            title={scenario.description}
          >
            {scenario.name}
          </option>
        ))}
      </select>
    </div>
  )
}