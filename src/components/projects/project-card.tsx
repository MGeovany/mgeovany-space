import { GlobeIcon } from 'lucide-react'
import Link from 'next/link'

import { StackBadges, StatusBadge } from '@/components/projects/project-ui'
import { Project } from '@/types/project'

import { GithubIcon } from '../icons/shared'

export function ProjectCard({ project }: { project: Project }) {
  const { code, live } = project.links

  return (
    <div className="group relative flex h-full flex-col rounded-2xl border border-neutral-800 bg-neutral-900/30 shadow-xs transition hover:border-neutral-700 hover:bg-neutral-900/40 hover:shadow-cardHover">
      <Link
        href={`/projects/${project.id}`}
        className="flex flex-1 flex-col p-5"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="truncate text-base font-bold leading-tight text-primary hover:underline">
                {project.name}
              </span>
              {project.year ? (
                <span className="text-tertiary text-xs font-semibold">
                  {project.year}
                </span>
              ) : null}
            </div>
            <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-secondary">
              {project.motivation}
            </p>
          </div>
          <div className="relative flex shrink-0 items-start gap-2">
            <StatusBadge status={project.status} />
          </div>
        </div>

        {project.summary ? (
          <p className="text-tertiary mt-3 line-clamp-2 text-sm">
            {project.summary}
          </p>
        ) : null}

        <div className="mt-4">
          <StackBadges stack={project.tech.stack.slice(0, 6)} />
        </div>
      </Link>

      <div className="mt-5 flex items-center justify-between px-5 pb-5">
        <Link
          href={`/projects/${project.id}`}
          className="text-tertiary text-sm font-semibold hover:underline"
        >
          View project
        </Link>
        <div className="flex items-center gap-2">
          {code ? (
            <a
              href={code}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center rounded-full border border-neutral-800 bg-neutral-900 px-3 py-1.5 text-sm font-semibold text-neutral-200 transition hover:border-neutral-700 hover:bg-neutral-800"
            >
              <GithubIcon size={14} />
              <span className="xs:inline hidden">Code</span>
            </a>
          ) : null}
          {live ? (
            <a
              href={live}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center rounded-full border border-neutral-800 bg-neutral-900 px-3 py-1.5 text-sm font-semibold text-neutral-200 transition hover:border-neutral-700 hover:bg-neutral-800"
            >
              <GlobeIcon size={14} />
              <span className="xs:inline hidden">Live</span>
            </a>
          ) : null}
        </div>
      </div>
    </div>
  )
}
