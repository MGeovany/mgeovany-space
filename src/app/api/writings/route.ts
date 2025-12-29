import { NextResponse } from 'next/server'

import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('posts')
    .select('id, title, slug, excerpt, url, published_at')
    .eq('status', 'published')
    .order('published_at', { ascending: false })

  console.log(data, 'data')
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data })
}
