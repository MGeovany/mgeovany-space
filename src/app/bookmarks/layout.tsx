import type { Metadata } from 'next'
import { ReactNode } from 'react'

import { BookmarksList } from '@/components/bookmarks/bookmarks-list'
import { ListDetailView } from '@/components/layouts'
import routes from '@/config/routes'

const baseUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.NODE_ENV === 'production'
    ? 'https://mgeovany.thefndrs.com'
    : 'http://localhost:3000')

export const metadata: Metadata = {
  title: routes.bookmarks.seo.title,
  description: routes.bookmarks.seo.description,
  openGraph: {
    title: routes.bookmarks.seo.title,
    description: routes.bookmarks.seo.description,
    url: `${baseUrl}/bookmarks`,
    siteName: 'mgeovany space',
    images: [
      {
        url: `${baseUrl}/static/meta/me.webp`,
        width: 1200,
        height: 630,
        alt: 'Bookmarks - mgeovany',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: routes.bookmarks.seo.title,
    description: routes.bookmarks.seo.description,
    images: [`${baseUrl}/static/meta/me.webp`],
  },
}

export default function BookmarksLayout({ children }: { children: ReactNode }) {
  return (
    <ListDetailView
      list={<BookmarksList />}
      hasDetail
      shouldHideSidebar={false}
      detail={children}
    />
  )
}
