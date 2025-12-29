import { NextRequest, NextResponse } from 'next/server'

import { createAdminClient } from '@/lib/supabase/admin'

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status })
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Check for admin auth
  const authHeader = request.headers.get('authorization')

  if (!authHeader) {
    return jsonError('Unauthorized', 401)
  }

  let admin
  try {
    admin = createAdminClient()
  } catch (e: any) {
    return jsonError(e?.message ?? 'Server misconfigured', 500)
  }

  try {
    const body = await request.json()
    const { archived } = body

    if (typeof archived !== 'boolean') {
      return jsonError('archived field is required and must be a boolean', 400)
    }

    const { data, error } = await admin
      .from('google_bookmarks')
      .update({ archived, updated_at: new Date().toISOString() })
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      console.error('[bookmarks] Error archiving bookmark:', error)
      return jsonError(error.message, 500)
    }

    return NextResponse.json({ data })
  } catch (error: any) {
    console.error('[bookmarks] Error in PATCH:', error)
    return jsonError(error.message || 'Failed to update bookmark', 500)
  }
}

