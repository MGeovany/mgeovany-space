import * as cheerio from 'cheerio'
import { NextRequest, NextResponse } from 'next/server'

import { createAdminClient } from '@/lib/supabase/admin'

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status })
}

interface ChromeBookmark {
  title: string
  url: string
  add_date?: string
  icon?: string
  folder?: string
}

function findFolderPath(html: string, linkIndex: number): string {
  const folders: string[] = []

  // Find all H3 tags before this link
  const h3Pattern = /<H3[^>]*>(.*?)<\/H3>/gi
  let match
  const h3Matches: Array<{ index: number; name: string }> = []

  while ((match = h3Pattern.exec(html)) !== null) {
    if (match.index && match.index < linkIndex) {
      const folderName = match[1]?.replace(/<[^>]*>/g, '').trim()
      if (folderName && folderName !== 'Bookmarks Bar') {
        h3Matches.push({ index: match.index, name: folderName })
      }
    }
  }

  // Get the closest H3 before the link
  const closestH3 = h3Matches
    .filter((h3) => h3.index < linkIndex)
    .sort((a, b) => b.index - a.index)[0]

  if (closestH3) {
    folders.push(closestH3.name)
  }

  return folders.join('/')
}

function parseChromeBookmarksHTML(html: string): ChromeBookmark[] {
  const bookmarks: ChromeBookmark[] = []

  // Check if this looks like a Chrome bookmarks file
  if (
    !html.includes('NETSCAPE-Bookmark-file') &&
    !html.includes('<DT>') &&
    !html.includes('<A HREF')
  ) {
    console.warn(
      '[bookmarks] HTML does not appear to be a Chrome bookmarks file'
    )
    console.log(`[bookmarks] HTML starts with: ${html.substring(0, 200)}`)
  }

  // Chrome bookmarks use uppercase tags (<DT><A HREF=...>), so we'll parse with regex
  // Standard format: <DT><A HREF="url" ADD_DATE="..." ICON="...">Title</A></DT>

  // First, let's see what the HTML actually contains
  const sampleMatch = html.match(/<DT><A\s+[^>]*HREF[^>]*>/i)
  if (sampleMatch) {
    console.log(
      `[bookmarks] Sample link tag found: ${sampleMatch[0].substring(0, 200)}`
    )
  }

  // Try the standard Chrome bookmarks pattern
  // Match: <DT><A HREF="url" [attributes]>Title</A></DT>
  const standardPattern =
    /<DT><A\s+[^>]*HREF\s*=\s*["']([^"']+)["'][^>]*>(.*?)<\/A><\/DT>/gis

  let linkMatches = Array.from(html.matchAll(standardPattern))
  console.log(
    `[bookmarks] Found ${linkMatches.length} links using standard pattern`
  )

  // If no matches, try without DT tags
  if (linkMatches.length === 0) {
    const simplePattern =
      /<A\s+[^>]*HREF\s*=\s*["']([^"']+)["'][^>]*>(.*?)<\/A>/gi
    linkMatches = Array.from(html.matchAll(simplePattern))
    console.log(
      `[bookmarks] Found ${linkMatches.length} links using simple pattern`
    )
  }

  // If still no matches, try case-insensitive
  if (linkMatches.length === 0) {
    const caseInsensitivePattern =
      /<[Aa]\s+[^>]*[Hh][Rr][Ee][Ff]\s*=\s*["']([^"']+)["'][^>]*>(.*?)<\/[Aa]>/gi
    linkMatches = Array.from(html.matchAll(caseInsensitivePattern))
    console.log(
      `[bookmarks] Found ${linkMatches.length} links using case-insensitive pattern`
    )
  }

  // If regex found links, use that method
  if (linkMatches.length > 0) {
    linkMatches.forEach((match) => {
      const href = match[1]?.trim()
      let title = match[2]?.trim() || ''

      // Clean title from HTML tags
      title = title.replace(/<[^>]*>/g, '').trim()

      // Extract ADD_DATE from the full tag
      const fullTag = match[0]
      const addDateMatch = fullTag.match(/ADD_DATE\s*=\s*["']([^"']+)["']/i)
      const addDate = addDateMatch ? addDateMatch[1] : ''

      // Extract ICON
      const iconMatch = fullTag.match(/ICON\s*=\s*["']([^"']+)["']/i)
      const icon = iconMatch ? iconMatch[1] : ''

      if (!href || !title) {
        return
      }

      // Skip special protocols
      if (
        href.startsWith('javascript:') ||
        href.startsWith('chrome://') ||
        href.startsWith('chrome-extension://') ||
        href.startsWith('about:')
      ) {
        return
      }

      // Skip Google login URLs
      if (href.includes('accounts.google.com/ServiceLogin')) {
        return
      }

      try {
        const url = new URL(href)
        if (url.hostname.includes('accounts.google.com')) {
          return
        }
      } catch {
        return
      }

      // Try to find folder path using regex
      const folderPath = findFolderPath(html, match.index || 0)

      bookmarks.push({
        title,
        url: href,
        add_date: addDate,
        icon,
        folder: folderPath,
      })
    })

    console.log(
      `[bookmarks] Parsed ${bookmarks.length} valid bookmarks using regex`
    )
    return bookmarks
  }

  // Fallback to cheerio if regex didn't work
  const $ = cheerio.load(html, {
    xml: {
      decodeEntities: false,
      lowerCaseTags: false,
      lowerCaseAttributeNames: false,
    },
  })

  // Try case-insensitive selectors
  const links = $('a[href], A[HREF], a[HREF], A[href]')
  console.log(
    `[bookmarks] Found ${links.length} links using cheerio (fallback)`
  )

  let skippedCount = 0
  let skippedReasons: Record<string, number> = {}

  links.each((_, element) => {
    const $link = $(element)
    const href = $link.attr('href')?.trim()
    let title = $link.text().trim()

    // If title is empty, try to get it from HTML content
    if (!title) {
      title = $link.html()?.trim() || ''
      // Remove any nested tags
      title = title.replace(/<[^>]*>/g, '').trim()
    }

    const addDate = $link.attr('add_date') || $link.attr('ADD_DATE') || ''
    const icon = $link.attr('icon') || $link.attr('ICON') || ''

    // Skip if no href
    if (!href) {
      skippedCount++
      skippedReasons['no-href'] = (skippedReasons['no-href'] || 0) + 1
      return
    }

    // Skip if no title
    if (!title) {
      skippedCount++
      skippedReasons['no-title'] = (skippedReasons['no-title'] || 0) + 1
      return
    }

    // Skip javascript: and other non-http links
    if (
      href.startsWith('javascript:') ||
      href.startsWith('chrome://') ||
      href.startsWith('chrome-extension://') ||
      href.startsWith('about:')
    ) {
      skippedCount++
      skippedReasons['special-protocol'] =
        (skippedReasons['special-protocol'] || 0) + 1
      return
    }

    // Skip Google login/redirect URLs
    if (href.includes('accounts.google.com/ServiceLogin')) {
      skippedCount++
      skippedReasons['google-login'] = (skippedReasons['google-login'] || 0) + 1
      return
    }

    try {
      // Validate URL
      const url = new URL(href)
      // Skip if it's a Google login page
      if (url.hostname.includes('accounts.google.com')) {
        skippedCount++
        skippedReasons['google-accounts'] =
          (skippedReasons['google-accounts'] || 0) + 1
        return
      }
    } catch (e) {
      // Skip invalid URLs
      skippedCount++
      skippedReasons['invalid-url'] = (skippedReasons['invalid-url'] || 0) + 1
      return
    }

    // Try to determine folder path from parent structure
    const folders: string[] = []
    let $parent = $link.closest('dt').parent()

    // Traverse up to find folder names (H3 elements)
    while ($parent.length > 0) {
      const $h3 = $parent.find('> dt > h3').first()
      if ($h3.length > 0) {
        const folderName = $h3.text().trim()
        if (folderName && folderName !== 'Bookmarks Bar') {
          folders.unshift(folderName)
        }
      }
      const parentTag = $parent[0]?.tagName?.toLowerCase()
      if (parentTag === 'html' || parentTag === 'body') break
      $parent = $parent.parent()
    }

    const folderPath = folders.length > 0 ? folders.join('/') : ''

    bookmarks.push({
      title,
      url: href,
      add_date: addDate,
      icon,
      folder: folderPath,
    })
  })

  console.log(`[bookmarks] Parsed ${bookmarks.length} valid bookmarks`)
  console.log(
    `[bookmarks] Skipped ${skippedCount} links. Reasons:`,
    skippedReasons
  )

  return bookmarks
}

