import { Project, ProjectStatus } from '@/types/project'

export const PROJECT_STATUSES: ProjectStatus[] = [
  'In production',
  'In progress',
  'Paused',
  'Archived',
]

export function getProjectById(id: string) {
  // Projects are now fetched from the database
  // This function is kept for backwards compatibility
  return undefined
}
