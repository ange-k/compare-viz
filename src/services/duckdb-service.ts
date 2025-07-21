import * as duckdb from '@duckdb/duckdb-wasm'
import type { INormalizedData, TResultStatus } from '@/types'

// DuckDBインスタンスのシングルトン
let db: duckdb.AsyncDuckDB | null = null
let conn: duckdb.AsyncDuckDBConnection | null = null

/**
 * DuckDBを初期化
 * @returns DuckDBインスタンスまたはエラー
 */
export async function initializeDuckDB(): Promise<
  TResultStatus<duckdb.AsyncDuckDB>
> {
  try {
    // 既に初期化されている場合は既存のインスタンスを返す
    if (db) {
      return { success: true, data: db }
    }

    // WASmバンドルの選択
    const bundle = await duckdb.selectBundle({
      mvp: {
        mainModule: duckdb.getJsDelivrBundles().mvp.mainModule,
        mainWorker: duckdb.getJsDelivrBundles().mvp.mainWorker,
      },
      eh: {
        mainModule: duckdb.getJsDelivrBundles().eh?.mainModule || '',
        mainWorker: duckdb.getJsDelivrBundles().eh?.mainWorker || '',
      },
    })

    // ワーカーの作成（テスト環境では簡略化）
    let worker: Worker
    if (typeof Worker !== 'undefined') {
      try {
        const worker_url = URL.createObjectURL(
          new Blob([`importScripts("${bundle.mainWorker}");`], {
            type: 'text/javascript',
          })
        )
        worker = new Worker(worker_url)
      } catch {
        // テスト環境などでWorkerが作成できない場合はダミーを使用
        worker = {} as Worker
      }
    } else {
      worker = {} as Worker
    }
    const logger = new duckdb.ConsoleLogger()
    
    // DuckDBインスタンスの作成
    db = new duckdb.AsyncDuckDB(logger, worker)
    await db.instantiate(bundle.mainModule)
    
    // 接続の作成
    conn = await db.connect()

    return { success: true, data: db }
  } catch (error) {
    return {
      success: false,
      error: new Error(
        `Failed to initialize DuckDB: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      ),
    }
  }
}

/**
 * 正規化されたデータからDuckDBテーブルを作成
 * @param data 正規化されたデータ
 * @param tableName テーブル名
 * @returns 成功/失敗の結果
 */
export async function createTableFromData(
  data: INormalizedData,
  tableName: string
): Promise<TResultStatus<void>> {
  try {
    if (!db || !conn) {
      return {
        success: false,
        error: new Error('DuckDB is not initialized'),
      }
    }

    // テーブル名のバリデーション
    if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(tableName)) {
      return {
        success: false,
        error: new Error('Invalid table name'),
      }
    }

    // テーブルデータの準備
    const tableData: Record<string, unknown>[] = []
    
    for (const result of data.results) {
      const row: Record<string, unknown> = {
        test_condition: result.testCondition,
        ...result.parameters,
      }

      // シナリオAのメトリクス
      for (const [key, value] of Object.entries(result.scenarioA)) {
        row[`scenario_a_${key}`] = value
      }

      // シナリオBのメトリクス
      for (const [key, value] of Object.entries(result.scenarioB)) {
        row[`scenario_b_${key}`] = value
      }

      tableData.push(row)
    }

    // 既存のテーブルを削除
    await conn.query(`DROP TABLE IF EXISTS ${tableName}`)

    // 空のデータの場合は空のテーブルを作成
    if (tableData.length === 0) {
      await conn.query(`
        CREATE TABLE ${tableName} (
          test_condition VARCHAR,
          parameter_1 DOUBLE,
          parameter_2 DOUBLE,
          parameter_3 DOUBLE
        )
      `)
      return { success: true, data: undefined }
    }

    // テーブルを作成してデータを挿入
    // まずテーブル構造を作成
    const firstRow = tableData[0]
    const columns = Object.keys(firstRow).map(col => {
      const value = firstRow[col]
      const type = typeof value === 'number' ? 'DOUBLE' : 'VARCHAR'
      return `${col} ${type}`
    }).join(', ')
    
    await conn.query(`CREATE TABLE ${tableName} (${columns})`)
    
    // バッチでデータを挿入（メモリ効率のため）
    const batchSize = 100
    for (let i = 0; i < tableData.length; i += batchSize) {
      const batch = tableData.slice(i, i + batchSize)
      const values = batch.map(row => {
        const vals = Object.keys(firstRow).map(col => {
          const val = row[col]
          if (val === null || val === undefined) return 'NULL'
          if (typeof val === 'string') return `'${String(val).replace(/'/g, "''")}'`
          return String(val)
        })
        return `(${vals.join(', ')})`
      }).join(', ')
      
      const cols = Object.keys(firstRow).join(', ')
      await conn.query(`INSERT INTO ${tableName} (${cols}) VALUES ${values}`)
    }

    return { success: true, data: undefined }
  } catch (error) {
    return {
      success: false,
      error: new Error(
        `Failed to create table: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      ),
    }
  }
}

/**
 * SQLクエリを実行
 * @param query SQL文
 * @returns クエリ結果またはエラー
 */
export async function executeQuery<T = unknown>(
  query: string
): Promise<TResultStatus<T[]>> {
  try {
    if (!db || !conn) {
      return {
        success: false,
        error: new Error('DuckDB is not initialized'),
      }
    }

    const result = await conn.query(query)
    const data = result.toArray().map((row) => row.toJSON() as T)

    return { success: true, data }
  } catch (error) {
    return {
      success: false,
      error: new Error(
        `Query execution failed: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      ),
    }
  }
}

/**
 * DuckDBインスタンスを閉じる
 */
export async function closeDuckDB(): Promise<void> {
  try {
    if (conn) {
      await conn.close()
      conn = null
    }
    if (db) {
      await db.terminate()
      db = null
    }
  } catch (error) {
    // エラーは無視（既に閉じられている可能性がある）
    console.error('Error closing DuckDB:', error)
  }
}