import type { Metadata } from 'next'

import { Intro } from '@/components/home/intro'
import { ListDetailView } from '@/components/layouts'
import { defaultSEO } from '@/config/seo'
import { createClient } from '@/lib/supabase/server'
import { Project } from '@/types/project'

function dbRowToProject(row: any): Project {
  return {
    id: row.id,
    name: row.name,
    motivation: row.motivation,
    tagline: row.tagline || undefined,
    status: row.status,
    year: row.year || undefined,
    summary: row.summary || undefined,
    shortDesc: row.short_desc || undefined,
    showOnHome: Boolean(row.show_on_home),
    links: {
      code: row.code_link || undefined,
      live: row.live_link || undefined,
    },
    tech: { stack: row.tech_stack || [] },
  } as Project
}

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

export default async function Home() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('projects')
    .select(
      'id, name, tagline, summary, short_desc, code_link, live_link, show_on_home, tech_stack'
    )
    .eq('show_on_home', true)
    .order('created_at', { ascending: false })
  const featuredProjects = error || !data ? [] : data.map(dbRowToProject)

  return (
    <ListDetailView
      list={null}
      hasDetail
      detail={<Intro featuredProjects={featuredProjects} />}
    />
  )
}