async function parseChromeBookmarksFromURL(
  url: string
): Promise<ChromeBookmark[]> {
  try {
    // Convert Google Drive sharing URL to direct download URL
    let downloadUrl = url
    const driveMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/)
    if (driveMatch) {
      const fileId = driveMatch[1]
      downloadUrl = `https://drive.google.com/uc?export=download&id=${fileId}`
      console.log(`[bookmarks] Converted Google Drive URL. File ID: ${fileId}`)
    }

    console.log(`[bookmarks] Fetching from: ${downloadUrl}`)

    const response = await fetch(downloadUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
      redirect: 'follow',
    })

    if (!response.ok) {
      console.error(
        `[bookmarks] Fetch failed: ${response.status} ${response.statusText}`
      )
      throw new Error(
        `Failed to fetch bookmarks: ${response.status} ${response.statusText}`
      )
    }

    const html = await response.text()
    console.log(`[bookmarks] Fetched ${html.length} characters of HTML`)

    // Log first 500 chars to debug
    console.log(
      `[bookmarks] HTML preview: ${html.substring(0, 500).replace(/\n/g, ' ')}`
    )

    // Check if we got a login page instead of the HTML file
    if (
      html.includes('Sign in') ||
      html.includes('accounts.google.com/ServiceLogin') ||
      html.includes('Sign in to continue')
    ) {
      console.error('[bookmarks] Detected login page instead of HTML file')
      throw new Error(
        'The bookmarks file appears to require authentication. Please make sure the file is set to "Anyone with the link" and use the direct download URL format: https://drive.google.com/uc?export=download&id=FILE_ID'
      )
    }

    // Check if we got an error page
    if (html.includes('Sorry, unable to open the file') || html.length < 500) {
      console.error('[bookmarks] File appears to be inaccessible or too small')
      throw new Error(
        'The bookmarks file appears to be inaccessible. Please check that the file is set to "Anyone with the link" and try the direct download URL.'
      )
    }

    return parseChromeBookmarksHTML(html)
  } catch (error: any) {
    console.error('[bookmarks] Error in parseChromeBookmarksFromURL:', error)
    throw new Error(`Error fetching bookmarks: ${error.message}`)
  }
}

