import { Button, Modal, Textarea, TextInput } from '@mantine/core'
import axios from 'axios'
import { Pencil, X } from 'lucide-react'
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

  return (
    <>
      <ListItem
        key={blog.id}
        title={blog.title}
        byline={
          <div className="flex items-center space-x-2">
            {
              imageBroken ? <Icons.url /> : null
              /*  <Image
            src={`https://www.google.com/s2/favicons?domain=${blog.url}`}
            alt="favicon"
            width={16}
            height={16}
            onError={() => setImageBroken(true)}
            /> */
            }
            <span> {blog.url ? new URL(blog.url).hostname : ''}</span>
          </div>
        }
        leadingAccessory={
          userRole === 'admin' ? (
            <>
              <GhostButton
                aria-label="Delete blogs"
                size={Size.smallSquare}
                onClick={(e: React.MouseEvent<HTMLButtonElement>) =>
                  handleDeleteElement(e, blog)
                }
              >
                <X size={16} />
              </GhostButton>
              <GhostButton
                aria-label="Edit blogs"
                size={Size.smallSquare}
                onClick={(e: React.MouseEvent<HTMLButtonElement>) =>
                  handleEditElement(e)
                }
              >
                <Pencil size={16} />
              </GhostButton>
            </>
          ) : undefined
        }
        active={active}
        href="/writing/[id]"
        as={`/writing/${blog.id}`}
        onClick={(e) => handleClick(e, blog)}
      />
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
