import yaml from 'js-yaml'
import type { IYamlConfig, TResultStatus } from '@/types'
import { validateYamlConfig } from './yaml-validator'

/**
 * YAMLファイルを読み込んでパースする
 * @param filePath YAMLファイルのパス
 * @returns パース結果またはエラー
 */
export async function loadYamlConfig(
  filePath: string
): Promise<TResultStatus<IYamlConfig>> {
  try {
    // YAMLファイルをfetch
    const response = await fetch(filePath)
    
    if (!response.ok) {
      return {
        success: false,
        error: new Error(
          `Failed to fetch YAML file: ${response.status} ${response.statusText}`
        ),
      }
    }

    const yamlText = await response.text()

    // 空ファイルチェック
    if (!yamlText.trim()) {
      return {
        success: false,
        error: new Error('Empty YAML file'),
      }
    }

    // YAMLパース
    let parsedData: unknown
    try {
      parsedData = yaml.load(yamlText)
    } catch (parseError) {
      return {
        success: false,
        error: new Error(
          `Failed to parse YAML: ${
            parseError instanceof Error ? parseError.message : 'Unknown error'
          }`
        ),
      }
    }

    // バリデーション実行
    const validationResult = validateYamlConfig(parsedData)
    if (!validationResult.success) {
      return validationResult
    }

    return {
      success: true,
      data: validationResult.data,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error : new Error('Unknown error'),
    }
  }
}