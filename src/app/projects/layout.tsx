import { ReactNode } from 'react'

import { ListDetailView } from '@/components/layouts'
import { ProjectIdeasList } from '@/components/projects'
import routes from '@/config/routes'

export const metadata = {
  title: routes.projects.seo.title,
  description: routes.projects.seo.description,
  openGraph: routes.projects.seo.openGraph,
}

export default function ProjectsLayout({ children }: { children: ReactNode }) {
  return (
    <ListDetailView
      list={<ProjectIdeasList />}
      hasDetail
      shouldHideSidebar={false}
      detail={children}
    />
  )
}
