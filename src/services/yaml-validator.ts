import type { IYamlConfig, TResultStatus } from '@/types'

/**
 * YAML設定の妥当性を検証する
 * @param data 検証対象のデータ
 * @returns 検証結果
 */
export function validateYamlConfig(
  data: unknown
): TResultStatus<IYamlConfig> {
  // null/undefinedチェック
  if (data == null) {
    return {
      success: false,
      error: new Error('YAML config is null or undefined'),
    }
  }

  // オブジェクトチェック
  if (typeof data !== 'object') {
    return {
      success: false,
      error: new Error('YAML config must be an object'),
    }
  }

  const config = data as Record<string, unknown>

  // scenariosの検証
  if (!Array.isArray(config.scenarios)) {
    return {
      success: false,
      error: new Error('scenarios must be an array'),
    }
  }

  if (config.scenarios.length === 0) {
    return {
      success: false,
      error: new Error('At least one scenario is required'),
    }
  }

  // シナリオの重複IDチェック
  const scenarioIds = new Set<string>()
  const scenarioFiles = new Set<string>()

  for (const scenario of config.scenarios) {
    if (!isValidScenario(scenario)) {
      return {
        success: false,
        error: new Error(
          `Invalid scenario: missing required fields (id, name, file, description)`
        ),
      }
    }

    if (scenarioIds.has(scenario.id)) {
      return {
        success: false,
        error: new Error(`Duplicate scenario ID: ${scenario.id}`),
      }
    }
    scenarioIds.add(scenario.id)
    scenarioFiles.add(scenario.file)
  }

  // metricsの検証
  if (!Array.isArray(config.metrics)) {
    return {
      success: false,
      error: new Error('metrics must be an array'),
    }
  }

  // メトリクスの重複IDチェック
  const metricIds = new Set<string>()

  for (const metric of config.metrics) {
    if (!isValidMetric(metric)) {
      return {
        success: false,
        error: new Error(
          `Invalid metric: missing required fields (id, name, scenario_a_column, scenario_b_column, unit)`
        ),
      }
    }

    if (metricIds.has(metric.id)) {
      return {
        success: false,
        error: new Error(`Duplicate metric ID: ${metric.id}`),
      }
    }
    metricIds.add(metric.id)
  }

  // column_mappingsの検証
  if (!Array.isArray(config.column_mappings)) {
    return {
      success: false,
      error: new Error('column_mappings must be an array'),
    }
  }

  for (const mapping of config.column_mappings) {
    if (!isValidColumnMapping(mapping)) {
      return {
        success: false,
        error: new Error(
          `Invalid column mapping: missing required fields (file, mappings)`
        ),
      }
    }

    // ファイル参照の妥当性チェック
    if (!scenarioFiles.has(mapping.file)) {
      return {
        success: false,
        error: new Error(
          `Column mapping references non-existent file: ${mapping.file}`
        ),
      }
    }
  }

  return {
    success: true,
    data: config as unknown as IYamlConfig,
  }
}

/**
 * シナリオオブジェクトの妥当性チェック
 */
function isValidScenario(scenario: unknown): scenario is {
  id: string
  name: string
  file: string
  description: string
} {
  if (typeof scenario !== 'object' || scenario === null) {
    return false
  }

  const s = scenario as Record<string, unknown>
  return (
    typeof s.id === 'string' &&
    typeof s.name === 'string' &&
    typeof s.file === 'string' &&
    typeof s.description === 'string'
  )
}

/**
 * メトリクスオブジェクトの妥当性チェック
 */
function isValidMetric(metric: unknown): metric is {
  id: string
  name: string
  scenario_a_column: string
  scenario_b_column: string
  unit: string
} {
  if (typeof metric !== 'object' || metric === null) {
    return false
  }

  const m = metric as Record<string, unknown>
  return (
    typeof m.id === 'string' &&
    typeof m.name === 'string' &&
    typeof m.scenario_a_column === 'string' &&
    typeof m.scenario_b_column === 'string' &&
    typeof m.unit === 'string'
  )
}

/**
 * カラムマッピングオブジェクトの妥当性チェック
 */
function isValidColumnMapping(mapping: unknown): mapping is {
  file: string
  mappings: Record<string, string>
} {
  if (typeof mapping !== 'object' || mapping === null) {
    return false
  }

  const m = mapping as Record<string, unknown>
  return (
    typeof m.file === 'string' &&
    typeof m.mappings === 'object' &&
    m.mappings !== null
  )
}