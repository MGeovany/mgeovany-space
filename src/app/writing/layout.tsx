import type { Metadata } from 'next'
import { ReactNode } from 'react'

import { ListDetailView } from '@/components/layouts'
import { WritingList } from '@/components/writing'
import routes from '@/config/routes'

const baseUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.NODE_ENV === 'production'
    ? 'https://mgeovany.thefndrs.com'
    : 'http://localhost:3000')

export const metadata: Metadata = {
  title: routes.writing.seo.title,
  description: routes.writing.seo.description,
  openGraph: {
    title: routes.writing.seo.title,
    description: routes.writing.seo.description,
    url: `${baseUrl}/writing`,
    siteName: 'mgeovany space',
    images: [
      {
        url: `${baseUrl}/static/meta/me.webp`,
        width: 1200,
        height: 630,
        alt: 'Writing - mgeovany',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: routes.writing.seo.title,
    description: routes.writing.seo.description,
    images: [`${baseUrl}/static/meta/me.webp`],
  },
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
