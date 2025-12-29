'use client'

import axios from 'axios'
import { formatDistanceToNowStrict } from 'date-fns'
import {
  Bold,
  Code,
  DoorOpen,
  Italic,
  Link,
  List,
  ListOrdered,
  Loader2,
  Plus,
  Quote,
  Search,
} from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import toast from 'react-hot-toast'

import { Button, GhostButton, PrimaryButton, Size } from '@/components/button'
import { useSupabaseUser } from '@/hooks/useSupabaseUser'
import { isAllowedEditorEmail } from '@/lib/editor/allowed'
import { createClient } from '@/lib/supabase/client'

type PostStatus = 'draft' | 'published' | 'archived'

type PostListItem = {
  id: string
  title: string
  slug: string
  excerpt: string | null
  status: PostStatus
  published_at: string | null
  updated_at: string
  created_at: string
}

type PostDetail = PostListItem & {
  content: string | null
  url: string | null
  canonical_url: string | null
}

// Helper to get auth headers
async function getAuthHeaders(): Promise<Record<string, string>> {
  const { getSupabaseToken } = await import('@/lib/supabase/get-token')
  const token = await getSupabaseToken()
  const headers: Record<string, string> = {}
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  return headers
}

// API service functions - Single Responsibility Principle
async function fetchPostsList(
  status: PostStatus,
  query?: string
): Promise<PostListItem[]> {
  const params = new URLSearchParams()
  params.set('status', status)
  if (query?.trim()) params.set('q', query.trim())

  const authHeaders = await getAuthHeaders()
  const response = await axios.get<{ data: PostListItem[] }>(
    `/api/editor/posts?${params.toString()}`,
    {
      withCredentials: true,
      headers: authHeaders,
    }
  )
  return response.data.data ?? []
}

async function fetchPostDetail(id: string): Promise<PostDetail> {
  const authHeaders = await getAuthHeaders()
  const response = await axios.get<{ data: PostDetail }>(
    `/api/editor/posts/${id}`,
    {
      withCredentials: true,
      headers: authHeaders,
    }
  )
  return response.data.data
}

async function createNewPost(title: string): Promise<PostListItem> {
  const authHeaders = await getAuthHeaders()
  const response = await axios.post<{ data: PostListItem }>(
    '/api/editor/posts',
    { title },
    {
      withCredentials: true,
      headers: authHeaders,
    }
  )
  return response.data.data
}

async function updatePost(
  id: string,
  patch: Partial<Pick<PostDetail, 'title' | 'excerpt' | 'content' | 'status'>>
): Promise<PostDetail> {
  const authHeaders = await getAuthHeaders()
  const response = await axios.patch<{ data: PostDetail }>(
    `/api/editor/posts/${id}`,
    patch,
    {
      withCredentials: true,
      headers: authHeaders,
    }
  )
  return response.data.data
}

