export interface IScenario {
  id: string
  name: string
  file: string
  description: string
  scenario_a_name?: string
  scenario_b_name?: string
}

export interface IMetric {
  id: string
  name: string
  scenario_a_column: string
  scenario_b_column: string
  unit: string
}

export interface IColumnMapping {
  file: string
  mappings: Record<string, string>
}

export interface IYamlConfig {
  scenarios: IScenario[]
  metrics: IMetric[]
  column_mappings: IColumnMapping[]
}