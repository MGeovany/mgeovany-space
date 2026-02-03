'use client'

import { motion } from 'framer-motion'
import { ArrowLeft, ChevronLeft, ChevronRight, GlobeIcon } from 'lucide-react'
import Link from 'next/link'
import { MutableRefObject, useRef } from 'react'

import { GithubIcon } from '@/components/icons/shared'
import { TitleBar } from '@/components/list-detail/title-bar'
import { StackBadges } from '@/components/projects/project-ui'
import { Project } from '@/types/project'

export function ProjectDetailContent({
  project,
  prevId,
  nextId,
}: {
  project: Project
  prevId: string | null
  nextId: string | null
}) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const { code, live } = project.links
  const tagline = project.tagline || project.motivation

  return (
    <div
      ref={scrollContainerRef}
      className="flex h-full w-full flex-col overflow-y-auto bg-neutral-950"
    >
      <TitleBar
        scrollContainerRef={
          scrollContainerRef as MutableRefObject<HTMLElement | null>
        }
        title={project.name}
        globalMenu={true}
      />
      <div className="mx-auto w-full max-w-3xl px-6 pb-24 pt-6 md:px-10 md:pt-10">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        >
          <Link
            href="/projects"
            className="inline-flex items-center gap-1.5 text-sm text-neutral-400 transition-colors hover:text-white"
          >
            <ArrowLeft size={16} />
            All projects
          </Link>

          {project.year ? (
            <p className="my-4 text-sm text-neutral-500">{project.year}</p>
          ) : null}

          <h1 className="mt-1 text-3xl font-semibold text-white md:text-4xl">
            {project.name}
          </h1>

          {tagline ? (
            <p className="mt-4 text-base leading-relaxed text-neutral-600">
              {tagline}
            </p>
          ) : null}

          <div className="mt-6 flex flex-wrap items-center gap-6">
            {live ? (
              <a
                href={live}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-medium text-neutral-400 transition hover:text-white"
              >
                <GlobeIcon size={16} />
                Visit
              </a>
            ) : null}
            {code ? (
              <a
                href={code}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-medium text-neutral-400 transition hover:text-white"
              >
                <GithubIcon size={16} />
                Source
              </a>
            ) : null}
          </div>

          <hr className="mt-8 border-neutral-800" />

          <div className="prose prose-invert mt-8 max-w-none">
            <p className="leading-relaxed text-neutral-300">
              {project.motivation}
            </p>
            {project.summary ? (
              <p className="mt-4 leading-relaxed text-neutral-300">
                {project.summary}
              </p>
            ) : null}
            {project.tech.architecture ? (
              <p className="mt-4 leading-relaxed text-neutral-300">
                {project.tech.architecture}
              </p>
            ) : null}
          </div>

          {project.tech.stack && project.tech.stack.length > 0 ? (
            <section className="mt-12">
              <hr className="border-neutral-800" />
              <p className="mt-6 text-sm font-semibold uppercase tracking-wide text-neutral-400">
                Stack
              </p>
              <div className="mt-4">
                <StackBadges stack={project.tech.stack} variant="dark" />
              </div>
              <hr className="mt-6 border-neutral-800" />
            </section>
          ) : null}
        </motion.div>

        {(prevId != null || nextId != null) && (
          <nav
            className="mt-16 flex items-center justify-between pt-8"
            aria-label="Previous and next project"
          >
            {prevId ? (
              <Link
                href={`/projects/${prevId}`}
                className="flex items-center gap-2 text-sm font-medium text-neutral-400 transition-colors hover:text-white"
              >
                <ChevronLeft size={20} />
                Previous project
              </Link>
            ) : (
              <span />
            )}
            {nextId ? (
              <Link
                href={`/projects/${nextId}`}
                className="flex items-center gap-2 text-sm font-medium text-neutral-400 transition-colors hover:text-white"
              >
                Next project
                <ChevronRight size={20} />
              </Link>
            ) : (
              <span />
            )}
          </nav>
        )}
      </div>
    </div>
  )
}
