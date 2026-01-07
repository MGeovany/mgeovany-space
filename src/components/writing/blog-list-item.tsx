import { Button, Modal, Textarea, TextInput } from '@mantine/core'
import axios from 'axios'
import { formatDistanceToNowStrict } from 'date-fns'
import { Calendar, ExternalLink, Pencil, X } from 'lucide-react'
import { memo, useState } from 'react'
import toast from 'react-hot-toast'

import { Icons } from '@/components/icons'
import { ListItem } from '@/components/list-detail/list-item'
import { API_URL } from '@/constants'
import { useUserRole } from '@/hooks/useUserRole'

import { GhostButton, Size } from '../button'
import { MarkdownRenderer } from '../markdown-renderer'
import BlogForm from './blog-form'

interface BlogListItemProps {
  blog: Blog
  active: boolean
}

export const BlogListItem = memo<BlogListItemProps>(({ blog, active }) => {
  const { userRole } = useUserRole()

  const [editModalOpen, setEditModalOpen] = useState(false)
  const [imageBroken, setImageBroken] = useState<boolean>(false)

  function handleClick(e: any, blog: Blog) {
    if (e.metaKey) {
      e.preventDefault()
      e.stopPropagation()
      if (blog && blog.url) {
        const url = blog.url
        window.open(url, '_blank')?.focus()
      }
    }
  }

  async function handleDeleteElement(e: any, blog: Blog) {
    e.preventDefault()
    e.stopPropagation()

    toast(
      (t) => (
        <div className="mx-auto max-w-md rounded-lg p-4 text-white">
          <h3 className="text-lg font-semibold">Delete blog?</h3>
          <p className="mt-2 text-sm text-gray-300">
            Are you sure you want to delete this blog? This action cannot be
            undone.
          </p>
          <div className="mt-4 flex justify-end gap-2">
            <button
              className="rounded-lg bg-gray-600 px-4 py-2 text-gray-200 hover:bg-gray-500 focus:outline-none"
              onClick={() => toast.dismiss(t.id)}
            >
              Cancel
            </button>
            <button
              className="rounded-lg bg-red-400 px-4 py-2 text-white hover:bg-red-300 focus:outline-none"
              onClick={async () => {
                toast.dismiss(t.id)
                try {
                  const { getSupabaseToken } =
                    await import('@/lib/supabase/get-token')
                  const accessToken = await getSupabaseToken()

                  if (!accessToken) {
                    toast.error('[Writing] No access token available')
                    return
                  }

                  const res = await axios.delete(`${API_URL}/blog/${blog.id}`, {
                    headers: {
                      'Content-Type': 'application/json',
                      Authorization: `Bearer ${accessToken}`,
                    },
                  })
                  if (res.status === 200) {
                    toast.success('[Writing] Blog deleted successfully', {
                      duration: 4000,
                    })
                    window.location.reload()
                  }
                } catch (error) {
                  toast.error('[Writing] Failed to delete the blog')
                }
              }}
            >
              Delete
            </button>
          </div>
        </div>
      ),

      {
        style: {
          borderRadius: '10px',
          background: '#333',
          color: '#fff',
        },
        duration: Infinity,
      }
    )
  }

  const handleEditElement = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setEditModalOpen(true)
  }

  const publishedDate = blog.published_at
    ? formatDistanceToNowStrict(new Date(blog.published_at), {
        addSuffix: false,
      })
    : null

  return (
    <>
      <div
        className={`group relative rounded-lg border transition-all ${
          active
            ? 'border-neutral-700 bg-neutral-800 shadow-lg'
            : 'border-neutral-800 bg-neutral-900/50 hover:border-neutral-700 hover:bg-neutral-900'
        }`}
      >
        <div className="p-2">
          <ListItem
            key={blog.id}
            title={blog.title}
            description={
              blog.excerpt ? (
                <p className="line-clamp-2 text-sm text-neutral-400">
                  {blog.excerpt}
                </p>
              ) : undefined
            }
            byline={
              <div className="flex items-center gap-3 text-xs">
                {blog.source && blog.source !== 'local' && (
                  <div className="flex items-center gap-1.5 rounded-full bg-neutral-800 px-2 py-0.5">
                    {blog.source === 'medium' && (
                      <Icons.medium className="h-3 w-3" />
                    )}
                    {blog.source === 'devto' && (
                      <Icons.devTo className="h-3 w-3" />
                    )}
                    <span className="text-[10px] capitalize text-neutral-400">
                      {blog.source}
                    </span>
                  </div>
                )}
                {publishedDate && (
                  <div className="flex items-center gap-1.5 text-neutral-400">
                    <Calendar size={12} />
                    <span>{publishedDate}</span>
                  </div>
                )}
                {blog.url && (
                  <div className="flex items-center gap-1.5 text-neutral-400">
                    <ExternalLink size={12} />
                    <span className="max-w-[120px] truncate">
                      {new URL(blog.url).hostname.replace('www.', '')}
                    </span>
                  </div>
                )}
              </div>
            }
            leadingAccessory={
              userRole === 'admin' && blog.source === 'local' ? (
                <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <GhostButton
                    aria-label="Edit blog"
                    size={Size.smallSquare}
                    onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                      e.preventDefault()
                      e.stopPropagation()
                      handleEditElement(e)
                    }}
                  >
                    <Pencil size={14} />
                  </GhostButton>
                  <GhostButton
                    aria-label="Delete blog"
                    size={Size.smallSquare}
                    onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                      e.preventDefault()
                      e.stopPropagation()
                      handleDeleteElement(e, blog)
                    }}
                  >
                    <X size={14} />
                  </GhostButton>
                </div>
              ) : undefined
            }
            active={active}
            href="/writing/[id]"
            as={`/writing/${blog.id}`}
            onClick={(e) => handleClick(e, blog)}
          />
        </div>
      </div>
      <Modal
        opened={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Edit blog"
        size="auto"
      >
        <BlogForm blog={blog} onClose={() => setEditModalOpen(false)} />
      </Modal>
    </>
  )
})
