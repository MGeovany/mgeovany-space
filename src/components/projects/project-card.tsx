'use client'

import { motion } from 'framer-motion'
import { GlobeIcon } from 'lucide-react'
import Link from 'next/link'

import { StackBadges, StatusBadge } from '@/components/projects/project-ui'
import { Project } from '@/types/project'

import { GithubIcon } from '../icons/shared'

const cardVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.35,
      ease: [0.22, 1, 0.36, 1],
    },
  },
}

export function ProjectCard({
  project,
  index = 0,
}: {
  project: Project
  index?: number
}) {
  const { code, live } = project.links
  const tagline = project.tagline || project.motivation

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      transition={{ delay: index * 0.06 }}
      className="group flex h-full flex-col rounded-xl border border-neutral-800 bg-neutral-900/50 transition hover:border-neutral-700 hover:bg-neutral-900/70"
    >
      <Link
        href={`/projects/${project.id}`}
        className="flex flex-1 flex-col p-5"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-baseline gap-2">
              <span className="text-lg font-semibold tracking-tight text-white group-hover:underline">
                {project.name}
              </span>
              {project.year ? (
                <span className="text-xs text-neutral-500">{project.year}</span>
              ) : null}
            </div>
          </div>
          <StatusBadge status={project.status} />
        </div>

        {tagline ? (
          <p className="mt-2 line-clamp-1 text-sm text-neutral-400">
            {tagline}
          </p>
        ) : null}

        {project.summary ? (
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-neutral-500">
            {project.summary}
          </p>
        ) : null}

        <div className="mt-4">
          <StackBadges stack={project.tech.stack.slice(0, 6)} variant="dark" />
        </div>
      </Link>

      <div className="flex items-center justify-between border-t border-neutral-800 px-5 py-3">
        <Link
          href={`/projects/${project.id}`}
          className="text-sm text-neutral-500 transition hover:text-neutral-300"
        >
          View project
        </Link>
        <div className="flex items-center gap-1">
          {code ? (
            <a
              href={code}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-8 w-8 items-center justify-center rounded-full text-neutral-500 transition hover:bg-neutral-800 hover:text-neutral-300"
              aria-label="Source code"
            >
              <GithubIcon size={16} />
            </a>
          ) : null}
          {live ? (
            <a
              href={live}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-8 w-8 items-center justify-center rounded-full text-neutral-500 transition hover:bg-neutral-800 hover:text-neutral-300"
              aria-label="Live site"
            >
              <GlobeIcon size={16} />
            </a>
          ) : null}
        </div>
      </div>
    </motion.div>
  )
}