function StatusTabs({
  value,
  onChange,
}: {
  value: PostStatus
  onChange: (v: PostStatus) => void
}) {
  const options: { label: string; value: PostStatus }[] = [
    { label: 'Drafts', value: 'draft' },
    { label: 'Published', value: 'published' },
    { label: 'Archived', value: 'archived' },
  ]
  return (
    <div className="flex w-fit items-center rounded-lg border border-black/10 bg-white p-1 dark:border-white/10 dark:bg-neutral-950">
      {options.map((opt) => {
        const active = value === opt.value
        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={[
              'rounded-md px-3 py-1.5 text-xs font-semibold transition',
              active
                ? 'bg-black text-white dark:bg-white dark:text-black'
                : 'text-black/70 hover:text-black dark:text-white/70 dark:hover:text-white',
            ].join(' ')}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}

function ToolbarButton({
  onClick,
  active,
  children,
  title,
}: {
  onClick: () => void
  active?: boolean
  children: React.ReactNode
  title?: string
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={[
        'flex h-7 w-7 items-center justify-center rounded transition-colors',
        active
          ? 'bg-neutral-700 text-white'
          : 'text-neutral-400 hover:bg-neutral-800 hover:text-white',
      ].join(' ')}
    >
      {children}
    </button>
  )
}

function FormatToolbar({
  textareaRef,
  onFormat,
}: {
  textareaRef: React.RefObject<HTMLTextAreaElement>
  onFormat: (format: string) => void
}) {
  const handleFormat = (format: string) => {
    if (!textareaRef.current) return
    const textarea = textareaRef.current
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = textarea.value.substring(start, end)
    const before = textarea.value.substring(0, start)
    const after = textarea.value.substring(end)

    let replacement = ''
    switch (format) {
      case 'bold':
        replacement = `**${selectedText || 'bold text'}**`
        break
      case 'italic':
        replacement = `*${selectedText || 'italic text'}*`
        break
      case 'code':
        replacement = `\`${selectedText || 'code'}\``
        break
      case 'quote':
        replacement = `> ${selectedText || 'quote'}`
        break
      case 'link':
        replacement = `[${selectedText || 'link text'}](url)`
        break
      case 'ul':
        replacement = selectedText
          ? selectedText
              .split('\n')
              .map((line) => `- ${line}`)
              .join('\n')
          : '- '
        break
      case 'ol':
        replacement = selectedText
          ? selectedText
              .split('\n')
              .map((line, i) => `${i + 1}. ${line}`)
              .join('\n')
          : '1. '
        break
    }

    const newValue = before + replacement + after
    textarea.value = newValue
    textarea.focus()
    const newCursor = start + replacement.length
    textarea.setSelectionRange(newCursor, newCursor)
    onFormat(newValue)
  }

  return (
    <div className="flex items-center gap-1 rounded-lg border border-neutral-800 bg-neutral-900 p-1">
      <ToolbarButton
        onClick={() => handleFormat('bold')}
        title="Bold (Ctrl+B)"
      >
        <Bold size={16} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => handleFormat('italic')}
        title="Italic (Ctrl+I)"
      >
        <Italic size={16} />
      </ToolbarButton>
      <div className="h-4 w-px bg-neutral-700" />
      <ToolbarButton onClick={() => handleFormat('code')} title="Code">
        <Code size={16} />
      </ToolbarButton>
      <ToolbarButton onClick={() => handleFormat('quote')} title="Quote">
        <Quote size={16} />
      </ToolbarButton>
      <div className="h-4 w-px bg-neutral-700" />
      <ToolbarButton onClick={() => handleFormat('link')} title="Link">
        <Link size={16} />
      </ToolbarButton>
      <div className="h-4 w-px bg-neutral-700" />
      <ToolbarButton onClick={() => handleFormat('ul')} title="Bullet List">
        <List size={16} />
      </ToolbarButton>
      <ToolbarButton onClick={() => handleFormat('ol')} title="Numbered List">
        <ListOrdered size={16} />
      </ToolbarButton>
    </div>
  )
}

export default function EditorPage() {
  const supabase = useMemo(() => createClient(), [])
  const { user, loading } = useSupabaseUser()

  const email = user?.email ?? null
  const allowed = isAllowedEditorEmail(email)

  const [status, setStatus] = useState<PostStatus>('draft')
  const [query, setQuery] = useState('')
  const [listLoading, setListLoading] = useState(false)
  const [items, setItems] = useState<PostListItem[]>([])

  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [detail, setDetail] = useState<PostDetail | null>(null)

  const [showCreate, setShowCreate] = useState(false)
  const [createLoading, setCreateLoading] = useState(false)
  const [newTitle, setNewTitle] = useState('')

  const [saving, setSaving] = useState(false)
  const contentTextareaRef = useRef<HTMLTextAreaElement>(null)

  async function signInWithGoogle() {
    const redirectTo = `${window.location.origin}/editor`
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo },
    })
    if (error) toast.error(`[Editor] Login error: ${error.message}`)
  }

  async function signOut() {
    await supabase.auth.signOut()
    setSelectedId(null)
    setDetail(null)
  }

  async function loadList(nextStatus = status, nextQuery = query) {
    setListLoading(true)
    try {
      const posts = await fetchPostsList(nextStatus, nextQuery)
      setItems(posts)
      if (posts.length && !selectedId) {
        setSelectedId(posts[0].id)
      }
    } catch (error: any) {
      console.error(error, 'error loading posts')
      const errorMessage =
        error?.response?.data?.error ?? error?.message ?? 'Unknown error'
      toast.error(`[Editor] Error loading posts: ${errorMessage}`)
    } finally {
      setListLoading(false)
    }
  }

  async function loadDetail(id: string) {
    setDetailLoading(true)
    try {
      const post = await fetchPostDetail(id)
      setDetail(post)
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.error ?? error?.message ?? 'Unknown error'
      toast.error(`[Editor] Error loading post: ${errorMessage}`)
      setDetail(null)
    } finally {
      setDetailLoading(false)
    }
  }

  async function createPost() {
    const title = newTitle.trim()
    if (!title) return
    setCreateLoading(true)
    try {
      const newPost = await createNewPost(title)
      setNewTitle('')
      setStatus('draft')
      await loadList('draft', query)
      setSelectedId(newPost.id)
      toast.success('[Editor] Draft created successfully')
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.error ?? error?.message ?? 'Unknown error'
      toast.error(`[Editor] Could not create draft: ${errorMessage}`)
    } finally {
      setCreateLoading(false)
      setShowCreate(false)
    }
  }

  async function savePatch(
    patch: Partial<Pick<PostDetail, 'title' | 'excerpt' | 'content' | 'status'>>
  ) {
    if (!detail?.id) return
    setSaving(true)
    try {
      const updatedPost = await updatePost(detail.id, patch)
      setDetail(updatedPost)
      await loadList(status, query)
      // toast.success('[Editor] Changes saved successfully')
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.error ?? error?.message ?? 'Unknown error'
      toast.error(`[Editor] Could not save: ${errorMessage}`)
    } finally {
      setSaving(false)
    }
  }

  useEffect(() => {
    if (!loading && user && allowed) {
      loadList('draft', '')
    }
  }, [loading, user?.id, allowed])

  useEffect(() => {
    if (selectedId && user && allowed) loadDetail(selectedId)
  }, [selectedId])

  useEffect(() => {
    if (user && allowed) loadList(status, query)
  }, [status])

  const headerRight = (
    <div className="flex items-center gap-2">
      <div className="hidden items-center gap-2 text-xs text-black/60 sm:flex dark:text-white/60">
        <span className="truncate">{email}</span>
      </div>
      <GhostButton
        size={Size.smallSquare}
        aria-label="Sign out"
        onClick={signOut}
      >
        <DoorOpen size={16} />
      </GhostButton>
    </div>
  )

  if (loading) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-neutral-950 text-white">
        <Loader2 className="animate-spin text-neutral-400" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-neutral-950 px-4 text-white">
        <div className="w-full max-w-md rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
          <div className="space-y-2">
            <h1 className="text-xl font-semibold tracking-tight">Editor</h1>
            <p className="text-sm text-neutral-400">Welcome Editor.</p>
          </div>
          <div className="mt-6">
            <PrimaryButton size={Size.large} onClick={signInWithGoogle}>
              Continue with Google
            </PrimaryButton>
          </div>
        </div>
      </div>
    )
  }

  if (!allowed) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-neutral-950 px-4 text-white">
        <div className="w-full max-w-md rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
          <div className="space-y-2">
            <h1 className="text-xl font-semibold tracking-tight">
              Access denied
            </h1>
            <p className="text-sm text-neutral-400">
              This account does not have permission to access the editor.
            </p>
          </div>
          <div className="mt-6 flex gap-2">
            <Button size={Size.large} onClick={signOut}>
              Sign out
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen w-full bg-white text-black dark:bg-neutral-950 dark:text-white">
      <div className="sticky top-0 z-10 border-b border-black/10 bg-white/80 backdrop-blur dark:border-white/10 dark:bg-neutral-950/80">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="text-md font-bold tracking-tight">Editor</div>
            <StatusTabs value={status} onChange={setStatus} />
          </div>
          {headerRight}
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-4 px-4 py-4 lg:grid-cols-[360px_1fr]">
        {/* Left: List */}
        <div className="rounded-2xl border border-black/10 bg-white p-3 dark:border-white/10 dark:bg-neutral-950">
          <div className="flex items-center justify-between gap-2">
            <div className="flex flex-1 items-center gap-2 rounded-lg border border-black/10 bg-white px-2 py-1.5 dark:border-white/10 dark:bg-neutral-950">
              <Search size={14} className="opacity-60" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') loadList(status, query)
                }}
                placeholder="Search by title or slug…"
                className="placeholder:text-black/40dark:placeholder:text-white/30 w-full bg-transparent text-sm outline-none ring-offset-0"
              />
            </div>
            <GhostButton
              size={Size.smallSquare}
              aria-label="New post"
              onClick={() => setShowCreate((v) => !v)}
            >
              <Plus size={16} />
            </GhostButton>
          </div>

          {showCreate && (
            <div className="mt-3 rounded-xl border border-black/10 p-3 dark:border-white/10">
              <FieldLabel>Title</FieldLabel>
              <input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="My new post…"
                className="mt-1 w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-black/30 dark:border-white/10 dark:bg-neutral-950 dark:focus:border-white/30"
              />
              <div className="mt-3 flex gap-2">
                <PrimaryButton
                  size={Size.small}
                  disabled={createLoading || !newTitle.trim()}
                  onClick={createPost}
                >
                  {createLoading ? 'Creating…' : 'Create draft'}
                </PrimaryButton>
                <Button
                  size={Size.small}
                  onClick={() => {
                    setShowCreate(false)
                    setNewTitle('')
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          <div className="mt-3">
            {listLoading ? (
              <div className="flex items-center justify-center py-10 text-black/60 dark:text-white/60">
                <Loader2 className="animate-spin" />
              </div>
            ) : items.length === 0 ? (
              <div className="py-10 text-center text-sm text-black/60 dark:text-white/60">
                No posts found in this section.
              </div>
            ) : (
              <div className="space-y-1">
                {items.map((it) => {
                  const active = it.id === selectedId
                  return (
                    <button
                      key={it.id}
                      onClick={() => setSelectedId(it.id)}
                      className={[
                        'w-full rounded-xl border px-3 py-2 text-left transition',
                        active
                          ? 'border-black/20 bg-black/[0.03] dark:border-white/20 dark:bg-white/[0.05]'
                          : 'border-transparent hover:border-black/10 hover:bg-black/[0.02] dark:hover:border-white/10 dark:hover:bg-white/[0.03]',
                      ].join(' ')}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="truncate text-sm font-semibold">
                            {it.title}
                          </div>
                          <div className="truncate text-xs text-black/50 dark:text-white/50">
                            {it.slug}
                          </div>
                        </div>
                        <div className="shrink-0 text-[11px] text-black/50 dark:text-white/50">
                          {formatDistanceToNowStrict(new Date(it.updated_at), {
                            addSuffix: true,
                          })}
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right: Editor */}
        <div className="rounded-2xl border border-black/10 bg-white dark:border-white/10 dark:bg-neutral-950">
          {!selectedId ? (
            <div className="flex items-center justify-center p-10 text-sm text-black/60 dark:text-white/60">
              Select a post to edit.
            </div>
          ) : detailLoading || !detail ? (
            <div className="flex items-center justify-center p-10 text-black/60 dark:text-white/60">
              <Loader2 className="animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-0 lg:grid-cols-2">
              <div className="border-b border-black/10 p-4 lg:border-b-0 lg:border-r dark:border-white/10">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-xs text-black/50 dark:text-white/50">
                      Slug
                    </div>
                    <div className="truncate text-sm font-semibold">
                      {detail.slug}
                    </div>
                  </div>
                </div>

                <div className="mt-4 space-y-4">
                  <div className="space-y-1">
                    <FieldLabel>Title</FieldLabel>
                    <input
                      value={detail.title}
                      onChange={(e) =>
                        setDetail({ ...detail, title: e.target.value })
                      }
                      onBlur={() => savePatch({ title: detail.title })}
                      className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-black/30 dark:border-white/10 dark:bg-neutral-950 dark:focus:border-white/30"
                    />
                  </div>

                  <div className="space-y-1">
                    <FieldLabel>Excerpt</FieldLabel>
                    <textarea
                      value={detail.excerpt ?? ''}
                      onChange={(e) =>
                        setDetail({ ...detail, excerpt: e.target.value })
                      }
                      onBlur={() =>
                        savePatch({ excerpt: detail.excerpt ?? '' })
                      }
                      rows={3}
                      className="w-full resize-y rounded-lg border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-black/30 dark:border-white/10 dark:bg-neutral-950 dark:focus:border-white/30"
                      placeholder="Short summary…"
                    />
                  </div>

                  <div className="space-y-1">
                    <FieldLabel>Content (Markdown)</FieldLabel>
                    <textarea
                      value={detail.content ?? ''}
                      onChange={(e) =>
                        setDetail({ ...detail, content: e.target.value })
                      }
                      onBlur={() =>
                        savePatch({ content: detail.content ?? '' })
                      }
                      rows={18}
                      className="w-full resize-y rounded-lg border border-black/10 bg-white px-3 py-2 font-mono text-xs outline-none focus:border-black/30 dark:border-white/10 dark:bg-neutral-950 dark:focus:border-white/30"
                      placeholder="# My post…"
                    />
                    <div className="flex items-center justify-between text-xs text-black/50 dark:text-white/50">
                      <span>
                        Last edited:{' '}
                        {formatDistanceToNowStrict(
                          new Date(detail.updated_at),
                          {
                            addSuffix: true,
                          }
                        )}
                      </span>
                      <button
                        onClick={() => selectedId && loadDetail(selectedId)}
                        className="underline underline-offset-2 hover:text-black dark:hover:text-white"
                      >
                        Reload
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4">
                <div className="mb-3 flex items-center justify-between">
                  <div className="text-xs font-semibold text-black/60 dark:text-white/60">
                    Preview
                  </div>
                  <div className="text-xs text-black/40 dark:text-white/40">
                    {detail.content?.length ?? 0} chars
                  </div>
                </div>
                <div className="prose max-w-none dark:prose-invert">
                  <MarkdownRenderer
                    children={detail.content ?? ''}
                    variant="longform"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
