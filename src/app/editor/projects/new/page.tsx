'use client'

import { ArrowLeft, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

import { Button, PrimaryButton, Size } from '@/components/button'
import { ProjectForm } from '@/components/projects/project-form'
import { useSupabaseUser } from '@/hooks/useSupabaseUser'
import { isAllowedEditorEmail } from '@/lib/editor/allowed'
import { createClient } from '@/lib/supabase/client'

export default function NewProjectPage() {
  const router = useRouter()
  const { user, loading } = useSupabaseUser()
  const email = user?.email ?? null
  const allowed = isAllowedEditorEmail(email)

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

  function handleSuccess() {
    router.push('/editor?tab=projects')
  }

  function handleClose() {
    router.push('/editor?tab=projects')
  }

  return (
    <div className="min-h-screen w-full scroll-smooth bg-neutral-950 text-white">
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
          <h1 className="text-2xl font-semibold tracking-tight">New Project</h1>
          <p className="mt-1 text-sm text-neutral-400">
            Create a new project to showcase your work.
          </p>
        </div>

        <div className="rounded-lg border border-neutral-800 bg-neutral-900/50 p-6">
          <ProjectForm onClose={handleClose} onSuccess={handleSuccess} />
        </div>
      </div>
    </div>
  )
}
