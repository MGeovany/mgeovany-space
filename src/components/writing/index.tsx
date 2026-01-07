'use client'
import axios from 'axios'
import { LayoutGroup, motion } from 'framer-motion'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

import { ListContainer } from '@/components/list-detail/ListContainer'
import { TitleBar } from '@/components/list-detail/title-bar'
import { LoadingSpinner } from '@/components/loading-spinner'
import { API_URL } from '@/constants'

import { BlogListItem } from './blog-list-item'

export const WritingList = () => {
  const pathname = usePathname()

  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<Blog[]>([])
  const [scrollContainerRef, setScrollContainerRef] = useState<
    React.MutableRefObject<HTMLElement | null> | undefined
  >(undefined)

  useEffect(() => {
    setLoading(true)
    ;(async () => {
      try {
        const response = await axios.get('/api/writings')

        setData(response.data.data)
      } catch (error) {
        toast.error(`[Writing] Error fetching posts: ${error}`)
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  if (loading && data.length === 0) {
    return (
      <ListContainer onRef={setScrollContainerRef}>
        <TitleBar scrollContainerRef={scrollContainerRef} title="Blogs" />
        <div className="flex flex-1 items-center justify-center">
          <LoadingSpinner />
        </div>
      </ListContainer>
    )
  }

  return (
    <ListContainer onRef={setScrollContainerRef}>
      <TitleBar scrollContainerRef={scrollContainerRef} title="Blogs" />
      <LayoutGroup>
        <div className="space-y-2 p-3">
          {data.length > 0 ? (
            data.map((content, index) => {
              const isActive = pathname === `/writing/${content.id}`

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
                  <BlogListItem active={isActive} blog={content} />
                </motion.div>
              )
            })
          ) : (
            <div className="flex h-full flex-1 items-center justify-center">
              <h1 className="text-md text-neutral-500">No blogs found</h1>
            </div>
          )}
        </div>
      </LayoutGroup>
    </ListContainer>
  )
}
