import Papa from 'papaparse'
import type { ICsvRow, TResultStatus } from '@/types'

/**
 * CSVファイルを読み込んでパースする
 * @param filePath CSVファイルのパス
 * @returns パース結果またはエラー
 */
export async function loadCsvFile(
  filePath: string
): Promise<TResultStatus<ICsvRow[]>> {
  try {
    // CSVファイルをfetch
    const response = await fetch(filePath)
    
    if (!response.ok) {
      return {
        success: false,
        error: new Error(
          `Failed to fetch CSV file: ${response.status} ${response.statusText}`
        ),
      }
    }

    const csvText = await response.text()

    // 空ファイルチェック
    if (!csvText.trim()) {
      return {
        success: false,
        error: new Error('Empty CSV file'),
      }
    }

    // CSVパース
    return parseCsvData(csvText)
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error : new Error('Unknown error'),
    }
  }
}

/**
 * CSV文字列をパースしてオブジェクト配列に変換
 * @param csvText CSV形式の文字列
 * @returns パース結果
 */
export function parseCsvData(csvText: string): TResultStatus<ICsvRow[]> {
  try {
    const parseResult = Papa.parse<ICsvRow>(csvText, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: false, // すべて文字列として扱う
    })

    // データが無い場合のチェックを先に行う
    if (parseResult.data.length === 0) {
      return {
        success: false,
        error: new Error('CSV file has no data rows'),
      }
    }

    // 重大なエラーがある場合はエラーを返す
    if (parseResult.errors.length > 0 && parseResult.data.length === 0) {
      const errorMessages = parseResult.errors
        .map((e) => e.message)
        .join(', ')
      return {
        success: false,
        error: new Error(`CSV parse error: ${errorMessages}`),
      }
    }

    return {
      success: true,
      data: parseResult.data,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error : new Error('Failed to parse CSV'),
    }
  }
}