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
          `Invalid scenario: missing required fields`
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

    // シナリオ内のメトリクスの検証
    const metricIds = new Set<string>()
    for (const metric of scenario.metrics) {
      if (!isValidMetric(metric)) {
        return {
          success: false,
          error: new Error(
            `Invalid metric in scenario ${scenario.id}: missing required fields`
          ),
        }
      }

      if (metricIds.has(metric.id)) {
        return {
          success: false,
          error: new Error(`Duplicate metric ID in scenario ${scenario.id}: ${metric.id}`),
        }
      }
      metricIds.add(metric.id)
    }

    // パラメータの検証
    if (!isValidParameters(scenario.parameters)) {
      return {
        success: false,
        error: new Error(`Invalid parameters in scenario ${scenario.id}`),
      }
    }
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
  target_a_name: string
  target_b_name: string
  metrics: unknown[]
  parameters: unknown
} {
  if (typeof scenario !== 'object' || scenario === null) {
    return false
  }

  const s = scenario as Record<string, unknown>
  return (
    typeof s.id === 'string' &&
    typeof s.name === 'string' &&
    typeof s.file === 'string' &&
    typeof s.description === 'string' &&
    typeof s.target_a_name === 'string' &&
    typeof s.target_b_name === 'string' &&
    Array.isArray(s.metrics) &&
    s.metrics.length > 0 &&
    typeof s.parameters === 'object' &&
    s.parameters !== null
  )
}

/**
 * メトリクスオブジェクトの妥当性チェック
 */
function isValidMetric(metric: unknown): metric is {
  id: string
  name: string
  unit: string
  higher_is_better: boolean
} {
  if (typeof metric !== 'object' || metric === null) {
    return false
  }

  const m = metric as Record<string, unknown>
  return (
    typeof m.id === 'string' &&
    typeof m.name === 'string' &&
    typeof m.unit === 'string' &&
    typeof m.higher_is_better === 'boolean'
  )
}

/**
 * パラメータオブジェクトの妥当性チェック
 */
function isValidParameters(parameters: unknown): boolean {
  if (typeof parameters !== 'object' || parameters === null) {
    return false
  }

  const params = parameters as Record<string, unknown>
  
  // 各パラメータが正しい形式か確認
  for (const value of Object.values(params)) {
    if (typeof value !== 'object' || value === null) {
      return false
    }
    const param = value as Record<string, unknown>
    if (typeof param.name !== 'string' || typeof param.unit !== 'string') {
      return false
    }
  }

  return true
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