'use client'

import axios from 'axios'
import { formatDistanceToNowStrict } from 'date-fns'
import {
  Archive,
  Bookmark,
  Check,
  DoorOpen,
  Edit,
  ExternalLink,
  FileText,
  FolderKanban,
  Link,
  Loader2,
  MoreVertical,
  Plus,
  RefreshCw,
  Search,
  Trash2,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

import { Button, PrimaryButton, Size } from '@/components/button'
import { Icons } from '@/components/icons'
import { useSupabaseUser } from '@/hooks/useSupabaseUser'
import { isAllowedEditorEmail } from '@/lib/editor/allowed'
import { createClient } from '@/lib/supabase/client'
import { Project as ProjectType } from '@/types/project'

type TabType = 'blogs' | 'bookmarks' | 'projects'

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
  url?: string | null
}

interface GoogleBookmark {
  id: string
  title: string
  url: string
  folder_path: string | null
  add_date: number | null
  icon_url: string | null
  created_at: string
  updated_at: string
}

interface Bookmark {
  id: number
  title: string
  description: string
  url: string
  tag: string
  createdAt: string
  updatedAt: string
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

export default function EditorPage() {
  const router = useRouter()
  const { user, loading } = useSupabaseUser()
  const email = user?.email ?? null
  const allowed = isAllowedEditorEmail(email)

  // Get tab from URL query params, default to 'blogs'
  const [activeTab, setActiveTab] = useState<TabType>('blogs')

  // Sync tab with URL query params
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const tabParam = params.get('tab') as TabType | null
      if (tabParam && ['blogs', 'bookmarks', 'projects'].includes(tabParam)) {
        setActiveTab(tabParam)
      }
    }
  }, [])
  const [query, setQuery] = useState('')

  // Blogs state
  const [blogStatus, setBlogStatus] = useState<PostStatus>('published')
  const [blogs, setBlogs] = useState<PostListItem[]>([])
  const [blogsLoading, setBlogsLoading] = useState(false)
  const [showMenuForId, setShowMenuForId] = useState<string | null>(null)
  const [selectedBlogs, setSelectedBlogs] = useState<Set<string>>(new Set())

  // Bookmarks state
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
  const [googleBookmarks, setGoogleBookmarks] = useState<GoogleBookmark[]>([])
  const [bookmarksLoading, setBookmarksLoading] = useState(false)
  const [showBookmarkMenuForId, setShowBookmarkMenuForId] = useState<
    string | null
  >(null)
  const [selectedBookmarks, setSelectedBookmarks] = useState<Set<string>>(
    new Set()
  )
  const [selectedGoogleBookmarks, setSelectedGoogleBookmarks] = useState<
    Set<string>
  >(new Set())

  // Projects state
  const [projects, setProjects] = useState<ProjectType[]>([])
  const [projectsLoading, setProjectsLoading] = useState(false)
  const [selectedProjects, setSelectedProjects] = useState<Set<string>>(
    new Set()
  )

  // Sync states
  const [syncingMedium, setSyncingMedium] = useState(false)
  const [syncingDevto, setSyncingDevto] = useState(false)
  const [syncingBookmarks, setSyncingBookmarks] = useState(false)

  async function signInWithGoogle() {
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/editor`,
      },
    })
    if (error) {
      toast.error(`[Editor] Sign in failed: ${error.message}`)
    }
  }

  async function signOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.reload()
  }

  async function loadBlogs() {
    setBlogsLoading(true)
    try {
      const authHeaders = await getAuthHeaders()
      const params = new URLSearchParams()
      params.set('status', blogStatus)
      if (query.trim()) params.set('q', query.trim())

      const response = await axios.get<{ data: PostListItem[] }>(
        `/api/editor/posts?${params.toString()}`,
        {
          withCredentials: true,
          headers: authHeaders,
        }
      )
      setBlogs(response.data.data ?? [])
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.error ?? error?.message ?? 'Unknown error'
      toast.error(`[Editor] Could not load blogs: ${errorMessage}`)
    } finally {
      setBlogsLoading(false)
    }
  }

  async function loadBookmarks() {
    setBookmarksLoading(true)
    try {
      const response = await axios.get('/api/bookmarks/sync-google')
      setGoogleBookmarks(response.data.data || [])
    } catch (error: any) {
      toast.error(`[Editor] Could not load bookmarks: ${error.message}`)
    } finally {
      setBookmarksLoading(false)
    }
  }

  async function loadProjects() {
    setProjectsLoading(true)
    try {
      const authHeaders = await getAuthHeaders()
      const response = await axios.get('/api/projects?includeArchived=true', {
        withCredentials: true,
        headers: authHeaders,
      })
      setProjects(response.data.data || [])
    } catch (error: any) {
      toast.error(`[Editor] Could not load projects: ${error.message}`)
    } finally {
      setProjectsLoading(false)
    }
  }

  useEffect(() => {
    if (!loading && user && allowed) {
      if (activeTab === 'blogs') loadBlogs()
      if (activeTab === 'bookmarks') loadBookmarks()
      if (activeTab === 'projects') loadProjects()
    }
  }, [activeTab, blogStatus, query, loading, user, allowed])

  // Close menu when clicking outside
  useEffect(() => {
    if (!showBookmarkMenuForId) return
    const handleClickOutside = () => {
      if (showBookmarkMenuForId) setShowBookmarkMenuForId(null)
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [showBookmarkMenuForId])

  async function handleArchiveBlog(id: string) {
    try {
      const authHeaders = await getAuthHeaders()
      await axios.patch(
        `/api/editor/posts/${id}`,
        { status: 'archived' },
        {
          withCredentials: true,
          headers: authHeaders,
        }
      )
      toast.success('[Editor] Post archived successfully')
      await loadBlogs()
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.error ?? error?.message ?? 'Unknown error'
      toast.error(`[Editor] Could not archive: ${errorMessage}`)
    }
    setShowMenuForId(null)
  }

  async function handleDeleteBlog(id: string) {
    try {
      const authHeaders = await getAuthHeaders()
      await axios.delete(`/api/editor/posts/${id}`, {
        withCredentials: true,
        headers: authHeaders,
      })
      toast.success('[Editor] Post deleted successfully')
      await loadBlogs()
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.error ?? error?.message ?? 'Unknown error'
      toast.error(`[Editor] Could not delete: ${errorMessage}`)
    }
    setShowMenuForId(null)
  }

  async function handleArchiveBookmark(id: string) {
    try {
      const authHeaders = await getAuthHeaders()
      await axios.patch(
        `/api/bookmarks/google/${id}`,
        { archived: true },
        {
          withCredentials: true,
          headers: authHeaders,
        }
      )
      toast.success('[Editor] Bookmark archived successfully')
      await loadBookmarks()
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.error ?? error?.message ?? 'Unknown error'
      toast.error(`[Editor] Could not archive: ${errorMessage}`)
    }
    setShowBookmarkMenuForId(null)
  }

  async function handleArchiveMultipleBlogs() {
    if (selectedBlogs.size === 0) return

    try {
      const authHeaders = await getAuthHeaders()
      const promises = Array.from(selectedBlogs).map((id) =>
        axios.patch(
          `/api/editor/posts/${id}`,
          { status: 'archived' },
          {
            withCredentials: true,
            headers: authHeaders,
          }
        )
      )

      await Promise.all(promises)
      toast.success(
        `[Editor] ${selectedBlogs.size} post(s) archived successfully`
      )
      setSelectedBlogs(new Set())
      await loadBlogs()
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.error ?? error?.message ?? 'Unknown error'
      toast.error(`[Editor] Could not archive: ${errorMessage}`)
    }
  }

  async function handleArchiveMultipleBookmarks() {
    const totalSelected = selectedBookmarks.size + selectedGoogleBookmarks.size
    if (totalSelected === 0) return

    try {
      const authHeaders = await getAuthHeaders()
      const promises: Promise<any>[] = []

      // Archive regular bookmarks (if they have an archive endpoint)
      // For now, we'll only archive Google bookmarks
      selectedGoogleBookmarks.forEach((id) => {
        promises.push(
          axios.patch(
            `/api/bookmarks/google/${id}`,
            { archived: true },
            {
              withCredentials: true,
              headers: authHeaders,
            }
          )
        )
      })

      await Promise.all(promises)
      toast.success(
        `[Editor] ${totalSelected} bookmark(s) archived successfully`
      )
      setSelectedBookmarks(new Set())
      setSelectedGoogleBookmarks(new Set())
      await loadBookmarks()
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.error ?? error?.message ?? 'Unknown error'
      toast.error(`[Editor] Could not archive: ${errorMessage}`)
    }
  }

  async function handleArchiveProject(id: string) {
    try {
      const authHeaders = await getAuthHeaders()
      await axios.patch(
        `/api/projects/${id}`,
        { status: 'Archived' },
        {
          withCredentials: true,
          headers: authHeaders,
        }
      )
      toast.success('[Editor] Project archived successfully')
      await loadProjects()
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.error ?? error?.message ?? 'Unknown error'
      toast.error(`[Editor] Could not archive: ${errorMessage}`)
    }
  }

  async function handleArchiveMultipleProjects() {
    if (selectedProjects.size === 0) return

    try {
      const authHeaders = await getAuthHeaders()
      const promises = Array.from(selectedProjects).map((id) =>
        axios.patch(
          `/api/projects/${id}`,
          { status: 'Archived' },
          {
            withCredentials: true,
            headers: authHeaders,
          }
        )
      )

      await Promise.all(promises)
      toast.success(
        `[Editor] ${selectedProjects.size} project(s) archived successfully`
      )
      setSelectedProjects(new Set())
      await loadProjects()
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.error ?? error?.message ?? 'Unknown error'
      toast.error(`[Editor] Could not archive: ${errorMessage}`)
    }
  }

  function handleNewProject() {
    router.push('/editor/projects/new')
  }

  function handleEditProject(project: ProjectType) {
    router.push(`/editor/projects/${project.id}/edit`)
  }

  function toggleBlogSelection(id: string) {
    const newSet = new Set(selectedBlogs)
    if (newSet.has(id)) {
      newSet.delete(id)
    } else {
      newSet.add(id)
    }
    setSelectedBlogs(newSet)
  }

  function toggleBookmarkSelection(id: string) {
    const newSet = new Set(selectedBookmarks)
    if (newSet.has(id)) {
      newSet.delete(id)
    } else {
      newSet.add(id)
    }
    setSelectedBookmarks(newSet)
  }

  function toggleGoogleBookmarkSelection(id: string) {
    const newSet = new Set(selectedGoogleBookmarks)
    if (newSet.has(id)) {
      newSet.delete(id)
    } else {
      newSet.add(id)
    }
    setSelectedGoogleBookmarks(newSet)
  }

  function toggleProjectSelection(id: string) {
    const newSet = new Set(selectedProjects)
    if (newSet.has(id)) {
      newSet.delete(id)
    } else {
      newSet.add(id)
    }
    setSelectedProjects(newSet)
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
        await loadBlogs()
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
        await loadBlogs()
      }
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.error ?? error?.message ?? 'Unknown error'
      toast.error(`[Editor] Could not sync Dev.to: ${errorMessage}`)
    } finally {
      setSyncingDevto(false)
    }
  }

  async function syncGoogleBookmarks() {
    setSyncingBookmarks(true)
    try {
      const supabase = createClient()
      const {
        data: { session },
      } = await supabase.auth.getSession()
      const accessToken = session?.access_token

      if (!accessToken) {
        toast.error('[Editor] No access token available')
        return
      }

      const response = await axios.post(
        '/api/bookmarks/sync-google',
        {},
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      )
      if (response.status === 200) {
        toast.success(
          `[Editor] Bookmarks synced successfully (${response.data.synced} bookmarks)`
        )
        await loadBookmarks()
      }
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.error ?? error?.message ?? 'Unknown error'
      toast.error(`[Editor] Could not sync bookmarks: ${errorMessage}`)
    } finally {
      setSyncingBookmarks(false)
    }
  }

  // Close menu when clicking outside
  useEffect(() => {
    if (!showMenuForId) return
    const handleClickOutside = () => setShowMenuForId(null)
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [showMenuForId])

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
              You don&apos;t have permission to access this page.
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

  const tabs = [
    { id: 'blogs' as TabType, label: 'Blogs', icon: FileText },
    { id: 'bookmarks' as TabType, label: 'Bookmarks', icon: Bookmark },
    { id: 'projects' as TabType, label: 'Projects', icon: FolderKanban },
  ]

  return (
    <div className="min-h-screen w-full bg-neutral-950 text-white">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-neutral-800 bg-neutral-950/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="hidden text-sm font-semibold text-neutral-300 sm:block">
              Editor
            </div>
            <div className="flex items-center rounded-lg border border-neutral-800 bg-neutral-900 p-1">
              {tabs.map((tab) => {
                const Icon = tab.icon
                const isActive = activeTab === tab.id
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={[
                      'flex items-center gap-1.5 rounded px-2.5 py-2 text-xs font-medium transition-colors sm:gap-2 sm:px-3',
                      isActive
                        ? 'bg-neutral-800 text-white'
                        : 'text-neutral-400 hover:text-neutral-300',
                    ].join(' ')}
                  >
                    <Icon size={14} />
                    <span className="xs:inline hidden">{tab.label}</span>
                  </button>
                )
              })}
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden text-xs text-neutral-500 md:block">
              {email}
            </div>
            {activeTab === 'blogs' && (
              <>
                <button
                  onClick={syncMedium}
                  disabled={syncingMedium || syncingDevto || syncingBookmarks}
                  className="flex h-9 items-center gap-1.5 rounded-md border border-neutral-800 bg-neutral-900 px-2.5 py-2 text-xs font-medium text-neutral-400 transition-colors hover:bg-neutral-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-50 sm:gap-2 sm:px-3"
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
                  disabled={syncingMedium || syncingDevto || syncingBookmarks}
                  className="flex h-9 items-center gap-1.5 rounded-md border border-neutral-800 bg-neutral-900 px-2.5 py-2 text-xs font-medium text-neutral-400 transition-colors hover:bg-neutral-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-50 sm:gap-2 sm:px-3"
                  aria-label="Sync Dev.to"
                  title="Sync posts from Dev.to"
                >
                  <RefreshCw
                    size={14}
                    className={syncingDevto ? 'animate-spin' : ''}
                  />
                  <span className="hidden sm:inline">Sync Dev.to</span>
                </button>
              </>
            )}
            {activeTab === 'bookmarks' && (
              <button
                onClick={syncGoogleBookmarks}
                disabled={syncingMedium || syncingDevto || syncingBookmarks}
                className="flex h-9 items-center gap-1.5 rounded-md border border-neutral-800 bg-neutral-900 px-2.5 py-2 text-xs font-medium text-neutral-400 transition-colors hover:bg-neutral-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-50 sm:gap-2 sm:px-3"
                aria-label="Sync Google Bookmarks"
                title="Sync bookmarks from Google Chrome"
              >
                {syncingBookmarks ? (
                  <RefreshCw size={14} className="animate-spin" />
                ) : (
                  <Bookmark size={14} />
                )}
                <span className="hidden sm:inline">Sync Bookmarks</span>
              </button>
            )}
            {activeTab === 'projects' && (
              <button
                onClick={handleNewProject}
                className="flex h-9 items-center gap-1.5 rounded-md border border-neutral-800 bg-neutral-900 px-2.5 py-2 text-xs font-medium text-neutral-400 transition-colors hover:bg-neutral-800 hover:text-white sm:gap-2 sm:px-3"
                aria-label="New Project"
                title="Create a new project"
              >
                <Plus size={14} />
                <span className="hidden sm:inline">New Project</span>
              </button>
            )}
            <button
              onClick={signOut}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-neutral-400 transition-colors hover:bg-neutral-800 hover:text-white"
              aria-label="Sign out"
            >
              <DoorOpen size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6 sm:py-6">
        <div className="max-h-[calc(100vh-120px)] overflow-y-auto pr-2">
          {/* Search */}
          {activeTab === 'blogs' && (
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="flex flex-1 items-center gap-2 rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2.5">
                <Search size={14} className="shrink-0 text-neutral-500" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search blogs..."
                  className="w-full bg-transparent text-sm text-white outline-none placeholder:text-neutral-500"
                />
              </div>
              <div className="flex items-center gap-2">
                {selectedBlogs.size > 0 && (
                  <button
                    onClick={handleArchiveMultipleBlogs}
                    className="flex items-center gap-1.5 rounded-md border border-neutral-800 bg-neutral-900 px-3 py-1.5 text-xs font-medium text-neutral-300 transition-colors hover:bg-neutral-800 hover:text-white"
                  >
                    <Archive size={14} />
                    <span>Archive ({selectedBlogs.size})</span>
                  </button>
                )}
                <div className="flex items-center rounded-lg border border-neutral-800 bg-neutral-900 p-1">
                  {(['draft', 'published', 'archived'] as PostStatus[]).map(
                    (status) => (
                      <button
                        key={status}
                        onClick={() => setBlogStatus(status)}
                        className={[
                          'rounded-md px-3 py-1.5 text-xs font-medium capitalize transition-colors',
                          blogStatus === status
                            ? 'bg-neutral-800 text-white'
                            : 'text-neutral-400 hover:text-neutral-300',
                        ].join(' ')}
                      >
                        {status}
                      </button>
                    )
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Bookmarks Actions */}
          {activeTab === 'bookmarks' &&
            (selectedBookmarks.size > 0 ||
              selectedGoogleBookmarks.size > 0) && (
              <div className="mb-4">
                <button
                  onClick={handleArchiveMultipleBookmarks}
                  className="flex items-center gap-1.5 rounded-md border border-neutral-800 bg-neutral-900 px-3 py-1.5 text-xs font-medium text-neutral-300 transition-colors hover:bg-neutral-800 hover:text-white"
                >
                  <Archive size={14} />
                  <span>
                    Archive (
                    {selectedBookmarks.size + selectedGoogleBookmarks.size})
                  </span>
                </button>
              </div>
            )}

          {/* Projects Actions */}
          {activeTab === 'projects' && selectedProjects.size > 0 && (
            <div className="mb-4">
              <button
                onClick={handleArchiveMultipleProjects}
                className="flex items-center gap-1.5 rounded-md border border-neutral-800 bg-neutral-900 px-3 py-1.5 text-xs font-medium text-neutral-300 transition-colors hover:bg-neutral-800 hover:text-white"
              >
                <Archive size={14} />
                <span>Archive ({selectedProjects.size})</span>
              </button>
            </div>
          )}

          {/* Blogs List */}
          {activeTab === 'blogs' && (
            <div className="space-y-2">
              {blogsLoading ? (
                <div className="flex items-center justify-center py-10">
                  <Loader2
                    className="animate-spin text-neutral-500"
                    size={20}
                  />
                </div>
              ) : blogs.length === 0 ? (
                <div className="py-10 text-center text-xs text-neutral-500">
                  No posts found
                </div>
              ) : (
                blogs.map((post) => {
                  const showMenu = showMenuForId === post.id
                  const isSelected = selectedBlogs.has(post.id)
                  return (
                    <div
                      key={post.id}
                      className="group relative flex items-center gap-2 rounded-lg border border-neutral-800 bg-neutral-900/50 p-3.5 transition-colors hover:bg-neutral-900 sm:p-4"
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleBlogSelection(post.id)
                        }}
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors ${
                          isSelected
                            ? 'border-blue-500 bg-blue-500'
                            : 'border-neutral-700 hover:border-neutral-600'
                        }`}
                        aria-label="Select post"
                      >
                        {isSelected && (
                          <Check size={12} className="text-white" />
                        )}
                      </button>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start gap-2">
                          <div className="min-w-0 flex-1">
                            <div className="line-clamp-2 break-words text-sm font-medium text-neutral-200">
                              {post.title}
                            </div>
                            <div className="mt-1 flex items-center gap-2 text-xs text-neutral-500">
                              {post.source && post.source !== 'local' && (
                                <div className="flex items-center gap-1 rounded-full bg-neutral-800 px-1.5 py-0.5">
                                  {post.source === 'medium' && (
                                    <Icons.medium className="h-3 w-3" />
                                  )}
                                  {post.source === 'devto' && (
                                    <Icons.devTo className="h-3 w-3" />
                                  )}
                                  <span className="text-[10px] capitalize">
                                    {post.source}
                                  </span>
                                </div>
                              )}
                              <span>
                                {formatDistanceToNowStrict(
                                  new Date(post.updated_at),
                                  { addSuffix: true }
                                )}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="relative">
                        {(post.source === 'local' ||
                          blogStatus === 'published') && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setShowMenuForId(showMenu ? null : post.id)
                            }}
                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-neutral-500 opacity-0 transition-opacity hover:bg-neutral-800 hover:text-white group-hover:opacity-100 sm:h-10 sm:w-10"
                            aria-label="Options"
                          >
                            <MoreVertical size={16} />
                          </button>
                        )}
                        {showMenu &&
                          (post.source === 'local' ||
                            blogStatus === 'published') && (
                            <div className="absolute right-0 top-11 z-50 min-w-[180px] rounded-lg border border-neutral-800 bg-neutral-900 shadow-xl backdrop-blur-sm transition-all duration-200">
                              <div className="p-1.5">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    let postUrl: string | null = null

                                    if (post.url) {
                                      // Use external URL if available (Medium/Dev.to)
                                      postUrl = post.url
                                    } else if (post.source === 'local') {
                                      // For local posts, use the public writing page
                                      postUrl = `${window.location.origin}/writing/${post.id}`
                                    } else if (
                                      post.source === 'medium' ||
                                      post.source === 'devto'
                                    ) {
                                      // Try to construct URL from slug if no URL is stored
                                      // This is a fallback
                                      console.warn(
                                        `[Editor] Post ${post.id} has no URL but source is ${post.source}`
                                      )
                                    }

                                    if (postUrl) {
                                      window.open(
                                        postUrl,
                                        '_blank',
                                        'noopener,noreferrer'
                                      )
                                    } else {
                                      toast.error(
                                        '[Editor] Could not determine post URL'
                                      )
                                    }
                                    setShowMenuForId(null)
                                  }}
                                  className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm font-medium text-neutral-300 transition-colors hover:bg-neutral-800 hover:text-white"
                                >
                                  <ExternalLink
                                    size={14}
                                    className="text-neutral-400"
                                  />
                                  <span>Go to post</span>
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleArchiveBlog(post.id)
                                  }}
                                  className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm font-medium text-neutral-300 transition-colors hover:bg-neutral-800 hover:text-white"
                                >
                                  <Archive
                                    size={14}
                                    className="text-neutral-400"
                                  />
                                  <span>Archive</span>
                                </button>
                                {post.source === 'local' && (
                                  <>
                                    <div className="my-1 h-px bg-neutral-800" />
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        handleDeleteBlog(post.id)
                                      }}
                                      className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm font-medium text-red-400 transition-colors hover:bg-red-500/10 hover:text-red-300"
                                    >
                                      <Trash2 size={14} />
                                      <span>Delete</span>
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>
                          )}
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          )}

          {/* Bookmarks List */}
          {activeTab === 'bookmarks' && (
            <div className="space-y-4">
              {bookmarksLoading ? (
                <div className="flex items-center justify-center py-10">
                  <Loader2
                    className="animate-spin text-neutral-500"
                    size={20}
                  />
                </div>
              ) : (
                <>
                  {bookmarks.length > 0 && (
                    <div>
                      <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-neutral-500">
                        My Bookmarks
                      </h2>
                      <div className="space-y-2">
                        {bookmarks.map((bookmark) => {
                          const showMenu =
                            showBookmarkMenuForId === `bookmark-${bookmark.id}`
                          const isSelected = selectedBookmarks.has(
                            `bookmark-${bookmark.id}`
                          )

                          return (
                            <div
                              key={bookmark.id}
                              className="group relative flex items-center gap-2 rounded-lg border border-neutral-800 bg-neutral-900/50 p-2.5 transition-colors hover:bg-neutral-900 sm:gap-3 sm:p-3.5"
                            >
                              <button
                                onClick={(e) => {
                                  e.preventDefault()
                                  e.stopPropagation()
                                  toggleBookmarkSelection(
                                    `bookmark-${bookmark.id}`
                                  )
                                }}
                                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors ${
                                  isSelected
                                    ? 'border-blue-500 bg-blue-500'
                                    : 'border-neutral-700 hover:border-neutral-600'
                                }`}
                                aria-label="Select bookmark"
                              >
                                {isSelected && (
                                  <Check size={12} className="text-white" />
                                )}
                              </button>
                              <a
                                href={bookmark.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="min-w-0 flex-1"
                                onClick={(e) => {
                                  if (e.metaKey || e.ctrlKey) return
                                  e.preventDefault()
                                  window.open(
                                    bookmark.url,
                                    '_blank',
                                    'noopener,noreferrer'
                                  )
                                }}
                              >
                                <div className="min-w-0 flex-1">
                                  <div className="break-words text-sm font-medium text-neutral-200 sm:text-base">
                                    {bookmark.title}
                                  </div>
                                  {bookmark.description && (
                                    <div className="mt-1 line-clamp-2 break-words text-xs text-neutral-500">
                                      {bookmark.description}
                                    </div>
                                  )}
                                  <div className="mt-1 truncate text-xs text-neutral-500">
                                    {new URL(bookmark.url).hostname.replace(
                                      'www.',
                                      ''
                                    )}
                                  </div>
                                </div>
                              </a>
                              <div className="relative shrink-0">
                                <button
                                  onClick={(e) => {
                                    e.preventDefault()
                                    e.stopPropagation()
                                    setShowBookmarkMenuForId(
                                      showMenu
                                        ? null
                                        : `bookmark-${bookmark.id}`
                                    )
                                  }}
                                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-neutral-500 opacity-0 transition-opacity hover:bg-neutral-800 hover:text-white group-hover:opacity-100 sm:h-10 sm:w-10"
                                  aria-label="Options"
                                >
                                  <MoreVertical size={16} />
                                </button>
                                {showMenu && (
                                  <div className="absolute right-0 top-11 z-50 min-w-[180px] rounded-lg border border-neutral-800 bg-neutral-900 shadow-xl backdrop-blur-sm transition-all duration-200">
                                    <div className="p-1.5">
                                      <button
                                        onClick={(e) => {
                                          e.preventDefault()
                                          e.stopPropagation()
                                          if (bookmark.url) {
                                            window.open(
                                              bookmark.url,
                                              '_blank',
                                              'noopener,noreferrer'
                                            )
                                          }
                                          setShowBookmarkMenuForId(null)
                                        }}
                                        className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm font-medium text-neutral-300 transition-colors hover:bg-neutral-800 hover:text-white"
                                      >
                                        <ExternalLink
                                          size={14}
                                          className="text-neutral-400"
                                        />
                                        <span>Go to bookmark</span>
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {googleBookmarks.length > 0 && (
                    <div>
                      <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-neutral-500">
                        Chrome Bookmarks
                      </h2>
                      <div className="space-y-2">
                        {googleBookmarks.map((bookmark) => {
                          const domain = bookmark.url
                            ? new URL(bookmark.url).hostname.replace('www.', '')
                            : ''
                          const showMenu = showBookmarkMenuForId === bookmark.id
                          const isSelected = selectedGoogleBookmarks.has(
                            bookmark.id
                          )

                          return (
                            <div
                              key={bookmark.id}
                              className="group relative flex items-center gap-2 rounded-lg border border-neutral-800 bg-neutral-900/50 p-2.5 transition-colors hover:bg-neutral-900 sm:gap-3 sm:p-3"
                            >
                              <button
                                onClick={(e) => {
                                  e.preventDefault()
                                  e.stopPropagation()
                                  toggleGoogleBookmarkSelection(bookmark.id)
                                }}
                                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors ${
                                  isSelected
                                    ? 'border-blue-500 bg-blue-500'
                                    : 'border-neutral-700 hover:border-neutral-600'
                                }`}
                                aria-label="Select bookmark"
                              >
                                {isSelected && (
                                  <Check size={12} className="text-white" />
                                )}
                              </button>
                              <a
                                href={bookmark.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3"
                                onClick={(e) => {
                                  if (e.metaKey || e.ctrlKey) return
                                  e.preventDefault()
                                  window.open(
                                    bookmark.url,
                                    '_blank',
                                    'noopener,noreferrer'
                                  )
                                }}
                              >
                                {bookmark.icon_url ? (
                                  <img
                                    src={bookmark.icon_url}
                                    alt=""
                                    className="h-4 w-4 shrink-0 sm:h-5 sm:w-5"
                                    onError={(e) => {
                                      e.currentTarget.style.display = 'none'
                                    }}
                                  />
                                ) : (
                                  <div className="h-4 w-4 shrink-0 rounded bg-neutral-700 sm:h-5 sm:w-5" />
                                )}
                                <div className="min-w-0 flex-1">
                                  <div className="break-words text-sm font-medium text-neutral-200 sm:text-base">
                                    {bookmark.title}
                                  </div>
                                  <div className="mt-1 flex flex-col gap-1 text-xs text-neutral-500 sm:flex-row sm:items-center">
                                    <span className="truncate">{domain}</span>
                                    {bookmark.folder_path && (
                                      <>
                                        <span className="hidden sm:inline">
                                          •
                                        </span>
                                        <span className="truncate">
                                          {bookmark.folder_path}
                                        </span>
                                      </>
                                    )}
                                  </div>
                                </div>
                                <ExternalLink
                                  size={14}
                                  className="hidden shrink-0 text-neutral-500 opacity-0 transition-opacity group-hover:opacity-100 sm:block"
                                />
                              </a>
                              <div className="relative shrink-0">
                                <button
                                  onClick={(e) => {
                                    e.preventDefault()
                                    e.stopPropagation()
                                    setShowBookmarkMenuForId(
                                      showMenu ? null : bookmark.id
                                    )
                                  }}
                                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-neutral-500 opacity-0 transition-opacity hover:bg-neutral-800 hover:text-white group-hover:opacity-100 sm:h-10 sm:w-10"
                                  aria-label="Options"
                                >
                                  <MoreVertical size={16} />
                                </button>
                                {showMenu && (
                                  <div className="absolute right-0 top-11 z-50 min-w-[180px] rounded-lg border border-neutral-800 bg-neutral-900 shadow-xl backdrop-blur-sm transition-all duration-200">
                                    <div className="p-1.5">
                                      <button
                                        onClick={(e) => {
                                          e.preventDefault()
                                          e.stopPropagation()
                                          if (bookmark.url) {
                                            window.open(
                                              bookmark.url,
                                              '_blank',
                                              'noopener,noreferrer'
                                            )
                                          }
                                          setShowBookmarkMenuForId(null)
                                        }}
                                        className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm font-medium text-neutral-300 transition-colors hover:bg-neutral-800 hover:text-white"
                                      >
                                        <ExternalLink
                                          size={14}
                                          className="text-neutral-400"
                                        />
                                        <span>Go to bookmark</span>
                                      </button>
                                      <button
                                        onClick={(e) => {
                                          e.preventDefault()
                                          e.stopPropagation()
                                          handleArchiveBookmark(bookmark.id)
                                        }}
                                        className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm font-medium text-neutral-300 transition-colors hover:bg-neutral-800 hover:text-white"
                                      >
                                        <Archive
                                          size={14}
                                          className="text-neutral-400"
                                        />
                                        <span>Archive</span>
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {bookmarks.length === 0 && googleBookmarks.length === 0 && (
                    <div className="py-10 text-center text-xs text-neutral-500">
                      No bookmarks found
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Projects List */}
          {activeTab === 'projects' && (
            <div className="space-y-2">
              {projectsLoading ? (
                <div className="flex items-center justify-center py-10">
                  <Loader2
                    className="animate-spin text-neutral-500"
                    size={20}
                  />
                </div>
              ) : projects.length === 0 ? (
                <div className="py-10 text-center text-xs text-neutral-500">
                  No projects found
                </div>
              ) : (
                projects.map((project) => {
                  const isSelected = selectedProjects.has(project.id)

                  return (
                    <div
                      key={project.id}
                      onClick={() => handleEditProject(project)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          handleEditProject(project)
                        }
                      }}
                      className="group relative flex cursor-pointer items-center gap-2 rounded-lg border border-neutral-800 bg-neutral-900/50 p-3.5 transition-colors hover:bg-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-700 sm:p-4"
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleProjectSelection(project.id)
                        }}
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors ${
                          isSelected
                            ? 'border-blue-500 bg-blue-500'
                            : 'border-neutral-700 hover:border-neutral-600'
                        }`}
                        aria-label="Select project"
                      >
                        {isSelected && (
                          <Check size={12} className="text-white" />
                        )}
                      </button>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start gap-2">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <div className="break-words text-sm font-medium text-neutral-200 sm:text-base">
                                {project.name}
                              </div>
                              {project.year && (
                                <span className="text-xs text-neutral-500">
                                  {project.year}
                                </span>
                              )}
                              <span className="rounded-full border border-neutral-800 bg-neutral-900 px-2 py-0.5 text-xs font-semibold text-neutral-400">
                                {project.status}
                              </span>
                            </div>
                            <div className="mt-1 line-clamp-2 break-words text-xs text-neutral-500">
                              {project.motivation}
                            </div>
                            {project.summary && (
                              <div className="mt-1 line-clamp-1 break-words text-xs text-neutral-600">
                                {project.summary}
                              </div>
                            )}
                            {(project.links.code || project.links.live) && (
                              <div className="mt-1 flex items-center gap-2 text-xs text-neutral-500">
                                {project.links.live && (
                                  <span className="truncate">
                                    {new URL(
                                      project.links.live
                                    ).hostname.replace('www.', '')}
                                  </span>
                                )}
                                {project.links.code && (
                                  <>
                                    {project.links.live && <span>•</span>}
                                    <span>Code</span>
                                  </>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
