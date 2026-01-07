import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { ProjectDetailContent } from '@/components/projects/project-detail-content'
import { createClient } from '@/lib/supabase/server'
import { Project } from '@/types/project'

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
    status: row.status,
    year: row.year || undefined,
    summary: row.summary || undefined,
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

export async function generateMetadata({
  params,
}: {
  params: { id: string }
}): Promise<Metadata> {
  const supabase = await createClient()

  const { data } = await supabase
    .from('projects')
    .select('name, summary, motivation')
    .eq('id', params.id)
    .single()

  if (!data) return { title: 'Project not found' }

  return {
    title: data.name,
    description: data.summary || data.motivation,
  }
}

export default async function Page({ params }: { params: { id: string } }) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', params.id)
    .single()

  if (error || !data) {
    return notFound()
  }

  const project = dbRowToProject(data)

  return <ProjectDetailContent project={project} />
}
