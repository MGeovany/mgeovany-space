import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { ProjectDetailContent } from '@/components/projects/project-detail-content'
import { getProjectById, mergeWithLocalProjects } from '@/data/projects'
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

const baseUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.NODE_ENV === 'production'
    ? 'https://mgeovany.thefndrs.com'
    : 'http://localhost:3000')

export async function generateMetadata({
  params,
}: {
  params: { id: string }
}): Promise<Metadata> {
  const supabase = await createClient()

  const { data } = await supabase
    .from('projects')
    .select('name, summary, motivation, tagline')
    .eq('id', params.id)
    .single()

  const localProject = getProjectById(params.id)

  if (!data && !localProject) {
    return {
      title: 'Project not found',
    }
  }

  const title = data?.name || localProject?.name || 'Project'
  const description =
    data?.summary ||
    data?.tagline ||
    data?.motivation ||
    localProject?.summary ||
    localProject?.tagline ||
    localProject?.motivation ||
    'A project by mgeovany'

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${baseUrl}/projects/${params.id}`,
      siteName: 'mgeovany space',
      type: 'website',
      images: [
        {
          url: `${baseUrl}/static/meta/me.webp`,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [`${baseUrl}/static/meta/me.webp`],
    },
  }
}

export default async function Page({ params }: { params: { id: string } }) {
  const supabase = await createClient()

  const [{ data: projectData, error }, { data: allProjectRows }] =
    await Promise.all([
      supabase.from('projects').select('*').eq('id', params.id).single(),
      supabase
        .from('projects')
        .select('*')
        .neq('status', 'Archived')
        .order('created_at', { ascending: false }),
    ])

  const project =
    projectData == null || error
      ? getProjectById(params.id)
      : dbRowToProject(projectData)

  if (!project) {
    return notFound()
  }

  const dbProjects = (allProjectRows || []).map(dbRowToProject)
  const ids = mergeWithLocalProjects(dbProjects).map(
    (currentProject) => currentProject.id
  )
  const currentIndex = ids.indexOf(params.id)
  const prevId = currentIndex > 0 ? ids[currentIndex - 1] : null
  const nextId =
    currentIndex >= 0 && currentIndex < ids.length - 1
      ? ids[currentIndex + 1]
      : null

  return (
    <ProjectDetailContent project={project} prevId={prevId} nextId={nextId} />
  )
}
