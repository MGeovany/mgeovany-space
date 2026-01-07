import type { Metadata } from 'next'

import { BlogDetail } from '@/components/writing/blog-detail'
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

  const { data } = await supabase
    .from('posts')
    .select('title, excerpt, url, published_at')
    .eq('id', params.id)
    .eq('status', 'published')
    .single()

  if (!data) {
    return {
      title: 'Post not found',
    }
  }

  const title = data.title || 'Writing'
  const description = data.excerpt || 'A blog post by mgeovany'

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${baseUrl}/writing/${params.id}`,
      siteName: 'mgeovany space',
      type: 'article',
      publishedTime: data.published_at || undefined,
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

export default function Page({ params }: { params: { id: string } }) {
  return <BlogDetail id={params.id} />
}
