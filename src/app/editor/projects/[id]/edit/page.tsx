'use client'

import axios from 'axios'
import { ArrowLeft, GlobeIcon, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

import { GithubIcon } from '@/components/icons/shared'
import { ProjectForm } from '@/components/projects/project-form'
import { useSupabaseUser } from '@/hooks/useSupabaseUser'
import { isAllowedEditorEmail } from '@/lib/editor/allowed'
import { Project } from '@/types/project'

async function getAuthHeaders(): Promise<Record<string, string>> {
  const { getSupabaseToken } = await import('@/lib/supabase/get-token')
  const token = await getSupabaseToken()
  const headers: Record<string, string> = {}
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  return headers
}

export default function EditProjectPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const { user, loading: userLoading } = useSupabaseUser()
  const email = user?.email ?? null
  const allowed = isAllowedEditorEmail(email)

  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadProject() {
      if (!id) return

      try {
        const authHeaders = await getAuthHeaders()
        const response = await axios.get(`/api/projects/${id}`, {
          withCredentials: true,
          headers: authHeaders,
        })
        setProject(response.data.data)
      } catch (error: any) {
        toast.error(`[Editor] Could not load project: ${error.message}`)
        router.push('/editor?tab=projects')
      } finally {
        setLoading(false)
      }
    }

    if (allowed) {
      loadProject()
    }
  }, [id, allowed, router])

  if (userLoading || loading) {
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
            <p className="text-sm text-neutral-400">
              Please sign in to continue.
            </p>
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
        </div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-neutral-950 text-white">
        <div className="text-center">
          <p className="text-neutral-400">Project not found</p>
        </div>
      </div>
    )
  }

  function handleSuccess() {
    router.push('/editor?tab=projects')
  }

  function handleClose() {
    router.push('/editor?tab=projects')
  }

  return (
    <div className="min-h-screen w-full bg-neutral-950 text-white">
      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-8">
        <div className="mb-6">
          <button
            onClick={handleClose}
            className="group mb-4 flex items-center text-sm text-neutral-400 transition-colors"
          >
            <ArrowLeft
              size={16}
              className="text-primary group-hover:text-blue-500"
            />
            <span className="ml-2 group-hover:text-blue-500">
              Back to Projects
            </span>
          </button>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">
                Edit Project
              </h1>
              <p className="mt-1 text-sm text-neutral-400">
                Update project information.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {project.links.code ? (
                <Link
                  href={project.links.code}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-2xl border border-neutral-800 bg-neutral-900 px-4 py-2.5 text-sm font-semibold text-neutral-100 shadow-xs transition hover:bg-neutral-800"
                >
                  <span className="xs:inline hidden">Code</span>
                  <GithubIcon size={14} />
                </Link>
              ) : null}
              {project.links.live ? (
                <Link
                  href={project.links.live}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-2xl border border-neutral-800 bg-neutral-900 px-4 py-2.5 text-sm font-semibold text-neutral-100 shadow-xs transition hover:bg-neutral-800"
                >
                  <span className="xs:inline hidden">Live</span>
                  <GlobeIcon size={14} />
                </Link>
              ) : null}
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-neutral-800 bg-neutral-900/50 p-6">
          <ProjectForm
            project={project}
            onClose={handleClose}
            onSuccess={handleSuccess}
          />
        </div>
      </div>
    </div>
  )
}
