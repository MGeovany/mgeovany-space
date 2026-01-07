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

export function StackBadges({ stack }: { stack: string[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {stack.map((s) => (
        <span
          key={s}
          className="border-gray-200 text-gray-700 dark:border-gray-800 dark:text-gray-200 inline-flex items-center rounded-full border bg-white px-2.5 py-1 text-xs font-semibold shadow-xs dark:bg-black"
        >
          {s}
        </span>
      ))}
    </div>
  )
}
