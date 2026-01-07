'use client'

import { motion } from 'framer-motion'
import { GlobeIcon } from 'lucide-react'
import Link from 'next/link'
import { MutableRefObject, useRef } from 'react'

import { GithubIcon } from '@/components/icons/shared'
import { TitleBar } from '@/components/list-detail/title-bar'
import { StackBadges, StatusBadge } from '@/components/projects/project-ui'
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

export function ProjectDetailContent({ project }: { project: Project }) {
  const scrollContainerRef = useRef<HTMLDivElement>(
    null
  ) as MutableRefObject<HTMLElement | null>

  const { code, live } = project.links
  const codeLabel = code ? formatLinkLabel(code) : null
  const liveLabel = live ? formatLinkLabel(live) : null

  return (
    <div
      ref={scrollContainerRef}
      className="flex h-full w-full flex-col overflow-y-auto bg-neutral-950"
    >
      <TitleBar
        scrollContainerRef={scrollContainerRef}
        title={project.name}
        globalMenu={true}
        backButton={true}
        backButtonHref="/projects"
      />
      <div className="mx-auto w-full max-w-3xl px-6 py-10 md:px-10">
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="mt-2"
        >
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-4xl font-semibold tracking-tight text-white md:text-5xl">
                {project.name}
              </h1>
              <StatusBadge status={project.status} />
            </div>
            {project.tagline ? (
              <p className="max-w-3xl text-lg leading-relaxed text-neutral-200 md:text-xl">
                {project.tagline}
              </p>
            ) : null}
          </div>
        </motion.header>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="mt-10 max-w-4xl"
        >
          <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
            Motivation
          </p>
          <p className="mt-4 text-sm leading-loose text-neutral-200">
            {project.motivation}
          </p>
        </motion.section>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="mt-8 rounded-2xl border border-neutral-900 p-4"
        >
          <div className="w-full gap-10 md:grid-cols-2">
            <section>
              <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                Summary
              </p>
              <p className="mt-4 text-sm leading-loose text-neutral-200">
                {project.summary || '—'}
              </p>
            </section>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="mt-8 rounded-2xl border border-neutral-900 p-4 pt-10"
        >
          <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
            <section>
              <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">
                Tech & Architecture
              </p>

              <div className="mt-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                  Stack
                </p>
                <div className="mt-2">
                  <StackBadges stack={project.tech.stack} />
                </div>
              </div>
            </section>

            <section>
              <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">
                Links
              </p>

              <div className="mt-5 space-y-3">
                {live ? (
                  <Link
                    href={live}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center justify-between rounded-2xl border border-neutral-900 bg-neutral-950 px-4 py-3 transition hover:bg-neutral-900"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-neutral-900 bg-neutral-950 text-neutral-200">
                        <GlobeIcon size={16} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-neutral-200">
                          Live
                        </p>
                        <p className="font-mono text-xs text-neutral-500">
                          {liveLabel || live}
                        </p>
                      </div>
                    </div>
                  </Link>
                ) : (
                  <div className="rounded-2xl border border-neutral-900 bg-neutral-950 px-4 py-3">
                    <p className="text-sm font-semibold text-neutral-200">
                      Live
                    </p>
                    <p className="text-xs text-neutral-500">—</p>
                  </div>
                )}

                {code ? (
                  <Link
                    href={code}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center justify-between rounded-2xl border border-neutral-900 bg-neutral-950 px-4 py-3 transition hover:bg-neutral-900"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-neutral-900 bg-neutral-950 text-neutral-200">
                        <GithubIcon size={16} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-neutral-200">
                          Code
                        </p>
                        <p className="font-mono text-xs text-neutral-500">
                          {codeLabel || code}
                        </p>
                      </div>
                    </div>
                  </Link>
                ) : (
                  <div className="rounded-2xl border border-neutral-900 bg-neutral-950 px-4 py-3">
                    <p className="text-sm font-semibold text-neutral-200">
                      Code
                    </p>
                    <p className="text-xs text-neutral-500">—</p>
                  </div>
                )}
              </div>
            </section>
          </div>
          {project.tech.architecture ? (
            <div className="mt-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                Architecture
              </p>
            </div>
          ) : null}

          <p className="mt-2 text-sm leading-relaxed text-neutral-200">
            {project.tech.architecture}
          </p>
        </motion.div>
      </div>
    </div>
  )
}
