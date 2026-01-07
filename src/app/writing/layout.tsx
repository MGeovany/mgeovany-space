import { ReactNode } from 'react'

import { ListDetailView } from '@/components/layouts'
import { WritingList } from '@/components/writing'
import routes from '@/config/routes'

export const metadata = {
  title: routes.writing.seo.title,
  description: routes.writing.seo.description,
  openGraph: routes.writing.seo.openGraph,
}

export default function WritingLayout({ children }: { children: ReactNode }) {
  return (
    <ListDetailView
      list={<WritingList />}
      hasDetail
      shouldHideSidebar={false}
      detail={children}
    />
  )
}
