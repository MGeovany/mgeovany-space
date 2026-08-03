'use client'

import { Popover } from '@headlessui/react'

import { ProjectStatus } from '@/types/project'

const pausedProjectMessage =
  'This project is paused for now. It is not abandoned, but I have not continued active work on it recently.'

const statusBadgeStyles: Record<ProjectStatus, string> = {
  'In production':
    'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
  'In progress':
    'border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-300',
  Paused:
    'border-violet-500/30 bg-violet-500/10 text-violet-800 dark:text-violet-300',
  Archived:
    'border-gray-500/30 bg-gray-500/10 text-gray-700 dark:text-gray-300',
}

export function StatusBadge({ status }: { status: ProjectStatus }) {
  if (status === 'Paused') {
    return <PausedProjectLabel />
  }

  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${statusBadgeStyles[status]}`}
    >
      {status}
    </span>
  )
}

export function PausedProjectLabel() {
  return (
    <Popover className="relative inline-flex">
      <Popover.Button className="inline-flex items-center rounded-full border border-violet-500/30 bg-violet-500/10 px-2.5 py-1 text-xs font-semibold text-violet-300 transition hover:border-violet-400/50 hover:text-violet-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/60">
        Paused
      </Popover.Button>
      <Popover.Panel className="absolute left-0 top-full z-20 mt-2 w-64 rounded-xl border border-neutral-800 bg-neutral-950 p-3 text-sm leading-relaxed text-neutral-300 shadow-xl shadow-black/30">
        {pausedProjectMessage}
      </Popover.Panel>
    </Popover>
  )
}

export function StackBadges({
  stack,
  variant = 'default',
}: {
  stack: string[]
  variant?: 'default' | 'dark'
}) {
  const base =
    'inline-flex items-center rounded-lg px-3 py-1.5 text-xs font-medium'
  const styles =
    variant === 'dark'
      ? 'bg-neutral-900 text-white'
      : 'border border-gray-200 text-gray-700 dark:border-gray-800 dark:text-gray-200 bg-white shadow-xs dark:bg-black dark:text-gray-200'

  return (
    <div className="flex flex-wrap gap-2">
      {stack.map((s) => (
        <span key={s} className={`${base} ${styles}`}>
          {s}
        </span>
      ))}
    </div>
  )
}
