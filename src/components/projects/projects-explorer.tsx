'use client'

import { MutableRefObject, useRef } from 'react'

import { TitleBar } from '@/components/list-detail/title-bar'
import { ProjectListRow } from '@/components/projects/project-list-row'
import { Project } from '@/types/project'

export function ProjectsExplorer({ projects }: { projects: Project[] }) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  return (
    <div
      ref={scrollContainerRef}
      data-view="projects-list"
      className="relative flex h-full max-h-screen w-full flex-col overflow-y-auto bg-gradient-to-b from-neutral-950 via-neutral-950 to-neutral-900"
    >
      <TitleBar
        scrollContainerRef={
          scrollContainerRef as MutableRefObject<HTMLElement | null>
        }
        title="Projects"
        globalMenu={true}
      />
      <div className="mx-auto w-full max-w-3xl px-4 py-10 md:px-8">
        <header className="mb-10">
          <h1 className="text-2xl font-bold tracking-tight text-white md:text-3xl">
            Products
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-neutral-400">
            A curated set of projects with clear product motivation and
            technical decisions. Things built for user needs focusing on
            building value and exploring new approaches.
          </p>
        </header>

        <div>
          {projects.length === 0 ? (
            <div className="rounded-2xl border border-neutral-800 bg-neutral-900/30 p-8 text-center">
              <p className="text-base font-bold text-white">No projects yet</p>
              <p className="mt-1 text-sm text-neutral-500">
                Add your first project from the editor.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-neutral-800/80">
              {projects.map((p) => (
                <ProjectListRow key={p.id} project={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
