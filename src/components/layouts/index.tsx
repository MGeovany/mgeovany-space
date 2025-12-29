'use client'
import { usePathname } from 'next/navigation'
import { ReactElement, ReactNode } from 'react'

import { Sidebar } from '../sidebar/'

interface Props {
  list: ReactElement | null
  detail?: ReactElement | ReactNode
  hasDetail?: boolean
  shouldHideSidebar?: boolean
}

export function ListDetailView({ list, detail, hasDetail = false }: Props) {
  const pathname = usePathname()
  const hasDetailUrl =
    /\/(project-ideas|writing|bookmarks)\/[a-zA-Z0-9-]+$/.test(pathname)
  return (
    <div className="flex w-full">
      {list && (
        <div
          id="list"
          className={`bg-dots ${
            hasDetailUrl ? 'hidden lg:flex' : 'min-h-screen w-full'
          }`}
        >
          {list}
        </div>
      )}
      {detail}
    </div>
  )
}

export function SiteLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const shouldHideSidebar = pathname?.startsWith('/editor')

  return (
    <div className="relative flex h-full min-h-screen w-full">
      {!shouldHideSidebar && <Sidebar />}
      <div className="flex flex-1">{children}</div>
    </div>
  )
}
