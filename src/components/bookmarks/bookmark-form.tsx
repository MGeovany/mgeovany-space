'use client'

import axios from 'axios'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

import { BookmarkTag } from '@/constants'

interface BookmarkFormProps {
  bookmark?: Bookmark // Optional for editing case
  onClose: () => void
}

const BookmarkForm = ({ bookmark, onClose }: BookmarkFormProps) => {
  const [title, setTitle] = useState(bookmark?.title || '')
  const [url, setUrl] = useState(bookmark?.url || '')
  const [description, setDescription] = useState(bookmark?.description || '')
  const [tag, setTag] = useState(bookmark?.tag || 'Tools')

  useEffect(() => {
    if (bookmark) {
      setTitle(bookmark.title)
      setUrl(bookmark.url)
      setDescription(bookmark.description)
      setTag(bookmark.tag)
    }
  }, [bookmark])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    toast.loading('Submitting bookmark...')

    const { getSupabaseToken } = await import('@/lib/supabase/get-token')
    const supabaseToken = await getSupabaseToken()

    if (!supabaseToken) {
      toast.dismiss()
      toast.error('[Bookmarks] No access token available')
      return
    }
    try {
      if (bookmark) {
        // Editing case
        const response = await axios.put(
          `/api/bookmarks/${bookmark.id}`,
          {
            title,
            url,
            description,
            tag,
          },
          {
            headers: {
              Authorization: `Bearer ${supabaseToken}`,
            },
          }
        )

        if (response.status === 200) {
          toast.dismiss()
          toast.success('[Bookmarks] Bookmark updated successfully')
        }
      } else {
        // Adding case
        const response = await axios.post(
          `/api/bookmarks`,
          {
            title,
            url,
            description,
            tag,
          },
          {
            headers: {
              Authorization: `Bearer ${supabaseToken}`,
            },
          }
        )
        console.log(response)
        if (response.status === 201) {
          toast.dismiss()
          toast.success('[Bookmarks] Bookmark added successfully')
        }
      }

      onClose() // Close the modal after the form is submitted
      // window.location.reload() // Refresh the page to see the updated list
    } catch (error) {
      toast.dismiss()
      toast.error('[Bookmarks] Failed to submit bookmark')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="title"
          className="block text-sm font-medium text-gray-700"
        >
          Title
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1 block w-full rounded-lg border border-gray-300 bg-white p-2 focus:border-black focus:ring-black"
          required
        />
      </div>

      <div>
        <label
          htmlFor="url"
          className="block text-sm font-medium text-gray-700"
        >
          URL
        </label>
        <input
          id="url"
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="mt-1 block w-full rounded-lg border border-gray-300 p-2 focus:border-black focus:ring-black"
          required
        />
      </div>

      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-gray-700"
        >
          Description
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="mt-1 block w-full rounded-lg border border-gray-300 p-2 focus:border-black focus:ring-black"
          rows={3}
          required
        />
      </div>

      <div>
        <label
          htmlFor="tag"
          className="block text-sm font-medium text-gray-700"
        >
          Tag
        </label>
        <select
          id="tag"
          value={tag}
          onChange={(e) => setTag(e.target.value as BookmarkTag)}
          className="mt-1 block w-full rounded-lg border border-gray-300 p-2 focus:border-black focus:ring-black"
          required
        >
          {Object.values(BookmarkTag).map((tagValue) => (
            <option key={tagValue} value={tagValue}>
              {tagValue}
            </option>
          ))}
        </select>
      </div>

      <button
        type="submit"
        className="w-full rounded-lg bg-black px-4 py-2 font-semibold text-white hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
      >
        Submit
      </button>
    </form>
  )
}

export default BookmarkForm
