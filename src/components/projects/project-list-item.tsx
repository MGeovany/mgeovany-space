import Image from 'next/image'
import { memo, useState } from 'react'

import { Icons } from '@/components/icons'
import { ListItem } from '@/components/list-detail/list-item'

interface ProjectIdeaItemProps {
  projectIdeas: ProjectIdeas
  active: boolean
}

export const ProjectIdeaListItem = memo<ProjectIdeaItemProps>(
  ({ projectIdeas, active }) => {
    const [imageBroken, setImageBroken] = useState<boolean>(false)

    function handleClick(e: any, projectIdeas: ProjectIdeas) {
      if (e.metaKey) {
        e.preventDefault()
        e.stopPropagation()
        if (projectIdeas && projectIdeas.url) {
          const url = projectIdeas.url
          window.open(url, '_blank')?.focus()
        }
      }
    }

    return (
      <ListItem
        key={projectIdeas.id}
        title={projectIdeas.title}
        byline={
          <div className="flex items-center space-x-2">
            {
              imageBroken ? <Icons.url /> : null
              /*  <Image
                src={`https://www.google.com/s2/favicons?domain=${projectIdeas.url}`}
                alt="favicon"
                width={16}
                height={16}
                onError={() => setImageBroken(true)}
              /> */
            }
            <span> {new URL(projectIdeas.url).hostname}</span>
          </div>
        }
        active={active}
        href="/project-ideas/[id]"
        as={`/project-ideas/${projectIdeas.id}`}
        onClick={(e) => handleClick(e, projectIdeas)}
      />
    )
  }
)
