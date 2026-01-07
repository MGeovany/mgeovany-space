import type { Metadata } from 'next'

import { BookmarkDetail } from '@/components/bookmarks/bookmark-details'
import { createClient } from '@/lib/supabase/server'

const baseUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.NODE_ENV === 'production'
    ? 'https://mgeovany.thefndrs.com'
    : 'http://localhost:3000')

export async function generateMetadata({
  params,
}: {
  params: { id: string }
}): Promise<Metadata> {
  const supabase = await createClient()

  // Try to get from google_bookmarks first
  const { data: googleBookmark } = await supabase
    .from('google_bookmarks')
    .select('title, url')
    .eq('id', params.id)
    .single()

  if (googleBookmark) {
    const title = googleBookmark.title || 'Bookmark'
    const description = `Bookmark: ${title}`

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        url: `${baseUrl}/bookmarks/${params.id}`,
        siteName: 'mgeovany space',
        type: 'website',
        images: [
          {
            url: `${baseUrl}/static/meta/me.webp`,
            width: 1200,
            height: 630,
            alt: title,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [`${baseUrl}/static/meta/me.webp`],
      },
    }
  }

  // Fallback to regular bookmarks table if exists
  return {
    title: 'Bookmark',
    description: 'A bookmark saved by mgeovany',
  }
}

export default function Page({ params }: { params: { id: string } }) {
  return <BookmarkDetail id={params.id} />
}
