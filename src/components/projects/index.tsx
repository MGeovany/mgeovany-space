'use client'
import axios from 'axios'
import { LayoutGroup, motion } from 'framer-motion'
import { usePathname } from 'next/navigation'
import { MutableRefObject, useEffect, useState } from 'react'
import toast from 'react-hot-toast'

import { ListContainer } from '@/components/list-detail/ListContainer'
import { TitleBar } from '@/components/list-detail/title-bar'
import { LoadingSpinner } from '@/components/loading-spinner'
import { ProjectIdeaListItem } from '@/components/projects/project-list-item'
import { API_URL } from '@/constants'

export const ProjectIdeasList = () => {
  const pathname = usePathname()

  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<ProjectIdeas[]>([])
  const [scrollContainerRef, setScrollContainerRef] = useState<
    MutableRefObject<HTMLElement | null> | undefined
  >(undefined)

  useEffect(() => {
    setLoading(true)
    axios
      .get(`${API_URL}/project_ideas`)
      .then((response) => {
        setData(response.data.data)
      })
      .catch((error) => {
        toast.error(`[Projects] Error fetching project ideas: ${error}`)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <ListContainer onRef={setScrollContainerRef}>
        <TitleBar scrollContainerRef={scrollContainerRef} title="Projects" />
        <div className="flex h-full flex-1 items-center justify-center">
          <LoadingSpinner />
        </div>
      </ListContainer>
    )
  }

  if (data.length === 0) {
    return (
      <ListContainer onRef={setScrollContainerRef}>
        <TitleBar scrollContainerRef={scrollContainerRef} title="Projects" />
        <div className="flex h-full flex-1 items-center justify-center">
          <h1 className="text-md text-gray-500">No projects found</h1>
        </div>
      </ListContainer>
    )
  }

  return (
    <ListContainer onRef={setScrollContainerRef}>
      <TitleBar scrollContainerRef={scrollContainerRef} title="📡 Projects" />
      <LayoutGroup>
        <div className="lg:space-y-1 lg:p-3">
          {data.map((content) => {
            const isActive = pathname === `/project-ideas/${content.id}`

            return (
              <motion.div layout key={content.id}>
                <ProjectIdeaListItem active={isActive} projectIdeas={content} />
              </motion.div>
            )
          })}
        </div>
      </LayoutGroup>
    </ListContainer>
  )
}
