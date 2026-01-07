'use client'
import { MutableRefObject, useRef } from 'react'

import { TitleBar } from '@/components/list-detail/title-bar'
import { ProjectCard } from '@/components/projects/project-card'
import { Project } from '@/types/project'

export function ProjectsExplorer({ projects }: { projects: Project[] }) {
  const scrollContainerRef = useRef<HTMLDivElement>(
    null
  ) as MutableRefObject<HTMLElement | null>

  return (
    <div
      ref={scrollContainerRef}
      className="relative flex h-full max-h-screen w-full flex-col overflow-y-auto bg-gradient-to-b from-neutral-950 via-neutral-950 to-neutral-900"
    >
      <TitleBar
        scrollContainerRef={scrollContainerRef}
        title="Projects"
        globalMenu={true}
      />
      <div className="mx-auto w-full max-w-6xl px-4 py-10 md:px-8">
        <div className="space-y-2">
          <p className="max-w-2xl text-secondary">
            A curated set of projects with clear product motivation and
            technical decisions.
          </p>
          <p className="text-tertiary text-sm">
            Showing <span className="font-semibold">{projects.length}</span>
          </p>
        </div>

        <div className="mt-10">
          {projects.length === 0 ? (
            <div className="rounded-2xl border border-neutral-800 bg-neutral-900/30 p-8 text-center shadow-xs">
              <p className="text-base font-bold text-primary">
                No projects yet
              </p>
              <p className="text-tertiary mt-1 text-sm">
                Add your first project from the editor.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {projects.map((p, index) => (
                <ProjectCard key={p.id} project={p} index={index} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
