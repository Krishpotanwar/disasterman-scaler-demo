export interface ZoneObs {
  zone_id: string
  casualties_remaining: number
  supply_gap: number
  severity: number
  road_blocked: boolean
  teams_present: number
  sos_active: boolean
}

export interface Resources {
  teams_available: number
  supply_stock: number
  airlifts_remaining: number
  teams_in_transit: Record<string, number>
}

export interface Observation {
  zones: ZoneObs[]
  resources: Resources
  step_number: number
  steps_remaining: number
  weather: 'clear' | 'storm' | 'flood'
  last_action_result: string
}

export interface Action {
  action: string
  to_zone?: string
  from_zone?: string
  units?: number
  type?: string
}

export interface PyTorchScore {
  zone_id: string
  score: number
  is_false_sos_suspect: boolean
}

export interface Reasoning {
  pytorch_scores: PyTorchScore[]
  triage_summary: string
  plan_decision: string
  action_rationale: string
}

export interface SimStep {
  step: number
  observation: Observation
  action: Action
  reward: number
  reasoning: Reasoning
}

export interface SimResult {
  task_id: string
  agent: string
  final_score: number | null
  cumulative_reward: number
  steps_taken: number
  steps: SimStep[]
  note?: string
}

export interface CompareResult {
  task_id: string
  agents: {
    random?: SimResult
    greedy?: SimResult
    ai_4stage?: SimResult
  }
}

export interface TaskInfo {
  task_id: string
  name: string
  difficulty: string
  max_steps: number
  zones: number
  resources: Record<string, number>
  false_sos_zones: string[]
}
