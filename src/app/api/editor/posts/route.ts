import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'

import { isAllowedEditorEmail } from '@/lib/editor/allowed'
import { slugify } from '@/lib/slugify'
import { createAdminClient } from '@/lib/supabase/admin'

type PostStatus = 'draft' | 'published' | 'archived'

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status })
}

async function requireAllowedUser(request: NextRequest) {
  const response = NextResponse.next()

  // Try to get token from Authorization header first (fallback)
  const authHeader = request.headers.get('authorization')
  const headerToken = authHeader?.replace('Bearer ', '') || null

  // Get all cookies - use them as-is (Supabase handles split cookies internally)
  const cookieList = request.cookies.getAll()

  // Try to extract access_token directly from cookies as fallback
  const authTokenCookie = cookieList.find((c) => c.name.includes('auth-token'))
  let cookieToken: string | null = null
  if (authTokenCookie) {
    try {
      const parsed = JSON.parse(authTokenCookie.value)
      cookieToken = parsed?.access_token || null
    } catch (e) {
      // Cookie might not be JSON, that's ok
    }
  }

  const accessToken = headerToken || cookieToken

  console.log('[editor][requireAllowedUser] auth check', {
    hasHeaderToken: !!headerToken,
    hasCookieToken: !!cookieToken,
    cookieCount: cookieList.length,
    cookieNames: cookieList.map((c) => c.name),
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieList
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  // If we have a token from header, try to set it directly
  if (accessToken && !cookieToken) {
    try {
      const { data: userData, error: tokenError } =
        await supabase.auth.getUser(accessToken)
      if (userData?.user && !tokenError) {
        const email = userData.user.email ?? null
        if (isAllowedEditorEmail(email)) {
          console.log(
            '[editor][requireAllowedUser] authenticated via header token',
            {
              id: userData.user.id,
              email,
            }
          )
          return { ok: true as const, user: userData.user, response }
        }
      }
    } catch (e) {
      console.error('[editor][requireAllowedUser] header token auth failed', e)
    }
  }

  // Try getSession first to refresh the session if needed
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession()

  if (sessionError) {
    console.error('[editor][requireAllowedUser] getSession error', sessionError)
  }

  // Try getUser - if session exists, user should be available
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error) {
    console.error('[editor][requireAllowedUser] getUser error', error)
    console.error('[editor][requireAllowedUser] session data', {
      hasSession: !!session,
      sessionUser: session?.user?.email,
      hasAccessToken: !!accessToken,
    })
    return { ok: false as const, response: jsonError(error.message, 401) }
  }
  if (!user) {
    console.warn('[editor][requireAllowedUser] no user returned from getUser')
    return { ok: false as const, response: jsonError('Unauthorized', 401) }
  }

  const email = user.email ?? null
  if (!isAllowedEditorEmail(email)) {
    console.warn('[editor][requireAllowedUser] email not allowed', { email })
    return { ok: false as const, response: jsonError('Forbidden', 403) }
  }

  console.log('[editor][requireAllowedUser] authenticated', {
    id: user.id,
    email,
  })

  return { ok: true as const, user, response }
}

export async function GET(request: NextRequest) {
  console.log('[editor][GET] incoming', {
    url: request.url,
    cookies: request.headers.get('cookie') ?? null,
    cookieNames: request.cookies.getAll().map((c) => c.name),
  })
  const auth = await requireAllowedUser(request)
  if (!auth.ok) return auth.response

  const status = request.nextUrl.searchParams.get('status') as PostStatus | null
  const query = request.nextUrl.searchParams.get('q')?.trim() ?? ''

  let admin
  try {
    admin = createAdminClient()
  } catch (e: any) {
    return jsonError(e?.message ?? 'Server misconfigured', 500)
  }

  let q = admin
    .from('posts')
    .select(
      'id, title, slug, excerpt, status, published_at, updated_at, created_at, source, url'
    )

  if (status) q = q.eq('status', status)
  if (query) q = q.or(`title.ilike.%${query}%,slug.ilike.%${query}%`)

  const { data, error } = await q
  if (error) return jsonError(error.message, 500)

  // Sort: published posts by published_at (newest first), others by updated_at (newest first)
  const sorted = (data || []).sort((a, b) => {
    // If both have published_at, sort by published_at
    if (a.published_at && b.published_at) {
      return (
        new Date(b.published_at).getTime() - new Date(a.published_at).getTime()
      )
    }
    // If only one has published_at, prioritize it
    if (a.published_at && !b.published_at) return -1
    if (!a.published_at && b.published_at) return 1
    // If neither has published_at, sort by updated_at
    return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
  })

  return NextResponse.json({ data: sorted })
}

export async function POST(request: NextRequest) {
  const auth = await requireAllowedUser(request)
  if (!auth.ok) return auth.response

  let admin
  try {
    admin = createAdminClient()
  } catch (e: any) {
    return jsonError(e?.message ?? 'Server misconfigured', 500)
  }

  const body = await request.json().catch(() => null)
  const title = (body?.title as string | undefined)?.trim()
  const excerpt = (body?.excerpt as string | undefined)?.trim() ?? null
  const content = (body?.content as string | undefined) ?? null

  if (!title) return jsonError('Title is required', 400)

  const baseSlug = slugify(title)
  if (!baseSlug) return jsonError('Could not generate slug from title', 400)

  // Ensure uniqueness by probing once and adding suffix on conflict.
  let slug = baseSlug
  const { data: existing } = await admin
    .from('posts')
    .select('id')
    .eq('slug', slug)
    .maybeSingle()

  if (existing?.id) {
    const suffix = Math.random().toString(36).slice(2, 6)
    slug = `${baseSlug}-${suffix}`
  }

  const { data, error } = await admin
    .from('posts')
    .insert({
      title,
      slug,
      excerpt,
      content,
      status: 'draft',
      source: 'local',
      updated_at: new Date().toISOString(),
    })
    .select(
      'id, title, slug, excerpt, status, source, published_at, updated_at, created_at'
    )
    .single()

  if (error) return jsonError(error.message, 500)
  return NextResponse.json({ data }, { status: 201 })
}
