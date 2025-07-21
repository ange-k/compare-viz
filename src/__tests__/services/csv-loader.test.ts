import { describe, it, expect, vi } from 'vitest'
import { loadCsvFile, parseCsvData } from '@/services/csv-loader'

// モックCSVデータ
const mockCsvContent = `test_condition,parameter_1,parameter_2,parameter_3,Scenario A - Throughput,Scenario B - Throughput,Scenario A - Latency,Scenario B - Latency
test-1,100,10,1,1000,1200,50,45
test-2,200,20,2,2000,2400,40,35
test-3,300,30,3,3000,3600,30,25`

const mockCsvWithEmptyValues = `test_condition,parameter_1,Scenario A - Throughput,Scenario B - Throughput
test-1,100,1000,
test-2,,2000,2400
test-3,300,,3600`

const mockInvalidCsv = `invalid csv content without proper structure`

describe('CSV読み込み機能', () => {
  describe('loadCsvFile', () => {
    it('正常なCSVファイルを読み込める', async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        text: async () => mockCsvContent,
      } as Response)

      const result = await loadCsvFile('/data.csv')

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toHaveLength(3)
        expect(result.data[0].test_condition).toBe('test-1')
        expect(result.data[0]['Scenario A - Throughput']).toBe('1000')
      }
    })

    it('存在しないファイルの場合エラーを返す', async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      } as Response)

      const result = await loadCsvFile('/not-found.csv')

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.message).toContain('Failed to fetch CSV file')
      }
    })

    it('ネットワークエラーの場合適切なエラーを返す', async () => {
      global.fetch = vi.fn().mockRejectedValueOnce(
        new Error('Network error')
      )

      const result = await loadCsvFile('/data.csv')

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.message).toContain('Network error')
      }
    })

    it('空のCSVファイルの場合エラーを返す', async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        text: async () => '',
      } as Response)

      const result = await loadCsvFile('/empty.csv')

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.message).toContain('Empty CSV file')
      }
    })

    it('不正な形式のCSVの場合エラーを返す', async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        text: async () => mockInvalidCsv,
      } as Response)

      const result = await loadCsvFile('/invalid.csv')

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.message).toContain('CSV file has no data rows')
      }
    })
  })

  describe('parseCsvData', () => {
    it('CSV文字列を正しくパースできる', () => {
      const result = parseCsvData(mockCsvContent)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toHaveLength(3)
        expect(result.data[0]).toEqual({
          test_condition: 'test-1',
          parameter_1: '100',
          parameter_2: '10',
          parameter_3: '1',
          'Scenario A - Throughput': '1000',
          'Scenario B - Throughput': '1200',
          'Scenario A - Latency': '50',
          'Scenario B - Latency': '45',
        })
      }
    })

    it('空の値を含むCSVを正しくパースできる', () => {
      const result = parseCsvData(mockCsvWithEmptyValues)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toHaveLength(3)
        expect(result.data[0]['Scenario B - Throughput']).toBe('')
        expect(result.data[1].parameter_1).toBe('')
        expect(result.data[2]['Scenario A - Throughput']).toBe('')
      }
    })

    it('ヘッダーのみのCSVの場合エラーを返す', () => {
      const headerOnlyCsv = 'col1,col2,col3'
      const result = parseCsvData(headerOnlyCsv)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.message).toContain('no data rows')
      }
    })

    it('改行を含む値を正しくパースできる', () => {
      const csvWithNewlines = `test_condition,description
test-1,"Line 1
Line 2"
test-2,"Single line"`

      const result = parseCsvData(csvWithNewlines)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toHaveLength(2)
        expect(result.data[0].description).toContain('Line 1\nLine 2')
      }
    })

    it('カンマを含む値を正しくパースできる', () => {
      const csvWithCommas = `test_condition,values
test-1,"value1,value2,value3"
test-2,"no commas"`

      const result = parseCsvData(csvWithCommas)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toHaveLength(2)
        expect(result.data[0].values).toBe('value1,value2,value3')
      }
    })
  })
})