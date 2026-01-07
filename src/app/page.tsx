import type { Metadata } from 'next'

import { Intro } from '@/components/home/intro'
import { ListDetailView } from '@/components/layouts'
import { defaultSEO } from '@/config/seo'

const baseUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.NODE_ENV === 'production'
    ? 'https://mgeovany.thefndrs.com'
    : 'http://localhost:3000')

export const metadata: Metadata = {
  title: defaultSEO.title,
  description: defaultSEO.description,
  openGraph: {
    title: defaultSEO.title,
    description: defaultSEO.description,
    url: baseUrl,
    siteName: defaultSEO.openGraph.site_name,
    images: [
      {
        url: `${baseUrl}/static/meta/me.webp`,
        width: 1200,
        height: 630,
        alt: 'mgeovany',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: defaultSEO.title,
    description: defaultSEO.description,
    creator: defaultSEO.twitter.handle,
    site: defaultSEO.twitter.site,
    images: [`${baseUrl}/static/meta/me.webp`],
  },
}

export default function Home() {
  return <ListDetailView list={null} hasDetail detail={<Intro />} />
}
