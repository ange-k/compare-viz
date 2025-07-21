import type { IScenario } from '@/types'

interface ScenarioDetailProps {
  scenario: IScenario | null
}

export function ScenarioDetail({ scenario }: ScenarioDetailProps) {
  if (!scenario) {
    return null
  }

  return (
    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg
            className="h-5 w-5 text-blue-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
            {scenario.name}
          </h3>
          <div className="mt-2 text-sm text-blue-700 dark:text-blue-300">
            <p className="mb-2">{scenario.description}</p>
            <p className="text-xs">
              <span className="font-medium">データファイル:</span>{' '}
              <span className="font-mono">{scenario.file}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}