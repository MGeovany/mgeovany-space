'use client'

import { GlobeIcon } from 'lucide-react'
import Link from 'next/link'

import { Project } from '@/types/project'

import { GithubIcon } from '../icons/shared'

const MAX_VISIBLE_TAGS = 3

export function ProjectListRow({ project }: { project: Project }) {
  const { code, live } = project.links
  const stack = project.tech.stack || []
  const visible = stack.slice(0, MAX_VISIBLE_TAGS)
  const rest = stack.length - MAX_VISIBLE_TAGS
  const description = project.shortDesc || project.tagline || project.motivation

  return (
    <div className="group py-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <Link href={`/projects/${project.id}`} className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-2">
            <span className="text-base font-semibold tracking-tight text-white group-hover:underline sm:text-lg">
              {project.name}
            </span>
            {project.year ? (
              <span className="text-sm text-neutral-500">{project.year}</span>
            ) : null}
          </div>
          {description ? (
            <p className="mt-1.5 text-sm leading-relaxed text-neutral-400">
              {description}
            </p>
          ) : null}
          {stack.length > 0 ? (
            <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-neutral-500">
              {visible.map((s) => (
                <span key={s}>{s}</span>
              ))}
              {rest > 0 ? (
                <span className="text-neutral-600">+{rest}</span>
              ) : null}
            </div>
          ) : null}
        </Link>
        <div className="mt-2 flex shrink-0 items-center gap-1 sm:mt-0">
          {code ? (
            <a
              href={code}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-9 w-9 items-center justify-center rounded-md text-neutral-500 transition hover:bg-neutral-800 hover:text-neutral-300"
              aria-label="Source code"
            >
              <GithubIcon size={18} />
            </a>
          ) : null}
          {live ? (
            <a
              href={live}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-9 w-9 items-center justify-center rounded-md text-neutral-500 transition hover:bg-neutral-800 hover:text-neutral-300"
              aria-label="Live site"
            >
              <GlobeIcon size={18} />
            </a>
          ) : null}
        </div>
      </div>
    </div>
  )
}
