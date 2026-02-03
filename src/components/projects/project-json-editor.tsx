'use client'

import axios from 'axios'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

import { slugify } from '@/lib/slugify'
import { Project, ProjectStatus } from '@/types/project'

/** JSON shape for the project editor (only the fields we edit). */
export interface ProjectEditorJson {
  name: string
  id?: string
  motivation: string
  status: ProjectStatus
  year?: string
  summary?: string
  /** Short one-line description for home and list views */
  shortDesc?: string
  /** When true, project is shown on the homepage (/) */
  showOnHome?: boolean
  links?: {
    code?: string
    live?: string
  }
  tech?: {
    stack?: string[]
    architecture?: string
  }
}

const PROJECT_STATUSES: ProjectStatus[] = [
  'In production',
  'In progress',
  'Paused',
  'Archived',
]

const DEFAULT_JSON: ProjectEditorJson = {
  name: '',
  motivation: '',
  status: 'In progress',
  year: '',
  summary: '',
  shortDesc: '',
  showOnHome: false,
  links: {
    code: '',
    live: '',
  },
  tech: {
    stack: [],
    architecture: '',
  },
}

function projectToEditorJson(project: Project): ProjectEditorJson {
  return {
    name: project.name,
    id: project.id,
    motivation: project.motivation,
    status: project.status,
    year: project.year ?? '',
    summary: project.summary ?? '',
    shortDesc: project.shortDesc ?? '',
    showOnHome: project.showOnHome ?? false,
    links: {
      code: project.links.code ?? '',
      live: project.links.live ?? '',
    },
    tech: {
      stack: project.tech.stack ?? [],
      architecture: project.tech.architecture ?? '',
    },
  }
}

function parseJson(text: string): ProjectEditorJson | null {
  try {
    const parsed = JSON.parse(text) as ProjectEditorJson
    if (typeof parsed !== 'object' || parsed === null) return null
    return parsed
  } catch {
    return null
  }
}

function validate(json: ProjectEditorJson): string | null {
  if (!json.name?.trim()) return 'name is required'
  if (!json.motivation?.trim()) return 'motivation is required'
  if (!json.status) return 'status is required'
  if (json.status && !PROJECT_STATUSES.includes(json.status))
    return `status must be one of: ${PROJECT_STATUSES.join(', ')}`
  if (json.tech?.stack != null && !Array.isArray(json.tech.stack))
    return 'tech.stack must be an array of strings'
  return null
}

async function getAuthHeaders(): Promise<Record<string, string>> {
  const { getSupabaseToken } = await import('@/lib/supabase/get-token')
  const token = await getSupabaseToken()
  const headers: Record<string, string> = {}
  if (token) headers['Authorization'] = `Bearer ${token}`
  return headers
}

interface ProjectJsonEditorProps {
  project?: Project
  onClose: () => void
  onSuccess: () => void
}

export function ProjectJsonEditor({
  project,
  onClose,
  onSuccess,
}: ProjectJsonEditorProps) {
  const isEdit = !!project
  const [jsonText, setJsonText] = useState('')
  const [parseError, setParseError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const initial = isEdit ? projectToEditorJson(project) : { ...DEFAULT_JSON }
    setJsonText(JSON.stringify(initial, null, 2))
  }, [isEdit, project])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setParseError(null)

    const parsed = parseJson(jsonText)
    if (!parsed) {
      setParseError('Invalid JSON')
      return
    }

    const validationError = validate(parsed)
    if (validationError) {
      setParseError(validationError)
      return
    }

    setLoading(true)
    try {
      const authHeaders = await getAuthHeaders()
      const id = isEdit
        ? project!.id
        : slugify(parsed.name) || parsed.id || 'project'

      const payload = {
        name: parsed.name.trim(),
        id: isEdit ? undefined : id,
        motivation: parsed.motivation.trim(),
        status: parsed.status,
        year: parsed.year?.trim() || undefined,
        summary: parsed.summary?.trim() || undefined,
        shortDesc: parsed.shortDesc?.trim() || undefined,
        showOnHome: Boolean(parsed.showOnHome),
        links: {
          code: parsed.links?.code?.trim() || undefined,
          live: parsed.links?.live?.trim() || undefined,
        },
        tech: {
          stack: Array.isArray(parsed.tech?.stack)
            ? parsed.tech.stack.filter((s) => typeof s === 'string')
            : [],
          architecture: parsed.tech?.architecture?.trim() || undefined,
        },
      }

      if (isEdit) {
        await axios.put(`/api/projects/${project!.id}`, payload, {
          withCredentials: true,
          headers: authHeaders,
        })
        toast.success('Project updated')
      } else {
        await axios.post(
          '/api/projects',
          { ...payload, id },
          {
            withCredentials: true,
            headers: authHeaders,
          }
        )
        toast.success('Project created')
      }
      onSuccess()
    } catch (err: any) {
      const msg = err?.response?.data?.error ?? err?.message ?? 'Request failed'
      setParseError(msg)
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="project-json"
          className="block text-sm font-medium text-neutral-300"
        >
          Project JSON
        </label>
        <p className="mt-0.5 text-xs text-neutral-500">
          Fields: name, id (auto), motivation, status, year, summary, shortDesc
          (short desc for home), showOnHome, links.code, links.live, tech.stack
          (array), tech.architecture
        </p>
        <textarea
          id="project-json"
          value={jsonText}
          onChange={(e) => {
            setJsonText(e.target.value)
            setParseError(null)
          }}
          className="mt-2 block w-full rounded-md border border-neutral-800 bg-neutral-900 px-3 py-2 font-mono text-sm leading-relaxed text-white placeholder:text-neutral-500 focus:border-neutral-700 focus:outline-none focus:ring-1 focus:ring-neutral-700"
          rows={22}
          spellCheck={false}
        />
        {parseError ? (
          <p className="mt-2 text-sm text-red-400">{parseError}</p>
        ) : null}
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
          {loading ? 'Saving...' : isEdit ? 'Update' : 'Create'}
        </button>
      </div>
    </form>
  )
}
