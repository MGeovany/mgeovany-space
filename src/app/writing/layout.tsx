import { NextSeo } from 'next-seo'
import { ReactNode } from 'react'

import routes from '@/config/routes'

export const metadata = {
  title: routes.writing.seo.title,
  description: routes.writing.seo.description,
  openGraph: routes.writing.seo.openGraph,
}

export default function WritingLayout({ children }: { children: ReactNode }) {
  return <>{children}</>
}
