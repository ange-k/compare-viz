import { describe, it, expect } from 'vitest'
import type {
  ICsvRow,
  INormalizedData,
  ITestResult,
} from '@/types/csv-data'

describe('CSVデータモデル型定義', () => {
  describe('ICsvRow', () => {
    it('CSVの行データが型定義に適合する', () => {
      const csvRow: ICsvRow = {
        test_condition: 'test-1',
        parameter_1: '100',
        parameter_2: '10',
        parameter_3: '1',
        'Scenario A - Throughput': '1000',
        'Scenario B - Throughput': '1200',
        'Scenario A - Latency': '50',
        'Scenario B - Latency': '45',
        'Scenario A - Error Rate': '0.1',
        'Scenario B - Error Rate': '0.05',
      }

      expect(csvRow.test_condition).toBe('test-1')
      expect(csvRow.parameter_1).toBe('100')
      expect(csvRow['Scenario A - Throughput']).toBe('1000')
    })

    it('動的なカラム名を持つCSVデータが型定義に適合する', () => {
      const csvRow: ICsvRow = {
        custom_column_1: 'value1',
        custom_column_2: 'value2',
      }

      expect(csvRow.custom_column_1).toBe('value1')
      expect(csvRow.custom_column_2).toBe('value2')
    })
  })

  describe('ITestResult', () => {
    it('テスト結果データが型定義に適合する', () => {
      const testResult: ITestResult = {
        testCondition: 'test-1',
        parameters: {
          parameter_1: 100,
          parameter_2: 10,
          parameter_3: 1,
        },
        scenarioA: {
          throughput: 1000,
          latency: 50,
          errorRate: 0.1,
        },
        scenarioB: {
          throughput: 1200,
          latency: 45,
          errorRate: 0.05,
        },
      }

      expect(testResult.testCondition).toBe('test-1')
      expect(testResult.parameters.parameter_1).toBe(100)
      expect(testResult.scenarioA.throughput).toBe(1000)
      expect(testResult.scenarioB.throughput).toBe(1200)
    })

    it('オプショナルなフィールドを持つテスト結果が型定義に適合する', () => {
      const testResult: ITestResult = {
        testCondition: 'test-2',
        parameters: {
          parameter_1: 200,
        },
        scenarioA: {
          throughput: 2000,
        },
        scenarioB: {
          throughput: 2100,
        },
        startTime: '2024-01-01T00:00:00Z',
        endTime: '2024-01-01T01:00:00Z',
      }

      expect(testResult.startTime).toBe('2024-01-01T00:00:00Z')
      expect(testResult.endTime).toBe('2024-01-01T01:00:00Z')
    })
  })

  describe('INormalizedData', () => {
    it('正規化されたデータが型定義に適合する', () => {
      const normalizedData: INormalizedData = {
        scenarioId: 'scenario-a-vs-b',
        results: [
          {
            testCondition: 'test-1',
            parameters: {
              parameter_1: 100,
              parameter_2: 10,
            },
            scenarioA: {
              throughput: 1000,
              latency: 50,
            },
            scenarioB: {
              throughput: 1200,
              latency: 45,
            },
          },
        ],
        availableParameters: {
          parameter_1: [100, 200, 300],
          parameter_2: [10, 20, 30],
          parameter_3: [1, 2, 3],
        },
        availableMetrics: ['throughput', 'latency', 'errorRate'],
      }

      expect(normalizedData.scenarioId).toBe('scenario-a-vs-b')
      expect(normalizedData.results).toHaveLength(1)
      expect(normalizedData.availableParameters.parameter_1).toContain(100)
      expect(normalizedData.availableMetrics).toContain('throughput')
    })
  })
})