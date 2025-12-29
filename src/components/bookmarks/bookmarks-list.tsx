'use client'
import axios from 'axios'
import { LayoutGroup, motion } from 'framer-motion'
import { usePathname } from 'next/navigation'
import { MutableRefObject, useEffect, useState } from 'react'
import toast from 'react-hot-toast'

import { BookmarksListItem } from '@/components/bookmarks/bookmarks-list-item'
import { BookmarksTitleBar } from '@/components/bookmarks/bookmarks-title-bar'
import { ListContainer } from '@/components/list-detail/ListContainer'
import { LoadingSpinner } from '@/components/loading-spinner'
import { API_URL } from '@/constants'

import { TitleBar } from '../list-detail/title-bar'

export const BookmarksList = () => {
  const pathname = usePathname()

  const [loading, setLoading] = useState(false)
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
  const [scrollContainerRef, setScrollContainerRef] = useState<
    MutableRefObject<HTMLElement | null> | undefined
  >(undefined)

  useEffect(() => {
    setLoading(true)
    axios
      .get(`${API_URL}/bookmark`)
      .then((response) => {
        setBookmarks(response.data.data)
      })
      .catch((error) => {
        toast.error(`[Bookmarks] Error fetching bookmarks: ${error}`)
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

  if (bookmarks.length === 0) {
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
        <div className="lg:space-y-1 lg:p-3">
          {bookmarks.map((content) => {
            const isActive = pathname === `/bookmarks/${content.id}`

            return (
              <motion.div layout key={content.id}>
                <BookmarksListItem active={isActive} bookmark={content} />
              </motion.div>
            )
          })}
        </div>
      </LayoutGroup>
    </ListContainer>
  )
}
