import { ReactNode } from 'react'

import routes from '@/config/routes'

export const metadata = {
  title: routes.projects.seo.title,
  description: routes.projects.seo.description,
  openGraph: routes.projects.seo.openGraph,
}

export default function ProjectsLayout({ children }: { children: ReactNode }) {
  return <>{children}</>
}
