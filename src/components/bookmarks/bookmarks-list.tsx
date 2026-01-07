'use client'
import axios from 'axios'
import { LayoutGroup, motion } from 'framer-motion'
import { ExternalLink } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { MutableRefObject, useEffect, useState } from 'react'
import toast from 'react-hot-toast'

import { BookmarksListItem } from '@/components/bookmarks/bookmarks-list-item'
import { BookmarksTitleBar } from '@/components/bookmarks/bookmarks-title-bar'
import { ListContainer } from '@/components/list-detail/ListContainer'
import { LoadingSpinner } from '@/components/loading-spinner'

import { TitleBar } from '../list-detail/title-bar'

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

export const BookmarksList = () => {
  const pathname = usePathname()

  const [loading, setLoading] = useState(false)
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
  const [googleBookmarks, setGoogleBookmarks] = useState<GoogleBookmark[]>([])
  const [scrollContainerRef, setScrollContainerRef] = useState<
    MutableRefObject<HTMLElement | null> | undefined
  >(undefined)

  useEffect(() => {
    setLoading(true)

    // Fetch Google bookmarks
    axios
      .get('/api/bookmarks/sync-google')
      .then((response) => {
        setGoogleBookmarks(response.data.data || [])
      })
      .catch((error) => {
        // Silently fail for Google bookmarks if endpoint doesn't exist yet
        console.error('[Bookmarks] Error fetching Google bookmarks:', error)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  if (loading && bookmarks.length === 0) {
    return (
      <ListContainer onRef={setScrollContainerRef}>
        <BookmarksTitleBar scrollContainerRef={scrollContainerRef} />
        <div className="flex h-full flex-1 items-center justify-center">
          <LoadingSpinner />
        </div>
      </ListContainer>
    )
  }

  if (loading && bookmarks.length === 0 && googleBookmarks.length === 0) {
    return (
      <ListContainer onRef={setScrollContainerRef}>
        <BookmarksTitleBar scrollContainerRef={scrollContainerRef} />
        <div className="flex h-full flex-1 items-center justify-center">
          <LoadingSpinner />
        </div>
      </ListContainer>
    )
  }

  if (bookmarks.length === 0 && googleBookmarks.length === 0) {
    return (
      <ListContainer onRef={setScrollContainerRef}>
        <TitleBar scrollContainerRef={scrollContainerRef} title="Bookmarks" />
        <div className="flex h-full flex-1 items-center justify-center">
          <h1 className="text-md text-gray-500">No bookmarks found</h1>
        </div>
      </ListContainer>
    )
  }

  return (
    <ListContainer data-cy="bookmarks-list" onRef={setScrollContainerRef}>
      <BookmarksTitleBar scrollContainerRef={scrollContainerRef} />
      <LayoutGroup>
        <div className="space-y-4 p-3">
          {/* Regular Bookmarks */}
          {bookmarks.length > 0 && (
            <div>
              <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-neutral-500">
                My Bookmarks
              </h2>
              <div className="space-y-1">
                {bookmarks.map((content, index) => {
                  const isActive = pathname === `/bookmarks/${content.id}`

                  return (
                    <motion.div
                      layout
                      key={content.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.3,
                        delay: index * 0.05,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                    >
                      <BookmarksListItem active={isActive} bookmark={content} />
                    </motion.div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Google Chrome Bookmarks */}
          {googleBookmarks.length > 0 && (
            <div>
              <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-neutral-500">
                Chrome Bookmarks
              </h2>
              <div className="space-y-1">
                {googleBookmarks.map((bookmark, index) => {
                  const domain = bookmark.url
                    ? new URL(bookmark.url).hostname.replace('www.', '')
                    : ''

                  return (
                    <motion.div
                      layout
                      key={bookmark.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.3,
                        delay: (bookmarks.length + index) * 0.05,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                    >
                      <a
                        href={bookmark.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-center gap-3 rounded-lg border border-neutral-800 bg-neutral-900/50 p-3 transition-colors hover:border-neutral-700 hover:bg-neutral-900"
                      >
                        <div className="flex min-w-0 flex-1 items-center gap-3">
                          {bookmark.icon_url ? (
                            <img
                              src={bookmark.icon_url}
                              alt=""
                              className="h-4 w-4 shrink-0"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none'
                              }}
                            />
                          ) : (
                            <div className="h-4 w-4 shrink-0 rounded bg-neutral-700" />
                          )}
                          <div className="min-w-0 flex-1">
                            <div className="truncate text-sm font-medium text-neutral-200">
                              {bookmark.title}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-neutral-500">
                              <span className="truncate">{domain}</span>
                              {bookmark.folder_path && (
                                <>
                                  <span>•</span>
                                  <span className="truncate">
                                    {bookmark.folder_path}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                          <ExternalLink
                            size={14}
                            className="shrink-0 text-neutral-500 opacity-0 transition-opacity group-hover:opacity-100"
                          />
                        </div>
                      </a>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </LayoutGroup>
    </ListContainer>
  )
}
