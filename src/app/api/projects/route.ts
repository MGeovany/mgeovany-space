import { NextRequest, NextResponse } from 'next/server'

import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { Project } from '@/types/project'

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status })
}

async function requireAllowedUser(request: NextRequest) {
  const { createServerClient } = await import('@supabase/ssr')
  const { isAllowedEditorEmail } = await import('@/lib/editor/allowed')

  const response = NextResponse.next()

  const authHeader = request.headers.get('authorization')
  const headerToken = authHeader?.replace('Bearer ', '') || null

  const cookieList = request.cookies.getAll()
  const authTokenCookie = cookieList.find((c) => c.name.includes('auth-token'))
  let cookieToken: string | null = null
  if (authTokenCookie) {
    try {
      const parsed = JSON.parse(authTokenCookie.value)
      cookieToken = parsed?.access_token || null
    } catch (e) {
      // Cookie might not be JSON, that's ok
    }
  }

  const accessToken = headerToken || cookieToken

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieList
        },
        setAll(
          cookiesToSet: Array<{ name: string; value: string; options?: any }>
        ) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  if (accessToken && !cookieToken) {
    try {
      const { data: userData, error: tokenError } =
        await supabase.auth.getUser(accessToken)
      if (userData?.user && !tokenError) {
        const email = userData.user.email ?? null
        if (isAllowedEditorEmail(email)) {
          return { ok: true as const, user: userData.user, response }
        }
      }
    } catch (e) {
      console.error(
        '[projects][requireAllowedUser] header token auth failed',
        e
      )
    }
  }

  const {
    data: { session },
  } = await supabase.auth.getSession()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    return { ok: false as const, response: jsonError('Unauthorized', 401) }
  }

  const email = user.email ?? null
  if (!isAllowedEditorEmail(email)) {
    return { ok: false as const, response: jsonError('Forbidden', 403) }
  }

  return { ok: true as const, user, response }
}

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
        : // Back-compat (legacy impact_*)
          row.impact_metrics || row.impact_results || row.impact_learnings
          ? {
              metrics: row.impact_metrics || undefined,
              narrative:
                row.impact_results || row.impact_learnings || undefined,
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

// Helper function to convert Project to DB row
function projectToDbRow(project: Partial<Project>): any {
  return {
    id: project.id,
    name: project.name,
    motivation: project.motivation,
    tagline: project.tagline || null,
    role: project.role || null,
    scope: project.scope || null,
    timeframe_start: project.timeframe?.start || null,
    timeframe_end: project.timeframe?.end || null,
    problem: project.problem || null,
    solution: project.solution || null,
    constraints: project.constraints || [],
    tradeoffs: project.tradeoffs || null,
    outcomes_metrics: project.outcomes?.metrics || null,
    outcomes_narrative: project.outcomes?.narrative || [],
    outcomes_chart: project.outcomes?.chart || null,
    next_steps: project.nextSteps || [],
    tech_stack_groups: project.tech?.stackGroups || null,
    status: project.status,
    year: project.year || null,
    summary: project.summary || null,
    code_link: project.links?.code || null,
    live_link: project.links?.live || null,
    tech_stack: project.tech?.stack || [],
    architecture: project.tech?.architecture || null,
    technical_problem_solved: project.tech?.technicalProblemSolved || null,
    key_decisions: project.tech?.keyDecisions || [],
    diagram_title: project.tech?.diagram?.title || null,
    diagram_lines: project.tech?.diagram?.lines || [],
    // legacy (keep nulls)
    impact_metrics: null,
    impact_results: [],
    impact_learnings: [],
  }
}

export async function GET(request: NextRequest) {
  const supabase = await createClient()

  // Filter out archived projects by default, unless ?includeArchived=true
  const includeArchived =
    request.nextUrl.searchParams.get('includeArchived') === 'true'

  let query = supabase.from('projects').select('*').order('created_at', {
    ascending: false,
  })

  if (!includeArchived) {
    query = query.neq('status', 'Archived')
  }

  const { data, error } = await query

  if (error) {
    console.error('[projects][GET] Error:', error)
    return jsonError('Failed to fetch projects', 500)
  }

  const projects = (data || []).map(dbRowToProject)

  return NextResponse.json({ data: projects })
}

export async function POST(request: NextRequest) {
  const auth = await requireAllowedUser(request)
  if (!auth.ok) return auth.response

  const body = await request.json().catch(() => null)
  if (!body) return jsonError('Invalid request body', 400)

  const {
    name,
    id,
    motivation,
    tagline,
    role,
    scope,
    timeframe,
    problem,
    solution,
    constraints,
    tradeoffs,
    outcomes,
    nextSteps,
    status,
    year,
    summary,
    links,
    tech,
  } = body

  if (!name || !id || !motivation || !status) {
    return jsonError(
      'Missing required fields: name, id, motivation, status',
      400
    )
  }

  // Use admin client for write operations (bypasses RLS after auth check)
  const admin = createAdminClient()

  // Check if project with same ID already exists
  const { data: existingProject } = await admin
    .from('projects')
    .select('id')
    .eq('id', id)
    .single()

  if (existingProject) {
    return jsonError('Project with this ID already exists', 400)
  }

  const newProject: Project = {
    id,
    name,
    motivation,
    tagline: tagline || undefined,
    role: role || undefined,
    scope: scope || undefined,
    timeframe: timeframe || undefined,
    problem: problem || undefined,
    solution: solution || undefined,
    constraints: constraints || undefined,
    tradeoffs: tradeoffs || undefined,
    outcomes: outcomes || undefined,
    nextSteps: nextSteps || undefined,
    status,
    year: year || undefined,
    summary: summary || undefined,
    links: {
      code: links?.code || undefined,
      live: links?.live || undefined,
    },
    tech: {
      stack: tech?.stack || [],
      stackGroups: tech?.stackGroups || undefined,
      architecture: tech?.architecture || undefined,
      technicalProblemSolved: tech?.technicalProblemSolved || undefined,
      keyDecisions: tech?.keyDecisions || undefined,
      diagram: tech?.diagram || undefined,
    },
  }

  const dbRow = projectToDbRow(newProject)

  const { data, error } = await admin.from('projects').insert(dbRow).select()

  if (error) {
    console.error('[projects][POST] Error:', error)
    return jsonError('Failed to create project', 500)
  }

  const createdProject = dbRowToProject(data[0])

  return NextResponse.json({ data: createdProject }, { status: 201 })
}
