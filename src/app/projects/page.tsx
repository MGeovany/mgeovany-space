import { ProjectsExplorer } from '@/components/projects/projects-explorer'
import { createClient } from '@/lib/supabase/server'
import { Project } from '@/types/project'

// Helper function to convert DB row to Project type
function dbRowToProject(row: any): Project {
  return {
    id: row.id,
    name: row.name,
    motivation: row.motivation,
    status: row.status,
    year: row.year || undefined,
    summary: row.summary || undefined,
    links: {
      code: row.code_link || undefined,
      live: row.live_link || undefined,
    },
    tech: {
      stack: row.tech_stack || [],
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
    impact:
      row.impact_metrics ||
      row.impact_results?.length ||
      row.impact_learnings?.length
        ? {
            metrics: row.impact_metrics || undefined,
            results: row.impact_results || undefined,
            learnings: row.impact_learnings || undefined,
          }
        : undefined,
    screenshots: row.screenshots || undefined,
    demoCredentials: row.demo_credentials || undefined,
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
    return <ProjectsExplorer projects={[]} />
  }

  const projects = (data || []).map(dbRowToProject)

  return <ProjectsExplorer projects={projects} />
}
