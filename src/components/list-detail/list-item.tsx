import Link from 'next/link'
import { ReactElement } from 'react'

interface Props {
  title: string
  active: boolean
  href: string
  as: string
  description?: string | ReactElement
  byline?: string | ReactElement
  leadingAccessory?: ReactElement
  onClick?: (e: any) => void
}

export function ListItem({
  title,
  description,
  byline,
  href,
  as,
  active,
  leadingAccessory,
  onClick,
}: Props) {
  return (
    <Link
      href={href}
      as={as}
      onClick={onClick && onClick}
      className={`flex space-x-3 rounded-lg px-3.5 py-3 text-sm transition-colors ${
        active ? 'bg-neutral-900/40' : 'hover:bg-neutral-900/30'
      }`}
    >
      {leadingAccessory && <>{leadingAccessory}</>}
      <div className="flex flex-col justify-center space-y-1">
        <div
          className={`line-clamp-3 font-medium ${
            active ? 'text-neutral-50' : 'text-neutral-100'
          }`}
        >
          {title}
        </div>
        {description && (
          <div
            className={`line-clamp-2 ${active ? 'text-neutral-300' : 'text-neutral-400'}`}
          >
            {description}
          </div>
        )}
        {byline && (
          <div
            className={`line-clamp-1 ${active ? 'text-neutral-400' : 'text-neutral-500'}`}
          >
            {byline}
          </div>
        )}
      </div>
    </Link>
  )
}
