'use client'

import axios from 'axios'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

import { PROJECT_STATUSES } from '@/data/projects'
import { Project, ProjectStatus } from '@/types/project'

interface ProjectFormProps {
  project?: Project
  onClose: () => void
  onSuccess: () => void
}

export function ProjectForm({ project, onClose, onSuccess }: ProjectFormProps) {
  const [name, setName] = useState(project?.name || '')
  const [id, setId] = useState(project?.id || '')
  const [motivation, setMotivation] = useState(project?.motivation || '')
  const [status, setStatus] = useState<ProjectStatus>(
    project?.status || 'In progress'
  )
  const [year, setYear] = useState(project?.year || '')
  const [summary, setSummary] = useState(project?.summary || '')
  const [codeLink, setCodeLink] = useState(project?.links.code || '')
  const [liveLink, setLiveLink] = useState(project?.links.live || '')
  const [stack, setStack] = useState(project?.tech.stack.join(', ') || '')
  const [architecture, setArchitecture] = useState(
    project?.tech.architecture || ''
  )

  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (project) {
      setName(project.name)
      setId(project.id)
      setMotivation(project.motivation)
      setStatus(project.status)
      setYear(project.year || '')
      setSummary(project.summary || '')
      setCodeLink(project.links.code || '')
      setLiveLink(project.links.live || '')
      setStack(project.tech.stack.join(', ') || '')
      setArchitecture(project.tech.architecture || '')
    } else {
      // Generate ID from name for new projects
      if (name) {
        setId(
          name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '')
        )
      }
    }
  }, [project, name])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const authHeaders = await getAuthHeaders()
      const projectData = {
        id: id || name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        name,
        motivation,
        status,
        year: year || undefined,
        summary: summary || undefined,
        links: {
          code: codeLink || undefined,
          live: liveLink || undefined,
        },
        tech: {
          stack: stack
            ? stack
                .split(',')
                .map((s) => s.trim())
                .filter(Boolean)
            : [],
          architecture: architecture || undefined,
        },
      }

      if (project) {
        // Update existing project
        await axios.put(`/api/projects/${project.id}`, projectData, {
          withCredentials: true,
          headers: authHeaders,
        })
        toast.success('[Editor] Project updated successfully')
      } else {
        // Create new project
        await axios.post('/api/projects', projectData, {
          withCredentials: true,
          headers: authHeaders,
        })
        toast.success('[Editor] Project created successfully')
      }

      onSuccess()
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.error ?? error?.message ?? 'Unknown error'
      toast.error(`[Editor] Failed to save project: ${errorMessage}`)
    } finally {
      setLoading(false)
    }
  }

  async function getAuthHeaders(): Promise<Record<string, string>> {
    const { getSupabaseToken } = await import('@/lib/supabase/get-token')
    const token = await getSupabaseToken()
    const headers: Record<string, string> = {}
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
    return headers
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-neutral-300"
        >
          Name *
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 block w-full rounded-md border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-white placeholder:text-neutral-500 focus:border-neutral-700 focus:outline-none focus:ring-1 focus:ring-neutral-700"
          required
          placeholder="My Awesome Project"
        />
      </div>

      <div>
        <label
          htmlFor="id"
          className="block text-sm font-medium text-neutral-300"
        >
          ID *
        </label>
        <input
          id="id"
          type="text"
          value={id}
          onChange={(e) => setId(e.target.value)}
          className="mt-1 block w-full rounded-md border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-white placeholder:text-neutral-500 focus:border-neutral-700 focus:outline-none focus:ring-1 focus:ring-neutral-700"
          required
          placeholder="my-awesome-project"
        />
        <p className="mt-1 text-xs text-neutral-500">
          URL-friendly identifier (auto-generated from name)
        </p>
      </div>

      <div>
        <label
          htmlFor="motivation"
          className="block text-sm font-medium text-neutral-300"
        >
          Motivation *
        </label>
        <textarea
          id="motivation"
          value={motivation}
          onChange={(e) => setMotivation(e.target.value)}
          className="mt-1 block w-full rounded-md border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-white placeholder:text-neutral-500 focus:border-neutral-700 focus:outline-none focus:ring-1 focus:ring-neutral-700"
          rows={3}
          required
          placeholder="Build something amazing..."
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="status"
            className="block text-sm font-medium text-neutral-300"
          >
            Status *
          </label>
          <select
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value as ProjectStatus)}
            className="mt-1 block w-full rounded-md border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-white focus:border-neutral-700 focus:outline-none focus:ring-1 focus:ring-neutral-700"
            required
          >
            {PROJECT_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="year"
            className="block text-sm font-medium text-neutral-300"
          >
            Year
          </label>
          <input
            id="year"
            type="text"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="mt-1 block w-full rounded-md border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-white placeholder:text-neutral-500 focus:border-neutral-700 focus:outline-none focus:ring-1 focus:ring-neutral-700"
            placeholder="2025"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="summary"
          className="block text-sm font-medium text-neutral-300"
        >
          Summary
        </label>
        <textarea
          id="summary"
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          className="mt-1 block w-full rounded-md border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-white placeholder:text-neutral-500 focus:border-neutral-700 focus:outline-none focus:ring-1 focus:ring-neutral-700"
          rows={2}
          placeholder="Short description..."
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-neutral-300">
          Links
        </label>
        <div className="space-y-2">
          <input
            type="url"
            value={codeLink}
            onChange={(e) => setCodeLink(e.target.value)}
            className="block w-full rounded-md border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-white placeholder:text-neutral-500 focus:border-neutral-700 focus:outline-none focus:ring-1 focus:ring-neutral-700"
            placeholder="Code URL (GitHub, etc.)"
          />
          <input
            type="url"
            value={liveLink}
            onChange={(e) => setLiveLink(e.target.value)}
            className="block w-full rounded-md border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-white placeholder:text-neutral-500 focus:border-neutral-700 focus:outline-none focus:ring-1 focus:ring-neutral-700"
            placeholder="Live URL"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="stack"
          className="block text-sm font-medium text-neutral-300"
        >
          Tech Stack
        </label>
        <input
          id="stack"
          type="text"
          value={stack}
          onChange={(e) => setStack(e.target.value)}
          className="mt-1 block w-full rounded-md border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-white placeholder:text-neutral-500 focus:border-neutral-700 focus:outline-none focus:ring-1 focus:ring-neutral-700"
          placeholder="Next.js, React, TypeScript (comma separated)"
        />
      </div>

      <div>
        <label
          htmlFor="architecture"
          className="block text-sm font-medium text-neutral-300"
        >
          Architecture
        </label>
        <textarea
          id="architecture"
          value={architecture}
          onChange={(e) => setArchitecture(e.target.value)}
          className="mt-1 block w-full rounded-md border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-white placeholder:text-neutral-500 focus:border-neutral-700 focus:outline-none focus:ring-1 focus:ring-neutral-700"
          rows={3}
          placeholder="Architecture description..."
        />
      </div>

      <div className="flex gap-2 pt-2">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 rounded-md border border-neutral-800 bg-neutral-900 px-4 py-2 text-sm font-medium text-neutral-300 transition-colors hover:bg-neutral-800"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 rounded-md bg-white px-4 py-2 text-sm font-medium text-neutral-950 transition-colors hover:bg-neutral-200 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? 'Saving...' : project ? 'Update' : 'Create'}
        </button>
      </div>
    </form>
  )
}
