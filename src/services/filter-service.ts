import type { INormalizedData, IFilter, TResultStatus } from '@/types'

/**
 * 利用可能なフィルター選択肢を抽出
 */
export interface IAvailableFilters {
  parameters: Record<string, number[]>
  metrics: string[]
  testConditions: string[]
}

/**
 * 正規化されたデータから利用可能なフィルター選択肢を抽出
 * @param data 正規化されたデータ
 * @returns 利用可能なフィルター選択肢
 */
export function extractAvailableFilters(
  data: INormalizedData
): IAvailableFilters {
  try {
    // パラメータの選択肢はすでに抽出済み
    const parameters = data.availableParameters

    // メトリクスの選択肢もすでに抽出済み
    const metrics = data.availableMetrics

    // テスト条件の選択肢を抽出（重複排除）
    const testConditions = Array.from(
      new Set(data.results.map((r) => r.testCondition))
    ).sort()

    return {
      parameters,
      metrics,
      testConditions,
    }
  } catch (error) {
    // エラー時はデフォルト値を返す
    return {
      parameters: {},
      metrics: [],
      testConditions: [],
    }
  }
}

/**
 * フィルター条件に基づいてSQLクエリを生成
 * @param filter フィルター条件
 * @param tableName テーブル名
 * @returns SQLクエリ
 */
export function generateFilterQuery(
  filter: IFilter,
  tableName: string
): TResultStatus<string> {
  try {
    // テーブル名のバリデーション
    if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(tableName)) {
      return {
        success: false,
        error: new Error('Invalid table name'),
      }
    }

    // メトリクスが選択されているかチェック
    if (!filter.selectedMetric) {
      return {
        success: false,
        error: new Error('Metric must be selected'),
      }
    }

    // SELECT句の構築
    const selectColumns = [
      'test_condition',
      'parameter_1',
      'parameter_2',
      'parameter_3',
      `scenario_a_${filter.selectedMetric}`,
      `scenario_b_${filter.selectedMetric}`,
    ]

    let query = `SELECT ${selectColumns.join(', ')} FROM ${tableName}`

    // WHERE句の構築
    const whereConditions: string[] = []
    
    for (const [key, value] of Object.entries(filter.parameters)) {
      if (value !== undefined && value !== null) {
        // 数値型のパラメータとして扱う
        whereConditions.push(`${key} = ${value}`)
      }
    }

    if (whereConditions.length > 0) {
      query += ` WHERE ${whereConditions.join(' AND ')}`
    }

    // ORDER BY句を追加
    query += ' ORDER BY test_condition'

    return {
      success: true,
      data: query,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error : new Error('Failed to generate query'),
    }
  }
}