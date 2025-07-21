import type {
  ICsvRow,
  IColumnMapping,
  IYamlConfig,
  INormalizedData,
  ITestResult,
  TResultStatus,
} from '@/types'

/**
 * カラムマッピングに基づいてCSVデータを変換
 * @param csvRows 元のCSVデータ
 * @param mapping カラムマッピング設定
 * @returns 変換されたデータ
 */
export function applyColumnMapping(
  csvRows: ICsvRow[],
  mapping: IColumnMapping
): TResultStatus<ICsvRow[]> {
  try {
    const transformedRows = csvRows.map((row) => {
      const transformedRow: ICsvRow = {}

      // マッピングに基づいて変換
      for (const [targetKey, sourceKey] of Object.entries(mapping.mappings)) {
        transformedRow[targetKey] = row[sourceKey] || ''
      }

      return transformedRow
    })

    return {
      success: true,
      data: transformedRows,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error : new Error('Mapping failed'),
    }
  }
}

/**
 * マッピングされたデータを内部データモデルに正規化
 * @param mappedData マッピング済みのデータ
 * @param scenarioId シナリオID
 * @param yamlConfig YAML設定
 * @returns 正規化されたデータ
 */
export function normalizeData(
  mappedData: ICsvRow[],
  scenarioId: string,
  yamlConfig: IYamlConfig
): TResultStatus<INormalizedData> {
  try {
    // シナリオの存在確認
    const scenario = yamlConfig.scenarios.find((s) => s.id === scenarioId)
    if (!scenario) {
      return {
        success: false,
        error: new Error(`Scenario not found: ${scenarioId}`),
      }
    }

    // パラメータ値の収集（重複排除）
    const parameterSets: Record<string, Set<number>> = {
      parameter_1: new Set(),
      parameter_2: new Set(),
      parameter_3: new Set(),
    }

    // テスト結果の変換
    const results: ITestResult[] = mappedData.map((row) => {
      // パラメータの抽出と数値変換
      const parameters: ITestResult['parameters'] = {}
      for (const paramKey of ['parameter_1', 'parameter_2', 'parameter_3']) {
        const value = parseFloat(row[paramKey] || '0')
        parameters[paramKey] = isNaN(value) ? NaN : value
        if (!isNaN(value) && value !== 0) {
          parameterSets[paramKey].add(value)
        }
      }

      // メトリクスの抽出
      const scenarioA: ITestResult['scenarioA'] = {}
      const scenarioB: ITestResult['scenarioB'] = {}

      for (const metric of scenario.metrics) {
        // マッピング後のカラム名を使用
        const aColumnKey = `scenario_a_${metric.id}`
        const bColumnKey = `scenario_b_${metric.id}`
        
        const aValue = parseFloat(row[aColumnKey] || '0')
        const bValue = parseFloat(row[bColumnKey] || '0')
        
        scenarioA[metric.id] = isNaN(aValue) ? NaN : aValue
        scenarioB[metric.id] = isNaN(bValue) ? NaN : bValue
      }

      return {
        testCondition: row.test_condition || '',
        parameters,
        scenarioA,
        scenarioB,
      }
    })

    // パラメータの利用可能な値をソート
    const availableParameters: Record<string, number[]> = {}
    for (const [key, valueSet] of Object.entries(parameterSets)) {
      availableParameters[key] = Array.from(valueSet).sort((a, b) => a - b)
    }

    // 利用可能なメトリクス
    const availableMetrics = scenario.metrics.map((m) => m.id)

    return {
      success: true,
      data: {
        scenarioId,
        results,
        availableParameters,
        availableMetrics,
      },
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error : new Error('Normalization failed'),
    }
  }
}

/**
 * CSVデータをYAML設定に基づいて正規化されたデータに変換
 * @param csvRows CSVデータ
 * @param yamlConfig YAML設定
 * @param scenarioId シナリオID
 * @returns 正規化されたデータ
 */
export function transformCsvToNormalizedData(
  csvRows: ICsvRow[],
  yamlConfig: IYamlConfig,
  scenarioId: string
): TResultStatus<INormalizedData> {
  // まずカラムマッピングを見つける
  const scenario = yamlConfig.scenarios.find(s => s.id === scenarioId)
  if (!scenario) {
    return {
      success: false,
      error: new Error(`Scenario ${scenarioId} not found`),
    }
  }

  const mapping = yamlConfig.column_mappings.find(m => m.file === scenario.file)
  if (!mapping) {
    return {
      success: false,
      error: new Error(`Column mapping for ${scenario.file} not found`),
    }
  }

  // マッピングを適用
  const mappingResult = applyColumnMapping(csvRows, mapping)
  if (!mappingResult.success) {
    return mappingResult
  }

  // 正規化
  return normalizeData(mappingResult.data, scenarioId, yamlConfig)
}