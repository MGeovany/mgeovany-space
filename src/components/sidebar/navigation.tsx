'use client'

import { Modal } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { Linkedin, Plus } from 'lucide-react'
import { usePathname } from 'next/navigation'

import { GhostButton, Size } from '@/components/button'
import {
  BookmarksIcon,
  ExternalLinkIcon,
  GitHubIcon,
  HomeIcon,
  WritingIcon,
} from '@/components/icon'
import { DevToIcon, MediumIcon, ProjectIcon } from '@/components/icons/shared'
import { useSupabaseUser } from '@/hooks/useSupabaseUser'

import BookmarkForm from '../bookmarks/bookmark-form'
import ProjectIdeaForm from '../projects/project-idea-form'
import BlogForm from '../writing/blog-form'
import { NavigationLink } from './navigation-link'

function ThisAddBookmarkDialog() {
  const [opened, { open, close }] = useDisclosure(false)

  return (
    <>
      <div onClick={open}>
        <GhostButton aria-label="Add bookmark" size={Size.smallSquare}>
          <Plus size={16} />
        </GhostButton>
      </div>
      <Modal
        opened={opened}
        onClose={close}
        centered
        padding={'lg'}
        styles={{
          content: { backgroundColor: '#0a0a0a', border: '1px solid #262626' },
          header: { backgroundColor: '#0a0a0a' },
          body: { backgroundColor: '#0a0a0a' },
        }}
      >
        <div className="px-10 pb-5">
          <h2 className="mb-4 text-xl font-semibold text-neutral-100">
            Add Bookmark
          </h2>
        </div>
        <div className="px-10 pb-5">
          <BookmarkForm onClose={close} />
        </div>
      </Modal>
    </>
  )
}

const ThisAddProjectDialog = () => {
  const [opened, { open, close }] = useDisclosure(false)

  return (
    <>
      <div onClick={open}>
        <GhostButton aria-label="Add project idea" size={Size.smallSquare}>
          <Plus size={16} />
        </GhostButton>
      </div>
      <Modal
        opened={opened}
        onClose={close}
        centered
        padding={'lg'}
        styles={{
          content: { backgroundColor: '#0a0a0a', border: '1px solid #262626' },
          header: { backgroundColor: '#0a0a0a' },
          body: { backgroundColor: '#0a0a0a' },
        }}
      >
        <div className="px-10 pb-5">
          <h2 className="mb-4 text-xl font-semibold text-neutral-100">
            Create Project Idea
          </h2>
          <ProjectIdeaForm onClose={close} />
        </div>
      </Modal>
    </>
  )
}

const ThisAddBlogDialog = () => {
  const [opened, { open, close }] = useDisclosure(false)

  return (
    <>
      <div onClick={open}>
        <GhostButton aria-label="Add blog" size={Size.smallSquare}>
          <Plus size={16} />
        </GhostButton>
      </div>
      <Modal
        opened={opened}
        onClose={close}
        centered
        padding={'lg'}
        size={'100vw'}
        title="Create Blog"
        styles={{
          content: { backgroundColor: '#0a0a0a', border: '1px solid #262626' },
          header: { backgroundColor: '#0a0a0a' },
          body: { backgroundColor: '#0a0a0a' },
        }}
      >
        <BlogForm onClose={close} />
      </Modal>
    </>
  )
}

export function SidebarNavigation() {
  const pathname = usePathname()
  const { user } = useSupabaseUser()

  const getUserRole = () => {
    // Supabase user metadata can contain roles
    // Adjust this based on your Supabase setup
    const userMetadata = user?.user_metadata
    const roles = userMetadata?.roles as string[] | undefined
    return roles ? roles[0] : null
  }

  const sections = [
    {
      label: null,
      items: [
        {
          href: '/',
          label: 'Home',
          icon: HomeIcon,
          trailingAccessory: null,
          isActive: pathname === '/',
          trailingAction: null,
          isExternal: false,
        },

        {
          href: '/writing',
          label: 'Writing',
          icon: WritingIcon,
          trailingAccessory: null,
          isActive: pathname?.startsWith('/writing') || false,
          isExternal: false,
          trailingAction: getUserRole() === 'admin' ? ThisAddBlogDialog : null,
        },
      ],
    },
    {
      label: 'Me',
      items: [
        {
          href: '/bookmarks',
          label: 'Bookmarks',
          icon: BookmarksIcon,
          trailingAccessory: null,
          isActive: pathname?.startsWith('/bookmarks') || false,
          isExternal: false,
          trailingAction:
            getUserRole() === 'admin' ? ThisAddBookmarkDialog : null,
        },
        {
          href: '/projects',
          label: 'Projects',
          icon: ProjectIcon,
          trailingAccessory: null,
          isActive: pathname?.startsWith('/projects') || false,
          trailingAction:
            getUserRole() === 'admin' ? ThisAddProjectDialog : null,
          isExternal: false,
        },
      ],
    },

    {
      label: 'Online',
      items: [
        {
          href: 'https://github.com/mgeovany',
          label: 'GitHub',
          icon: GitHubIcon,
          trailingAccessory: ExternalLinkIcon,
          isActive: false,
          trailingAction: null,
          isExternal: true,
        },

        {
          href: 'https://www.linkedin.com/in/m-geovany/',
          label: 'LinkedIn',
          icon: Linkedin,
          trailingAccessory: ExternalLinkIcon,
          isActive: false,
          trailingAction: null,
          isExternal: true,
        },
        {
          href: 'https://medium.com/@mgeovany',
          label: 'Medium',
          icon: MediumIcon,
          trailingAccessory: ExternalLinkIcon,
          isActive: false,
          trailingAction: null,
          isExternal: true,
        },
        {
          href: 'https://dev.to/mgeovany',
          label: 'Dev.to',
          icon: DevToIcon,
          trailingAccessory: ExternalLinkIcon,
          isActive: false,
          trailingAction: null,
          isExternal: true,
        },
      ],
    },
  ]

  return (
    <div className="flex-1 space-y-1 px-3 py-3">
      {sections.map((section, i) => {
        return (
          <ul key={i} className="space-y-1">
            {section.label && (
              <h4
                key={i}
                className="px-2 pb-2 pt-5 text-xs font-semibold text-neutral-500"
              >
                {section.label}
              </h4>
            )}
            {section.items.map((item, j) => (
              <NavigationLink key={j} link={item} />
            ))}
          </ul>
        )
      })}
    </div>
  )
}