export async function POST(request: NextRequest) {
  // Check for Vercel Cron secret or admin auth
  const cronSecret = request.headers.get('x-vercel-cron')
  const authHeader = request.headers.get('authorization')

  if (!cronSecret && !authHeader) {
    return jsonError('Unauthorized', 401)
  }

  // Get bookmarks URL from environment or request body
  const body = await request.json().catch(() => ({}))
  const bookmarksURL = body.url || process.env.GOOGLE_BOOKMARKS_URL

  if (!bookmarksURL) {
    return jsonError(
      'GOOGLE_BOOKMARKS_URL environment variable or url in body is required',
      400
    )
  }

  let admin
  try {
    admin = createAdminClient()
  } catch (e: any) {
    return jsonError(e?.message ?? 'Server misconfigured', 500)
  }

  try {
    // Fetch and parse bookmarks
    console.log(`[bookmarks] Fetching bookmarks from: ${bookmarksURL}`)
    const chromeBookmarks = await parseChromeBookmarksFromURL(bookmarksURL)

    console.log(
      `[bookmarks] Parsed ${chromeBookmarks.length} bookmarks from HTML`
    )

    if (chromeBookmarks.length === 0) {
      return NextResponse.json({
        message: 'No bookmarks found',
        synced: 0,
        total: 0,
      })
    }

    // Upsert bookmarks (update if exists, insert if new)
    let synced = 0
    let errors = 0

    for (const bookmark of chromeBookmarks) {
      try {
        const addDate = bookmark.add_date
          ? new Date(parseInt(bookmark.add_date) * 1000).toISOString()
          : null

        const { error } = await admin.from('google_bookmarks').upsert(
          {
            title: bookmark.title,
            url: bookmark.url,
            folder_path: bookmark.folder || null,
            add_date: bookmark.add_date ? parseInt(bookmark.add_date) : null,
            icon_url: bookmark.icon || null,
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: 'url',
            ignoreDuplicates: false,
          }
        )

        if (error) {
          console.error(`Error upserting bookmark ${bookmark.url}:`, error)
          errors++
        } else {
          synced++
        }
      } catch (e: any) {
        console.error(`Error processing bookmark ${bookmark.url}:`, e)
        errors++
      }
    }

    return NextResponse.json({
      message: 'Bookmarks synced successfully',
      synced,
      errors,
      total: chromeBookmarks.length,
    })
  } catch (error: any) {
    console.error('Error syncing bookmarks:', error)
    return jsonError(error.message || 'Failed to sync bookmarks', 500)
  }
}

export async function GET() {
  let admin
  try {
    admin = createAdminClient()
  } catch (e: any) {
    return jsonError(e?.message ?? 'Server misconfigured', 500)
  }

  const { data, error } = await admin
    .from('google_bookmarks')
    .select('*')
    .eq('archived', false)
    .order('created_at', { ascending: false })

  if (error) {
    return jsonError(error.message, 500)
  }

  return NextResponse.json({ data })
}
