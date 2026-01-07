import type { Metadata } from 'next'
import { ReactNode } from 'react'

import routes from '@/config/routes'

const baseUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.NODE_ENV === 'production'
    ? 'https://mgeovany.thefndrs.com'
    : 'http://localhost:3000')

export const metadata: Metadata = {
  title: routes.projects.seo.title,
  description: routes.projects.seo.description,
  openGraph: {
    title: routes.projects.seo.title,
    description: routes.projects.seo.description,
    url: `${baseUrl}/projects`,
    siteName: 'mgeovany space',
    images: [
      {
        url: `${baseUrl}/static/meta/me.webp`,
        width: 1200,
        height: 630,
        alt: 'Projects - mgeovany',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: routes.projects.seo.title,
    description: routes.projects.seo.description,
    images: [`${baseUrl}/static/meta/me.webp`],
  },
}

export default function ProjectsLayout({ children }: { children: ReactNode }) {
  return <>{children}</>
}
