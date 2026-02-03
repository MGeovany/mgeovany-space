import { ProjectStatus } from '@/types/project'

export function StatusBadge({ status }: { status: ProjectStatus }) {
  const styles: Record<ProjectStatus, string> = {
    'In production':
      'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
    'In progress':
      'border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-300',
    Paused:
      'border-violet-500/30 bg-violet-500/10 text-violet-800 dark:text-violet-300',
    Archived:
      'border-gray-500/30 bg-gray-500/10 text-gray-700 dark:text-gray-300',
  }

  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${styles[status]}`}
    >
      {status}
    </span>
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
