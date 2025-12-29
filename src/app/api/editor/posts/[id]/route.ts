import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'

import { isAllowedEditorEmail } from '@/lib/editor/allowed'
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

export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  const auth = await requireAllowedUser(request)
  if (!auth.ok) return auth.response

  let admin
  try {
    admin = createAdminClient()
  } catch (e: any) {
    return jsonError(e?.message ?? 'Server misconfigured', 500)
  }

  const { data, error } = await admin
    .from('posts')
    .select(
      'id, title, slug, excerpt, content, content_html, status, source, url, canonical_url, published_at, updated_at, created_at'
    )
    .eq('id', context.params.id)
    .single()

  if (error) return jsonError(error.message, 500)
  return NextResponse.json({ data })
}

export async function PATCH(
  request: NextRequest,
  context: { params: { id: string } }
) {
  const auth = await requireAllowedUser(request)
  if (!auth.ok) return auth.response

  let admin
  try {
    admin = createAdminClient()
  } catch (e: any) {
    return jsonError(e?.message ?? 'Server misconfigured', 500)
  }

  // Check if post exists
  const { data: existingPost, error: fetchError } = await admin
    .from('posts')
    .select('source')
    .eq('id', context.params.id)
    .single()

  if (fetchError) {
    return jsonError('Post not found', 404)
  }

  const body = await request.json().catch(() => null)

  const title = typeof body?.title === 'string' ? body.title.trim() : undefined
  const excerpt =
    typeof body?.excerpt === 'string' ? body.excerpt.trim() : undefined
  const content = typeof body?.content === 'string' ? body.content : undefined
  const status = body?.status as PostStatus | undefined

  // Allow status changes (archive/unarchive) for all posts
  // But block content edits for external sources
  const isExternal = existingPost?.source && existingPost.source !== 'local'
  if (
    isExternal &&
    (title !== undefined || excerpt !== undefined || content !== undefined)
  ) {
    return jsonError(
      'This post is synced from an external source and cannot be edited',
      403
    )
  }

  const patch: Record<string, any> = {
    updated_at: new Date().toISOString(),
  }
  if (title !== undefined) patch.title = title
  if (excerpt !== undefined) patch.excerpt = excerpt || null
  if (content !== undefined) patch.content = content
  if (status) patch.status = status

  if (status === 'published') {
    patch.published_at = new Date().toISOString()
  }
  if (status === 'draft') {
    patch.published_at = null
  }

  const { data, error } = await admin
    .from('posts')
    .update(patch)
    .eq('id', context.params.id)
    .select(
      'id, title, slug, excerpt, content, content_html, status, source, url, canonical_url, published_at, updated_at, created_at'
    )
    .single()

  if (error) return jsonError(error.message, 500)
  return NextResponse.json({ data })
}

export async function DELETE(
  request: NextRequest,
  context: { params: { id: string } }
) {
  const auth = await requireAllowedUser(request)
  if (!auth.ok) return auth.response

  let admin
  try {
    admin = createAdminClient()
  } catch (e: any) {
    return jsonError(e?.message ?? 'Server misconfigured', 500)
  }

  const { error } = await admin
    .from('posts')
    .delete()
    .eq('id', context.params.id)
  if (error) return jsonError(error.message, 500)

  return NextResponse.json({ ok: true })
}
