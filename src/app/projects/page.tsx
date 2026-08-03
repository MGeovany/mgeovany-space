import { ProjectsExplorer } from '@/components/projects/projects-explorer'
import {
  isPausedProjectName,
  LOCAL_PROJECTS,
  mergeWithLocalProjects,
} from '@/data/projects'
import { createClient } from '@/lib/supabase/server'
import { Project } from '@/types/project'

// Always render fresh so the latest UI is shown
export const dynamic = 'force-dynamic'

// Helper function to convert DB row to Project type
function dbRowToProject(row: any): Project {
  return {
    id: row.id,
    name: row.name,
    motivation: row.motivation,
    tagline: row.tagline || undefined,
    role: row.role || undefined,
    scope: row.scope || undefined,
    timeframe:
      row.timeframe_start || row.timeframe_end
        ? {
            start: row.timeframe_start || undefined,
            end: row.timeframe_end || undefined,
          }
        : undefined,
    problem: row.problem || undefined,
    solution: row.solution || undefined,
    constraints: row.constraints || undefined,
    tradeoffs: row.tradeoffs || undefined,
    outcomes:
      row.outcomes_metrics || row.outcomes_narrative || row.outcomes_chart
        ? {
            metrics: row.outcomes_metrics || undefined,
            narrative: row.outcomes_narrative || undefined,
            chart: row.outcomes_chart || undefined,
          }
        : undefined,
    nextSteps: row.next_steps || undefined,
    status: isPausedProjectName(row.name) ? 'Paused' : row.status,
    year: row.year || undefined,
    summary: row.summary || undefined,
    shortDesc: row.short_desc || undefined,
    showOnHome: Boolean(row.show_on_home),
    links: {
      code: row.code_link || undefined,
      live: row.live_link || undefined,
    },
    tech: {
      stack: row.tech_stack || [],
      stackGroups: row.tech_stack_groups || undefined,
      architecture: row.architecture || undefined,
      technicalProblemSolved: row.technical_problem_solved || undefined,
      keyDecisions: row.key_decisions || undefined,
      diagram:
        row.diagram_title || row.diagram_lines?.length
          ? {
              title: row.diagram_title || undefined,
              lines: row.diagram_lines || [],
            }
          : undefined,
    },
  }
}

export default async function Projects() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .neq('status', 'Archived')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[projects][page] Error:', error)
    return <ProjectsExplorer projects={LOCAL_PROJECTS} />
  }

  const projects = mergeWithLocalProjects((data || []).map(dbRowToProject))

  return <ProjectsExplorer projects={projects} />
}
