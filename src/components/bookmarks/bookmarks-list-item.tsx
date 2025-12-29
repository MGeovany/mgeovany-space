import { Modal } from '@mantine/core'
import axios from 'axios'
import { Pencil, X } from 'lucide-react'
import React, { memo, useState } from 'react'
import toast from 'react-hot-toast'

import { Icons } from '@/components/icons'
import { ListItem } from '@/components/list-detail/list-item'
import { API_URL } from '@/constants'
import { useUserRole } from '@/hooks/useUserRole'

import { GhostButton, Size } from '../button'
import BookmarkForm from './bookmark-form'

interface BookmarksListItemProps {
  bookmark: Bookmark
  active: boolean
}

export const BookmarksListItem = memo<BookmarksListItemProps>(
  ({ bookmark, active }) => {
    const { userRole } = useUserRole()
    const [imageBroken, setImageBroken] = useState<boolean>(false)
    const [editBookmark, setEditBookmark] = useState<Bookmark | undefined>(
      undefined
    )
    const [opened, setOpened] = useState<boolean>(false)

    function handleClick(e: any, bookmark: Bookmark) {
      if (e.metaKey) {
        e.preventDefault()
        e.stopPropagation()
        if (bookmark && bookmark.url) {
          const url = bookmark.url
          window.open(url, '_blank')?.focus()
        }
      }
    }

    async function handleDeleteElement(e: any, bookmark: Bookmark) {
      e.preventDefault()
      e.stopPropagation()

      toast(
        (t) => (
          <div className="mx-auto max-w-md rounded-lg p-4 text-white">
            <h3 className="text-lg font-semibold">Delete bookmark?</h3>
            <p className="mt-2 text-sm text-gray-300">
              Are you sure you want to delete this bookmark? This action cannot
              be undone.
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
                      toast.dismiss(t.id)
                      toast.error('[Bookmarks] No access token available')
                      return
                    }

                    const res = await axios.delete(
                      `${API_URL}/bookmark/${bookmark.id}`,
                      {
                        headers: {
                          'Content-Type': 'application/json',
                          Authorization: `Bearer ${accessToken}`,
                        },
                      }
                    )
                    if (res.status === 200) {
                      toast.success(
                        '[Bookmarks] Bookmark deleted successfully',
                        {
                          duration: 4000,
                        }
                      )
                      window.location.reload()
                    }
                  } catch (error) {
                    toast.error('[Bookmarks] Failed to delete the bookmark')
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

    async function handleEditBookmark(e: any, bookmark: Bookmark) {
      e.preventDefault()
      e.stopPropagation()
      setEditBookmark(bookmark)
      setOpened(true)
    }

    return (
      <>
        <Modal
          opened={opened}
          onClose={() => setOpened(false)}
          centered
          padding={'lg'}
        >
          <div className="px-10 pb-5">
            <h2 className="mb-4 text-xl font-semibold text-gray-900">
              Edit Bookmark
            </h2>
            <BookmarkForm
              bookmark={editBookmark}
              onClose={() => setOpened(false)}
            />
          </div>
        </Modal>
        <ListItem
          key={bookmark.id}
          title={bookmark.title}
          byline={
            <div className="flex items-center space-x-2">
              {
                imageBroken ? <Icons.url /> : null
                /*  <Image
                src={`https://www.google.com/s2/favicons?domain=${bookmark.url}`}
                alt="favicon"
                width={16}
                height={16}
                onError={() => setImageBroken(true)}
              /> */
              }
              <span> {new URL(bookmark.url).hostname}</span>
            </div>
          }
          active={active}
          href="/bookmarks/[id]"
          as={`/bookmarks/${bookmark.id}`}
          onClick={(e) => handleClick(e, bookmark)}
          leadingAccessory={
            userRole === 'admin' ? (
              <>
                <GhostButton
                  aria-label="Delete bookmarks"
                  size={Size.smallSquare}
                  onClick={(e: React.MouseEvent<HTMLButtonElement>) =>
                    handleDeleteElement(e, bookmark)
                  }
                >
                  <X size={16} />
                </GhostButton>
                <GhostButton
                  aria-label="Edit bookmarks"
                  size={Size.smallSquare}
                  onClick={(e: React.MouseEvent<HTMLButtonElement>) =>
                    handleEditBookmark(e, bookmark)
                  }
                >
                  <Pencil size={16} />
                </GhostButton>
              </>
            ) : undefined
          }
        />
      </>
    )
  }
)
