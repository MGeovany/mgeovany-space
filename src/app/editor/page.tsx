'use client'

import axios from 'axios'
import { formatDistanceToNowStrict } from 'date-fns'
import {
  Archive,
  Bold,
  Code,
  DoorOpen,
  ExternalLink,
  Eye,
  Italic,
  Link,
  List,
  ListOrdered,
  Loader2,
  Lock,
  Maximize2,
  Minimize2,
  MoreVertical,
  Plus,
  Quote,
  RefreshCw,
  Save,
  Search,
  Trash2,
} from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import toast from 'react-hot-toast'

import { Button, GhostButton, PrimaryButton, Size } from '@/components/button'
import { Icons } from '@/components/icons'
import { MarkdownRenderer } from '@/components/markdown-renderer'
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
  source: 'local' | 'medium' | 'devto'
  published_at: string | null
  updated_at: string
  created_at: string
}

type PostDetail = PostListItem & {
  content: string | null
  content_html: string | null
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

async function deletePost(id: string): Promise<void> {
  const authHeaders = await getAuthHeaders()
  await axios.delete(`/api/editor/posts/${id}`, {
    withCredentials: true,
    headers: authHeaders,
  })
}

async function archivePost(id: string): Promise<PostDetail> {
  return updatePost(id, { status: 'archived' })
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
    <div className="flex items-center rounded-lg border border-neutral-800 bg-neutral-900 p-1">
      {options.map((opt) => {
        const active = value === opt.value
        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={[
              'rounded-md px-3 py-1.5 text-xs font-semibold transition-colors',
              active
                ? 'bg-neutral-800 text-white'
                : 'text-neutral-400 hover:text-neutral-300',
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
      <ToolbarButton onClick={() => handleFormat('bold')} title="Bold (Ctrl+B)">
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
  const [focusMode, setFocusMode] = useState(false)
  const [showMenuForId, setShowMenuForId] = useState<string | null>(null)
  const [syncingMedium, setSyncingMedium] = useState(false)
  const [syncingDevto, setSyncingDevto] = useState(false)
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

  async function handleSave(asStatus: 'draft' | 'published') {
    if (!detail?.id) return
    setSaving(true)
    try {
      const updatedPost = await updatePost(detail.id, { status: asStatus })
      setDetail(updatedPost)
      await loadList(asStatus, query)
      toast.success(
        `[Editor] Post ${asStatus === 'published' ? 'published' : 'saved as draft'} successfully`
      )
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.error ?? error?.message ?? 'Unknown error'
      toast.error(`[Editor] Could not save: ${errorMessage}`)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    toast(
      (t) => (
        <div className="mx-auto max-w-md rounded-lg bg-neutral-900 p-4 text-white">
          <h3 className="text-lg font-semibold">Delete post?</h3>
          <p className="mt-2 text-sm text-neutral-300">
            Are you sure you want to delete this post? This action cannot be
            undone.
          </p>
          <div className="mt-4 flex justify-end gap-2">
            <button
              className="rounded-lg bg-neutral-700 px-4 py-2 text-neutral-200 transition-colors hover:bg-neutral-600 focus:outline-none"
              onClick={() => toast.dismiss(t.id)}
            >
              Cancel
            </button>
            <button
              className="rounded-lg bg-red-500 px-4 py-2 text-white transition-colors hover:bg-red-600 focus:outline-none"
              onClick={async () => {
                toast.dismiss(t.id)
                try {
                  await deletePost(id)
                  if (selectedId === id) {
                    setSelectedId(null)
                    setDetail(null)
                  }
                  await loadList(status, query)
                  toast.success('[Editor] Post deleted successfully')
                } catch (error: any) {
                  const errorMessage =
                    error?.response?.data?.error ??
                    error?.message ??
                    'Unknown error'
                  toast.error(`[Editor] Could not delete: ${errorMessage}`)
                }
                setShowMenuForId(null)
              }}
            >
              Delete
            </button>
          </div>
        </div>
      ),
      {
        duration: Infinity,
        position: 'top-center',
      }
    )
  }

  async function handleArchive(id: string) {
    try {
      await archivePost(id)
      if (selectedId === id) {
        setSelectedId(null)
        setDetail(null)
      }
      await loadList(status, query)
      toast.success('[Editor] Post archived successfully')
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.error ?? error?.message ?? 'Unknown error'
      toast.error(`[Editor] Could not archive: ${errorMessage}`)
    }
    setShowMenuForId(null)
  }

  async function syncMedium() {
    setSyncingMedium(true)
    try {
      const response = await axios.post('/api/writings/sync-medium', {
        mediumUsername: 'mgeovany',
      })
      if (response.data.success) {
        toast.success(
          `[Editor] Synced ${response.data.synced} posts from Medium`
        )
        await loadList(status, query)
      }
      if (response.data.errors && response.data.errors.length > 0) {
        console.error('[Editor] Sync errors:', response.data.errors)
      }
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.error ?? error?.message ?? 'Unknown error'
      toast.error(`[Editor] Could not sync Medium: ${errorMessage}`)
    } finally {
      setSyncingMedium(false)
    }
  }

  async function syncDevto() {
    setSyncingDevto(true)
    try {
      const response = await axios.post('/api/writings/sync-devto', {
        devtoUsername: 'mgeovany',
      })
      if (response.data.success) {
        toast.success(
          `[Editor] Synced ${response.data.synced} posts from Dev.to`
        )
        await loadList(status, query)
      }
      if (response.data.errors && response.data.errors.length > 0) {
        console.error('[Editor] Sync errors:', response.data.errors)
      }
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.error ?? error?.message ?? 'Unknown error'
      toast.error(`[Editor] Could not sync Dev.to: ${errorMessage}`)
    } finally {
      setSyncingDevto(false)
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

  // Close menu when clicking outside
  useEffect(() => {
    if (!showMenuForId) return
    const handleClickOutside = () => setShowMenuForId(null)
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [showMenuForId])

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
    <div className="min-h-screen w-full bg-neutral-950 text-white">
      {/* Minimal Header */}
      <div className="sticky top-0 z-10 border-b border-neutral-800 bg-neutral-950/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-4">
            <div className="text-sm font-semibold text-neutral-300">Editor</div>
            <StatusTabs value={status} onChange={setStatus} />
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden text-xs text-neutral-500 sm:block">
              {email}
            </div>
            <button
              onClick={syncMedium}
              disabled={syncingMedium || syncingDevto}
              className="flex h-8 items-center gap-2 rounded border border-neutral-800 bg-neutral-900 px-3 text-xs text-neutral-400 transition-colors hover:bg-neutral-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Sync Medium"
              title="Sync posts from Medium"
            >
              <RefreshCw
                size={14}
                className={syncingMedium ? 'animate-spin' : ''}
              />
              <span className="hidden sm:inline">Sync Medium</span>
            </button>
            <button
              onClick={syncDevto}
              disabled={syncingMedium || syncingDevto}
              className="flex h-8 items-center gap-2 rounded border border-neutral-800 bg-neutral-900 px-3 text-xs text-neutral-400 transition-colors hover:bg-neutral-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Sync Dev.to"
              title="Sync posts from Dev.to"
            >
              <RefreshCw
                size={14}
                className={syncingDevto ? 'animate-spin' : ''}
              />
              <span className="hidden sm:inline">Sync Dev.to</span>
            </button>
            <button
              onClick={() => setFocusMode(!focusMode)}
              className="flex h-8 w-8 items-center justify-center rounded text-neutral-400 transition-colors hover:bg-neutral-800 hover:text-white"
              aria-label={focusMode ? 'Exit focus mode' : 'Enter focus mode'}
              title={focusMode ? 'Exit focus mode' : 'Enter focus mode'}
            >
              {focusMode ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            </button>
            <button
              onClick={signOut}
              className="flex h-8 w-8 items-center justify-center rounded text-neutral-400 transition-colors hover:bg-neutral-800 hover:text-white"
              aria-label="Sign out"
            >
              <DoorOpen size={16} />
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto flex max-w-6xl gap-6 px-6 py-6">
        {/* Left: Minimal Sidebar */}
        {!focusMode && (
          <div className="flex h-[calc(100vh-120px)] w-64 shrink-0 flex-col overflow-hidden">
            <div className="flex shrink-0 items-center gap-2 rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2">
              <Search size={14} className="text-neutral-500" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') loadList(status, query)
                }}
                placeholder="Search…"
                className="w-full bg-transparent text-sm text-white outline-none placeholder:text-neutral-500"
              />
              <button
                onClick={() => setShowCreate((v) => !v)}
                className="flex h-6 w-6 items-center justify-center rounded text-neutral-400 transition-colors hover:bg-neutral-800 hover:text-white"
                aria-label="New post"
              >
                <Plus size={14} />
              </button>
            </div>

            {showCreate && (
              <div className="mt-3 shrink-0 rounded-lg border border-neutral-800 bg-neutral-900 p-3">
                <input
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="New post title…"
                  className="w-full rounded border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-white outline-none placeholder:text-neutral-500 focus:border-neutral-700"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && newTitle.trim()) {
                      createPost()
                    }
                  }}
                />
                <div className="mt-2 flex gap-2">
                  <button
                    onClick={createPost}
                    disabled={createLoading || !newTitle.trim()}
                    className="rounded bg-neutral-800 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {createLoading ? 'Creating…' : 'Create'}
                  </button>
                  <button
                    onClick={() => {
                      setShowCreate(false)
                      setNewTitle('')
                    }}
                    className="rounded border border-neutral-800 px-3 py-1.5 text-xs font-medium text-neutral-400 transition-colors hover:bg-neutral-800 hover:text-white"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            <div className="mt-4 flex-1 overflow-y-auto">
              {listLoading ? (
                <div className="flex items-center justify-center py-10">
                  <Loader2
                    className="animate-spin text-neutral-500"
                    size={20}
                  />
                </div>
              ) : items.length === 0 ? (
                <div className="py-10 text-center text-xs text-neutral-500">
                  No posts found
                </div>
              ) : (
                <div className="space-y-1 pb-2">
                  {items.map((it) => {
                    const active = it.id === selectedId
                    const showMenu = showMenuForId === it.id
                    return (
                      <div
                        key={it.id}
                        className={[
                          'group relative flex items-center gap-2 rounded-lg transition-colors',
                          active ? 'bg-neutral-800' : 'hover:bg-neutral-900',
                        ].join(' ')}
                      >
                        <button
                          onClick={() => setSelectedId(it.id)}
                          className={[
                            'flex-1 px-3 py-2 text-left transition-colors',
                            active
                              ? 'text-white'
                              : 'text-neutral-400 hover:text-neutral-300',
                          ].join(' ')}
                        >
                          <div className="flex min-w-0 items-start gap-2">
                            <div className="min-w-0 flex-1">
                              <div className="line-clamp-2 break-words text-sm font-medium">
                                {it.title}
                              </div>
                            </div>
                            {it.source && it.source !== 'local' && (
                              <div className="flex shrink-0 items-center gap-1 rounded-full bg-neutral-700 px-1.5 py-0.5">
                                {it.source === 'medium' && (
                                  <Icons.medium className="h-3 w-3" />
                                )}
                                {it.source === 'devto' && (
                                  <Icons.devTo className="h-3 w-3" />
                                )}
                                <span className="text-[10px] text-neutral-400">
                                  {it.source}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="truncate text-xs text-neutral-500">
                            {formatDistanceToNowStrict(
                              new Date(it.updated_at),
                              {
                                addSuffix: true,
                              }
                            )}
                          </div>
                        </button>
                        <div className="relative">
                          {(it.source === 'local' ||
                            status === 'published') && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                setShowMenuForId(showMenu ? null : it.id)
                              }}
                              className="mr-2 flex h-8 w-8 items-center justify-center rounded text-neutral-500 opacity-0 transition-opacity hover:bg-neutral-800 hover:text-white group-hover:opacity-100"
                              aria-label="Options"
                            >
                              <MoreVertical size={14} />
                            </button>
                          )}
                          {showMenu &&
                            (it.source === 'local' ||
                              status === 'published') && (
                              <div className="absolute right-2 top-10 z-50 rounded-lg border border-neutral-800 bg-neutral-900 shadow-lg">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleArchive(it.id)
                                  }}
                                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-neutral-300 transition-colors hover:bg-neutral-800"
                                >
                                  <Archive size={14} />
                                  Archive
                                </button>
                                {it.source === 'local' && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleDelete(it.id)
                                    }}
                                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-400 transition-colors hover:bg-neutral-800"
                                  >
                                    <Trash2 size={14} />
                                    Delete
                                  </button>
                                )}
                              </div>
                            )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Right: Focused Editor */}
        <div className="flex-1">
          {!selectedId ? (
            <div className="flex h-[calc(100vh-120px)] items-center justify-center text-sm text-neutral-500">
              Select a post to edit
            </div>
          ) : detailLoading || !detail ? (
            <div className="flex h-[calc(100vh-120px)] items-center justify-center">
              <Loader2 className="animate-spin text-neutral-500" />
            </div>
          ) : detail.source && detail.source !== 'local' ? (
            // Read-only view for synced posts
            <div className="flex h-[calc(100vh-120px)] flex-col overflow-y-auto">
              <div className="mb-6 flex items-center gap-3 rounded-lg border border-neutral-800 bg-neutral-900/50 px-4 py-3">
                <Lock size={16} className="text-neutral-400" />
                <div className="flex items-center gap-2">
                  <span className="text-sm text-neutral-400">
                    This post is synced from
                  </span>
                  {detail.source === 'medium' && (
                    <Icons.medium className="h-4 w-4" />
                  )}
                  {detail.source === 'devto' && (
                    <Icons.devTo className="h-4 w-4" />
                  )}
                  <span className="text-sm font-medium capitalize text-neutral-300">
                    {detail.source}
                  </span>
                  <span className="text-sm text-neutral-400">
                    and cannot be edited
                  </span>
                </div>
                {detail.url && (
                  <a
                    href={detail.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-auto flex items-center gap-2 rounded border border-neutral-800 bg-neutral-800 px-3 py-1.5 text-xs text-neutral-300 transition-colors hover:bg-neutral-700"
                  >
                    <ExternalLink size={12} />
                    View original
                  </a>
                )}
              </div>

              <h1 className="mb-4 text-3xl font-bold text-white">
                {detail.title}
              </h1>

              {detail.excerpt && (
                <p className="mb-6 text-lg leading-relaxed text-neutral-400">
                  {detail.excerpt}
                </p>
              )}

              {(detail.content || detail.content_html) && (
                <div className="prose prose-invert max-w-none prose-headings:text-neutral-100 prose-p:text-neutral-300 prose-a:text-blue-400 prose-strong:text-neutral-100 prose-code:text-neutral-200 prose-pre:border prose-pre:border-neutral-800 prose-pre:bg-neutral-900">
                  {detail.content_html ? (
                    <div
                      dangerouslySetInnerHTML={{
                        __html: detail.content_html,
                      }}
                    />
                  ) : (
                    <MarkdownRenderer>{detail.content || ''}</MarkdownRenderer>
                  )}
                </div>
              )}

              <div className="mt-8 border-t border-neutral-800 pt-4 text-xs text-neutral-500">
                Published{' '}
                {detail.published_at
                  ? formatDistanceToNowStrict(new Date(detail.published_at), {
                      addSuffix: true,
                    })
                  : 'N/A'}
              </div>
            </div>
          ) : (
            // Editable view for local posts
            <div className="flex h-[calc(100vh-120px)] flex-col">
              {/* Title Input */}
              <input
                value={detail.title}
                onChange={(e) =>
                  setDetail({ ...detail, title: e.target.value })
                }
                onBlur={() => savePatch({ title: detail.title })}
                placeholder="Post title…"
                className="mb-4 bg-transparent text-3xl font-bold text-white outline-none placeholder:text-neutral-600"
              />

              {/* Toolbar */}
              <div className="mb-4 flex items-center justify-between gap-4">
                <FormatToolbar
                  textareaRef={contentTextareaRef}
                  onFormat={(newContent) => {
                    setDetail({ ...detail, content: newContent })
                    savePatch({ content: newContent })
                  }}
                />
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleSave('draft')}
                    disabled={saving}
                    className="flex items-center gap-2 rounded border border-neutral-800 bg-neutral-900 px-3 py-1.5 text-sm font-medium text-neutral-300 transition-colors hover:bg-neutral-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Save size={14} />
                    Save Draft
                  </button>
                  <button
                    onClick={() => handleSave('published')}
                    disabled={saving}
                    className="flex items-center gap-2 rounded bg-white px-3 py-1.5 text-sm font-medium text-neutral-950 transition-colors hover:bg-neutral-200 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Eye size={14} />
                    Publish
                  </button>
                </div>
              </div>

              {/* Content Editor */}
              <textarea
                ref={contentTextareaRef}
                value={detail.content ?? ''}
                onChange={(e) =>
                  setDetail({ ...detail, content: e.target.value })
                }
                onBlur={() => savePatch({ content: detail.content ?? '' })}
                placeholder="Start writing…"
                className="flex-1 resize-none bg-transparent text-base leading-relaxed text-neutral-300 outline-none placeholder:text-neutral-600"
              />

              {/* Footer */}
              <div className="mt-4 flex items-center justify-between border-t border-neutral-800 pt-4 text-xs text-neutral-500">
                <div className="flex items-center gap-4">
                  {saving && (
                    <span className="flex items-center gap-2">
                      <Loader2 className="animate-spin" size={12} />
                      Saving…
                    </span>
                  )}
                </div>
                <div>
                  {detail.content?.length ?? 0} chars • Last edited{' '}
                  {formatDistanceToNowStrict(new Date(detail.updated_at), {
                    addSuffix: true,
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
