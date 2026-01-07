import { ArrowLeft, ExternalLink, GlobeIcon } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { GithubIcon } from '@/components/icons/shared'
import { StackBadges, StatusBadge } from '@/components/projects/project-ui'
import { createClient } from '@/lib/supabase/server'
import { Project } from '@/types/project'

function formatLinkLabel(url: string) {
  try {
    const u = new URL(url)
    const hostname = u.hostname.replace('www.', '')
    if (hostname === 'github.com') {
      const path = u.pathname.replace(/\/+$/, '')
      return `github.com${path}`
    }
    return hostname
  } catch {
    return url
  }
}

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

  const { code, live } = project.links
  const codeLabel = code ? formatLinkLabel(code) : null
  const liveLabel = live ? formatLinkLabel(live) : null

  return (
    <div className="relative flex h-full max-h-screen w-full flex-col overflow-y-auto bg-neutral-950">
      <div className="mx-auto w-full max-w-4xl px-4 py-10 md:px-8">
        <div className="mb-6 flex items-center gap-3">
          <Link
            href="/projects"
            className="flex items-center justify-center rounded-md p-2 text-primary hover:bg-neutral-900"
          >
            <ArrowLeft size={16} className="text-primary" />
          </Link>
        </div>
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-start gap-2">
              <h1 className="text-3xl font-extrabold tracking-tight text-primary">
                {project.name}
              </h1>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={project.status} />
            </div>
          </div>
        </div>
        <section className="mt-8 rounded-2xl border border-neutral-800 bg-neutral-950 p-6 shadow-xs">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-bold text-primary">Motivation</p>
              <p className="text-tertiary mt-1 text-sm">
                Why this project exists and what it tries to solve.
              </p>
            </div>
          </div>
          <p className="text-md mt-4 leading-loose text-secondary">
            {project.motivation}
          </p>
        </section>

        {project.summary ? (
          <div className="mt-8 rounded-2xl border border-neutral-800 bg-neutral-950 p-6 shadow-xs">
            <p className="text-sm font-bold text-primary">Summary</p>
            <p className="text-md mt-2 leading-loose text-secondary">
              {project.summary}
            </p>
          </div>
        ) : null}

        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
          <section className="rounded-2xl border border-neutral-800 bg-neutral-950 p-6 shadow-xs">
            <h2 className="text-sm font-extrabold text-primary">
              Tech & Architecture
            </h2>
            <p className="text-tertiary mt-1 text-sm">
              Stack, architecture, and decisions.
            </p>

            <div className="mt-4">
              <p className="text-tertiary text-xs font-semibold uppercase tracking-wide">
                Stack
              </p>
              <div className="mt-2">
                <StackBadges stack={project.tech.stack} />
              </div>
            </div>

            {project.tech.architecture ? (
              <div className="mt-5">
                <p className="text-tertiary text-xs font-semibold uppercase tracking-wide">
                  Architecture
                </p>
                <p className="mt-2 text-sm leading-relaxed text-secondary">
                  {project.tech.architecture}
                </p>
              </div>
            ) : null}

            {project.tech.diagram?.lines?.length ? (
              <div className="mt-5">
                <p className="text-tertiary text-xs font-semibold uppercase tracking-wide">
                  {project.tech.diagram.title || 'Diagrama (simple)'}
                </p>
                <div className="mt-2 rounded-xl border border-neutral-800 bg-neutral-900 p-4 font-mono text-xs text-neutral-200">
                  {project.tech.diagram.lines.map((line) => (
                    <div key={line}>{line}</div>
                  ))}
                </div>
              </div>
            ) : null}

            {project.tech.technicalProblemSolved ? (
              <div className="mt-5">
                <p className="text-tertiary text-xs font-semibold uppercase tracking-wide">
                  What technical problem it solved
                </p>
                <p className="mt-2 text-sm leading-relaxed text-secondary">
                  {project.tech.technicalProblemSolved}
                </p>
              </div>
            ) : null}
          </section>

          <section className="rounded-2xl border border-neutral-800 bg-neutral-950 p-6 shadow-xs">
            <h2 className="text-sm font-extrabold text-primary">Links</h2>
            <p className="text-tertiary mt-1 text-sm">
              Live demo and source code.
            </p>

            <div className="mt-5 space-y-3">
              {live ? (
                <Link
                  href={live}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center justify-between rounded-2xl border border-neutral-800 bg-neutral-900 px-4 py-3 transition hover:border-neutral-700 hover:bg-neutral-800"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-neutral-800 bg-neutral-950 text-neutral-200">
                      <GlobeIcon size={16} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-neutral-100">
                        Live
                      </p>
                      <p className="text-tertiary font-mono text-xs">
                        {liveLabel}
                      </p>
                    </div>
                  </div>
                </Link>
              ) : (
                <div className="rounded-2xl border border-neutral-800 bg-neutral-900/30 px-4 py-3">
                  <p className="text-sm font-semibold text-neutral-200">Live</p>
                  <p className="text-tertiary text-xs">No live link set.</p>
                </div>
              )}

              {code ? (
                <Link
                  href={code}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center justify-between rounded-2xl border border-neutral-800 bg-neutral-900 px-4 py-3 transition hover:border-neutral-700 hover:bg-neutral-800"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-neutral-800 bg-neutral-950 text-neutral-200">
                      <GithubIcon size={16} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-neutral-100">
                        Code
                      </p>
                      <p className="text-tertiary font-mono text-xs">
                        {codeLabel}
                      </p>
                    </div>
                  </div>
                </Link>
              ) : (
                <div className="rounded-2xl border border-neutral-800 bg-neutral-900/30 px-4 py-3">
                  <p className="text-sm font-semibold text-neutral-200">Code</p>
                  <p className="text-tertiary text-xs">No repo link set.</p>
                </div>
              )}
            </div>
          </section>
        </div>

        {project.tech.keyDecisions?.length ? (
          <section className="mt-8 rounded-2xl border border-neutral-800 bg-neutral-950 p-6 shadow-xs">
            <h2 className="text-sm font-extrabold text-primary">
              Key decisions
            </h2>
            <ul className="mt-3 space-y-2">
              {project.tech.keyDecisions.map((d) => (
                <li
                  key={d}
                  className="rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-3 text-sm leading-relaxed text-secondary"
                >
                  {d}
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {project.impact ? (
          <section className="mt-8 rounded-2xl border border-neutral-800 bg-neutral-950 p-6 shadow-xs">
            <h2 className="text-sm font-extrabold text-primary">Impact</h2>

            {project.impact.metrics?.length ? (
              <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
                {project.impact.metrics.map((m) => (
                  <div
                    key={m.label}
                    className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4"
                  >
                    <p className="text-tertiary text-xs font-semibold uppercase tracking-wide">
                      {m.label}
                    </p>
                    <p className="mt-1 text-lg font-extrabold text-primary">
                      {m.value}
                    </p>
                    {m.note ? (
                      <p className="text-tertiary mt-1 text-xs leading-relaxed">
                        {m.note}
                      </p>
                    ) : null}
                  </div>
                ))}
              </div>
            ) : null}

            {project.impact.results?.length ? (
              <div className="mt-6">
                <p className="text-tertiary text-xs font-semibold uppercase tracking-wide">
                  Outcome
                </p>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-secondary">
                  {project.impact.results.map((r) => (
                    <li key={r}>{r}</li>
                  ))}
                </ul>
              </div>
            ) : null}

            {project.impact.learnings?.length ? (
              <div className="mt-6">
                <p className="text-tertiary text-xs font-semibold uppercase tracking-wide">
                  Learnings
                </p>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-secondary">
                  {project.impact.learnings.map((l) => (
                    <li key={l}>{l}</li>
                  ))}
                </ul>
              </div>
            ) : null}
          </section>
        ) : null}
      </div>
    </div>
  )
}
