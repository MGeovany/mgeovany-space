export type ProjectStatus =
  | 'In production'
  | 'In progress'
  | 'Paused'
  | 'Archived'

export interface ProjectImpactMetric {
  label: string
  value: string
  note?: string
}

export interface ProjectTradeoff {
  decision: string
  tradeoff: string
}

export interface ProjectStackGroup {
  label: string
  items: string[]
}

export interface ProjectOutcomesChartPoint {
  label: string
  value: number
}

export interface ProjectOutcomes {
  metrics?: ProjectImpactMetric[]
  narrative?: string[]
  chart?: {
    unit?: string
    points: ProjectOutcomesChartPoint[]
  }
}

export interface ProjectTech {
  stack: string[]
  stackGroups?: ProjectStackGroup[]
  architecture?: string
  technicalProblemSolved?: string
  keyDecisions?: string[]
  diagram?: {
    title?: string
    lines: string[]
  }
}

export interface Project {
  id: string
  name: string
  motivation: string
  tagline?: string
  role?: string
  scope?: string
  timeframe?: {
    start?: string
    end?: string
  }
  problem?: string
  solution?: string
  constraints?: string[]
  tradeoffs?: ProjectTradeoff[]
  outcomes?: ProjectOutcomes
  nextSteps?: string[]
  status: ProjectStatus
  summary?: string
  /** Short one-line description for home and list views */
  shortDesc?: string
  /** When true, project is shown on the homepage (/) */
  showOnHome?: boolean
  links: {
    code?: string
    live?: string
  }
  tech: ProjectTech
  year?: string
}
