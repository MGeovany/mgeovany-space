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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { mediumUsername } = body

    if (!mediumUsername) {
      return NextResponse.json(
        { error: 'mediumUsername is required' },
        { status: 400 }
      )
    }

    const rssUrl = `https://medium.com/feed/@${mediumUsername.replace('@', '')}`
    const feed = await parser.parseURL(rssUrl)

    if (!feed.items || feed.items.length === 0) {
      return NextResponse.json(
        { error: 'No posts found in RSS feed' },
        { status: 404 }
      )
    }

    const admin = createAdminClient()
    const syncedPosts: string[] = []
    const errors: string[] = []

    for (const item of feed.items) {
      try {
        if (!item.link || !item.title) {
          continue
        }

        // Check if post already exists by URL
        const { data: existingPost } = await admin
          .from('posts')
          .select('id')
          .eq('url', item.link)
          .single()

        // Truncate excerpt to max 200 characters
        const rawExcerpt = item.contentSnippet || item.description || null
        const excerpt =
          rawExcerpt && rawExcerpt.length > 200
            ? rawExcerpt.substring(0, 200).trim() + '...'
            : rawExcerpt

        if (existingPost) {
          // Update existing post
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
            errors.push(
              `Failed to update ${item.title}: ${updateError.message}`
            )
          } else {
            syncedPosts.push(item.title)
          }
        } else {
          // Create new post
          const slug = slugify(item.title)
          const { error: insertError } = await admin.from('posts').insert({
            title: item.title,
            slug,
            excerpt,
            content_html:
              item.contentEncoded || item['content:encoded'] || null,
            url: item.link,
            canonical_url: item.link,
            source: 'medium',
            status: 'published',
            published_at: item.pubDate
              ? new Date(item.pubDate).toISOString()
              : null,
          })

          if (insertError) {
            errors.push(
              `Failed to create ${item.title}: ${insertError.message}`
            )
          } else {
            syncedPosts.push(item.title)
          }
        }
      } catch (error: any) {
        errors.push(`Error processing ${item.title}: ${error.message}`)
      }
    }

    return NextResponse.json({
      success: true,
      synced: syncedPosts.length,
      posts: syncedPosts,
      errors: errors.length > 0 ? errors : undefined,
    })
  } catch (error: any) {
    console.error('[Sync Medium] Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to sync Medium posts' },
      { status: 500 }
    )
  }
}
