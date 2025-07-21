export interface IScenario {
  id: string
  name: string
  file: string
  description: string
  target_a_name: string
  target_b_name: string
  metrics: IMetric[]
  parameters: Record<string, IParameterDef>
}

export interface IParameterDef {
  name: string
  unit: string
}

export interface IMetric {
  id: string
  name: string
  unit: string
  higher_is_better: boolean
}

export interface IColumnMapping {
  file: string
  mappings: Record<string, string>
}

export interface IYamlConfig {
  title?: string
  description?: string
  scenarios: IScenario[]
  column_mappings: IColumnMapping[]
}