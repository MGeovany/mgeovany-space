export type ProjectStatus =
  | 'In production'
  | 'In progress'
  | 'Paused'
  | 'Archived'

export interface ProjectScreenshot {
  src: string
  alt: string
}

export interface ProjectImpactMetric {
  label: string
  value: string
  note?: string
}

export interface ProjectTech {
  stack: string[]
  architecture?: string
  technicalProblemSolved?: string
  keyDecisions?: string[]
  diagram?: {
    title?: string
    lines: string[]
  }
}

export interface ProjectImpact {
  metrics?: ProjectImpactMetric[]
  results?: string[]
  learnings?: string[]
}

export interface ProjectDemoCredentials {
  username?: string
  password?: string
  note?: string
}

export interface Project {
  id: string
  name: string
  motivation: string
  status: ProjectStatus
  summary?: string
  links: {
    code?: string
    live?: string
  }
  tech: ProjectTech
  impact?: ProjectImpact
  screenshots?: ProjectScreenshot[]
  demoCredentials?: ProjectDemoCredentials
  year?: string
}
