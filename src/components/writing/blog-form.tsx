import axios from 'axios'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

import { API_URL } from '@/constants'

import { MarkdownRenderer } from '../markdown-renderer'

interface BlogFormProps {
  blog?: Blog // Optional for editing case
  onClose: () => void
}
const BlogForm = ({ blog, onClose }: BlogFormProps) => {
  const [title, setTitle] = useState(blog?.title || '')
  const [content, setContent] = useState(blog?.content || '')

  useEffect(() => {
    if (blog) {
      setTitle(blog.title)
      setContent(blog.content)
    }
  }, [blog])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    try {
      const { getSupabaseToken } = await import('@/lib/supabase/get-token')
      const supabaseToken = await getSupabaseToken()

      if (!supabaseToken) {
        toast.error('[Writing] No access token available')
        return
      }

      if (blog) {
        // Editing case
        const response = await axios.put(
          `${API_URL}/blog/${blog.id}`,
          {
            title,
            content,
          },
          {
            headers: {
              Authorization: `Bearer ${supabaseToken}`,
            },
          }
        )

        if (response.status === 200) {
          toast.success('[Writing] Blog post updated successfully')
        }
      } else {
        // Adding case
        const response = await axios.post(
          `${API_URL}/blog`,
          {
            title,
            content,
          },
          {
            headers: {
              Authorization: `Bearer ${supabaseToken}`,
            },
          }
        )

        if (response.status === 200) {
          toast.success('[Writing] Blog post added successfully')
        }
      }
      onClose() // Close the modal after the form is submitted
      window.location.reload() // Refresh the page to see the updated list
    } catch (error) {
      toast.error('[Writing] Failed to save blog post')
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex flex-col">
        {/* Input para el título */}
        <div className="my-4 w-fit">
          <label
            htmlFor="title"
            className="text-md block font-black text-neutral-200"
          >
            Title
          </label>
          <div className="flex flex-row gap-2">
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 block w-full min-w-80 rounded-lg border border-neutral-800 bg-neutral-900 p-2 text-neutral-100 placeholder:text-neutral-500 focus:border-neutral-700 focus:ring-neutral-700"
              required
            />
            <button
              type="submit"
              className="w-full rounded-lg bg-white px-4 py-2 font-semibold text-neutral-950 transition hover:bg-neutral-200 focus:outline-none focus:ring-2 focus:ring-neutral-300 focus:ring-offset-0"
            >
              Submit
            </button>
          </div>
        </div>

        <div className="flex flex-row gap-2">
          <div className="w-1/2">
            <label
              htmlFor="content"
              className="block text-sm font-black text-neutral-200"
            >
              Content
            </label>
            <textarea
              id="description"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-neutral-800 bg-neutral-900 p-2 text-neutral-100 placeholder:text-neutral-500 focus:border-neutral-700 focus:ring-neutral-700"
              rows={50}
              required
            />
          </div>
          {/* Previsualización en markdown */}
          <div className="mt-5 w-1/2 rounded border border-neutral-800 bg-neutral-900 p-4 text-neutral-100">
            <MarkdownRenderer children={content} />
            {content}
          </div>
        </div>
      </div>

      <div className="mt-4 flex justify-end">
        <button
          type="submit"
          className="w-auto rounded-lg bg-white px-4 py-2 font-semibold text-neutral-950 transition hover:bg-neutral-200 focus:outline-none focus:ring-2 focus:ring-neutral-300 focus:ring-offset-0"
        >
          Submit
        </button>
      </div>
    </form>
  )
}
export default BlogForm
