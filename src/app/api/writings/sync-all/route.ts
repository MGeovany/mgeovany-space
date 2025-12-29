import { NextRequest, NextResponse } from 'next/server'
import Parser from 'rss-parser'

import { slugify } from '@/lib/slugify'
import { createAdminClient } from '@/lib/supabase/admin'

const parser = new Parser({
  customFields: {
    item: [
      ['content:encoded', 'contentEncoded'],
      ['description', 'description'],
    ],
  },
})

// Helper to truncate excerpt
function truncateExcerpt(
  text: string | null | undefined,
  maxLength = 200
): string | null {
  if (!text) return null
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength).trim() + '...'
}

async function syncMedium(admin: ReturnType<typeof createAdminClient>) {
  const mediumUsername = 'mgeovany'
  const rssUrl = `https://medium.com/feed/@${mediumUsername.replace('@', '')}`
  const feed = await parser.parseURL(rssUrl)
  const syncedPosts: string[] = []
  const errors: string[] = []

  for (const item of feed.items || []) {
    try {
      if (!item.link || !item.title) continue

      const { data: existingPost } = await admin
        .from('posts')
        .select('id')
        .eq('url', item.link)
        .single()

      const excerpt = truncateExcerpt(item.contentSnippet || item.description)

      if (existingPost) {
        const { error: updateError } = await admin
          .from('posts')
          .update({
            title: item.title,
            excerpt,
            content_html:
              item.contentEncoded || item['content:encoded'] || null,
            published_at: item.pubDate
              ? new Date(item.pubDate).toISOString()
              : null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingPost.id)

        if (updateError) {
          errors.push(`Failed to update ${item.title}: ${updateError.message}`)
        } else {
          syncedPosts.push(item.title)
        }
      } else {
        const slug = slugify(item.title)
        const { error: insertError } = await admin.from('posts').insert({
          title: item.title,
          slug,
          excerpt,
          content_html: item.contentEncoded || item['content:encoded'] || null,
          url: item.link,
          canonical_url: item.link,
          source: 'medium',
          status: 'published',
          published_at: item.pubDate
            ? new Date(item.pubDate).toISOString()
            : null,
        })

        if (insertError) {
          errors.push(`Failed to create ${item.title}: ${insertError.message}`)
        } else {
          syncedPosts.push(item.title)
        }
      }
    } catch (error: any) {
      errors.push(`Error processing ${item.title}: ${error.message}`)
    }
  }

  return { syncedPosts, errors }
}

async function syncDevto(admin: ReturnType<typeof createAdminClient>) {
  const devtoUsername = 'mgeovany'
  const rssUrl = `https://dev.to/feed/${devtoUsername.replace('@', '')}`
  const feed = await parser.parseURL(rssUrl)
  const syncedPosts: string[] = []
  const errors: string[] = []

  for (const item of feed.items || []) {
    try {
      if (!item.link || !item.title) continue

      const { data: existingPost } = await admin
        .from('posts')
        .select('id')
        .eq('url', item.link)
        .single()

      // Dev.to often has very long excerpts, truncate them
      const excerpt = truncateExcerpt(
        item.contentSnippet || item.description,
        200
      )

      if (existingPost) {
        const { error: updateError } = await admin
          .from('posts')
          .update({
            title: item.title,
            excerpt,
            content_html:
              item.contentEncoded || item['content:encoded'] || null,
            published_at: item.pubDate
              ? new Date(item.pubDate).toISOString()
              : null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingPost.id)

        if (updateError) {
          errors.push(`Failed to update ${item.title}: ${updateError.message}`)
        } else {
          syncedPosts.push(item.title)
        }
      } else {
        const slug = slugify(item.title)
        const { error: insertError } = await admin.from('posts').insert({
          title: item.title,
          slug,
          excerpt,
          content_html: item.contentEncoded || item['content:encoded'] || null,
          url: item.link,
          canonical_url: item.link,
          source: 'devto',
          status: 'published',
          published_at: item.pubDate
            ? new Date(item.pubDate).toISOString()
            : null,
        })

        if (insertError) {
          errors.push(`Failed to create ${item.title}: ${insertError.message}`)
        } else {
          syncedPosts.push(item.title)
        }
      }
    } catch (error: any) {
      errors.push(`Error processing ${item.title}: ${error.message}`)
    }
  }

  return { syncedPosts, errors }
}

export async function GET(request: NextRequest) {
  // Vercel Cron jobs send a special header
  // For manual calls, use Authorization: Bearer CRON_SECRET
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
  const isVercelCron = request.headers.get('x-vercel-cron') === '1'

  // Allow Vercel cron jobs or manual calls with secret
  if (cronSecret && !isVercelCron) {
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  try {
    const admin = createAdminClient()

    const [mediumResult, devtoResult] = await Promise.all([
      syncMedium(admin),
      syncDevto(admin),
    ])

    const totalSynced =
      mediumResult.syncedPosts.length + devtoResult.syncedPosts.length
    const allErrors = [...mediumResult.errors, ...devtoResult.errors]

    return NextResponse.json({
      success: true,
      medium: {
        synced: mediumResult.syncedPosts.length,
        posts: mediumResult.syncedPosts,
      },
      devto: {
        synced: devtoResult.syncedPosts.length,
        posts: devtoResult.syncedPosts,
      },
      totalSynced,
      errors: allErrors.length > 0 ? allErrors : undefined,
    })
  } catch (error: any) {
    console.error('[Sync All] Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to sync posts' },
      { status: 500 }
    )
  }
}
