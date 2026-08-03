'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { useHotkeys } from 'react-hotkeys-hook'

import { Detail } from '@/components/list-detail/detail'
import { TitleBar } from '@/components/list-detail/title-bar'
import { toggleLogin } from '@/constants'
import { LOCAL_PROJECTS, normalizeProjectName } from '@/data/projects'
import { useSupabaseUser } from '@/hooks/useSupabaseUser'
import { Project } from '@/types/project'

function SectionTitle(props: any) {
  return (
    <h4
      className="col-span-2 pt-8 text-lg font-extrabold text-black dark:text-white md:pt-0 md:text-right md:text-base md:font-normal md:text-opacity-40"
      {...props}
    />
  )
}

function SectionContent(props: any) {
  return <div className="col-span-10" {...props} />
}

interface TableRowProps {
  href?: string
  title: string
  date: string
  subtitle?: string
  /** When false, use Link for same-tab navigation (e.g. /projects/id) */
  external?: boolean
}

type HomeProjectRow = TableRowProps & {
  title: string
}

function TableRow({
  href,
  title,
  subtitle,
  date,
  external = true,
}: TableRowProps) {
  const content = (
    <>
      <strong className="font-medium text-neutral-100 group-hover:text-blue-500 group-hover:underline sm:shrink-0">
        {title}
      </strong>
      <span className="hidden flex-1 shrink border-t border-dashed border-neutral-900 sm:flex" />
      {subtitle && (
        <span className="text-tertiary max-w-full truncate text-left sm:max-w-md sm:text-right">
          {subtitle}
        </span>
      )}
      {date && (
        <span className="text-quaternary flex-none font-mono">{date}</span>
      )}
    </>
  )
  const className =
    'group flex flex-col gap-0.5 sm:flex-row sm:items-center sm:gap-4'
  if (!href) {
    return <div className={className}>{content}</div>
  }

  if (external) {
    return (
      <a
        target="_blank"
        rel="noopener noreferrer"
        href={href}
        className={className}
      >
        {content}
      </a>
    )
  }
  return (
    <Link href={href} className={className}>
      {content}
    </Link>
  )
}

function SectionContainer(props: any) {
  return (
    <div
      className="grid grid-cols-1 items-start gap-6 md:grid-cols-12"
      {...props}
    />
  )
}

const homeProjectSubtitles = new Map([
  ['rivalo-ios', 'Match tracking for players and local teams.'],
  ['soma-tv', 'Wi-Fi remote control for LG and Samsung TVs.'],
  ['nocturne-extension', 'DevTools for requests and console output.'],
  ['personal-finance-ios', 'Budgeting, debt tracking, and review.'],
])

const latestProjects: HomeProjectRow[] = LOCAL_PROJECTS.reduce<
  HomeProjectRow[]
>((projects, project) => {
  const subtitle = homeProjectSubtitles.get(project.id)

  if (!subtitle) {
    return projects
  }

  projects.push({
    href: `/projects/${project.id}`,
    title: project.name,
    subtitle,
    date: project.status === 'In progress' ? 'Now' : 'Latest',
    external: false,
  })

  return projects
}, [])

const latestProjectNames = new Set(
  latestProjects.map((project) => normalizeProjectName(project.title))
)

const workHistory = [
  {
    href: 'https://savvly.com',
    title: 'Savvly',
    subtitle: 'Software Engineer',
    date: 'Jun 22 - Present',
  },
  {
    title: 'OneTouch',
    href: 'https://www.linkedin.com/in/m-geovany/',
    subtitle: 'Frontend Developer',
    date: 'Aug 23 - Jun 24',
  },
  {
    title: 'OnCorp',
    href: 'https://www.linkedin.com/in/m-geovany/',
    subtitle: 'Frontend Developer',
    date: 'Nov 25 - Jan 26',
  },
  {
    title: 'FNDRS',
    href: 'https://thefndrs.com',
    subtitle: 'Founder',
    date: 'Nov 24 - Present',
  },
]

interface IntroProps {
  /** Projects marked to show on homepage (from editor JSON showOnHome) */
  featuredProjects?: Project[]
}

export function Intro({ featuredProjects }: IntroProps) {
  const [start, setStart] = useState(false)
  const { user } = useSupabaseUser()
  const titleRef = useRef<HTMLParagraphElement | null>(null)
  const scrollContainerRef = useRef(null)
  const projectRows = (featuredProjects ?? []).reduce<HomeProjectRow[]>(
    (projects, project) => {
      if (latestProjectNames.has(normalizeProjectName(project.name))) {
        return projects
      }

      projects.push({
        href: project.links?.live || `/projects/${project.id}`,
        title: project.name,
        subtitle: project.shortDesc || project.tagline || project.summary || '',
        date: '',
        external: Boolean(project.links?.live),
      })

      return projects
    },
    [...latestProjects]
  )

  useEffect(() => {
    if (typeof window !== 'undefined') {
      titleRef.current = document.createElement('p')
    }
  }, [user])

  useHotkeys(toggleLogin, () => setStart((p) => !p))

  return (
    <Detail.Container data-cy="home-intro" ref={scrollContainerRef}>
      <TitleBar
        magicTitle
        titleRef={titleRef}
        scrollContainerRef={scrollContainerRef}
        title="Home"
      />

      {/* Keep this div to trigger the magic scroll */}
      <div className="p-4" ref={titleRef} />

      <Detail.ContentContainer>
        <div className="space-y-8 pb-24 md:space-y-16">
          <SectionContainer>
            <SectionTitle />
            <SectionContent>
              <div className="prose text-primary">
                <p>
                  Hi, I&apos;m Marlon Geovany Castro Mejia.{' '}
                  {start &&
                    (!user ? (
                      <Link href="/login">Login</Link>
                    ) : (
                      <Link href="/logout">Logout</Link>
                    ))}{' '}
                  I’m a{' '}
                  <a
                    target="_blank"
                    rel="noopener noreferrer"
                    href="https://github.com/mgeovany"
                    className="text-orange-600 hover:underline"
                  >
                    software engineer
                  </a>{' '}
                  who loves diving into the intricacies of how websites
                  function.
                </p>
                <p className="my-4">
                  Currently, I’m focused on developing applications and writing{' '}
                  <a
                    target="_blank"
                    rel="noopener noreferrer"
                    href="https://medium.com/@mgeovany"
                    className="text-orange-600 hover:underline"
                  >
                    technical blogs
                  </a>{' '}
                  to share my knowledge and experiences in the field.
                </p>
                <p>
                  In my career, I’ve worked on various projects that allow me to
                  explore and enhance web technologies. I also enjoy documenting
                  my journey and insights through{' '}
                  <a
                    target="_blank"
                    rel="noopener noreferrer"
                    href="https://dev.to/mgeovany"
                    className="text-orange-600 hover:underline"
                  >
                    blogging,
                  </a>{' '}
                  aiming to help others in their software development path.
                </p>
              </div>
              <Image
                src="/static/meta/me.webp"
                alt="Marlon Geovany Castro Mejia"
                width={200}
                height={200}
                className="my-4 rounded-lg"
              />
            </SectionContent>
          </SectionContainer>

          <SectionContainer>
            <SectionTitle>Online</SectionTitle>
            <SectionContent>
              <div className="flex flex-col gap-5 lg:gap-3">
                <TableRow
                  href={'https://github.com/mgeovany'}
                  title={'GitHub'}
                  subtitle={'Follow'}
                  date={''}
                />
                <TableRow
                  href={'https://www.linkedin.com/in/m-geovany/'}
                  title={'LinkedIn'}
                  subtitle={'Follow'}
                  date={''}
                />
                <TableRow
                  href={'https://medium.com/@mgeovany'}
                  title={'Medium'}
                  subtitle={'Read'}
                  date={''}
                />
                <TableRow
                  href={'https://dev.to/mgeovany'}
                  title={'Dev.to'}
                  subtitle={'Read'}
                  date={''}
                />
              </div>
            </SectionContent>
          </SectionContainer>

          <SectionContainer>
            <SectionTitle>Work</SectionTitle>
            <SectionContent>
              <div className="flex flex-col space-y-3">
                {workHistory.map((job) => (
                  <TableRow
                    href={job.href ?? ''}
                    title={job.title}
                    subtitle={job.subtitle}
                    date={job.date}
                    key={job.title}
                  />
                ))}
              </div>
            </SectionContent>
          </SectionContainer>

          <SectionContainer>
            <SectionTitle>Projects</SectionTitle>
            <SectionContent>
              <div className="flex flex-col space-y-3">
                {projectRows.length > 0 ? (
                  projectRows.map((p) => (
                    <TableRow
                      key={p.title}
                      href={p.href}
                      title={p.title}
                      subtitle={p.subtitle}
                      date={p.date}
                      external={p.external}
                    />
                  ))
                ) : (
                  <p className="text-tertiary text-sm">
                    No projects featured on main yet.
                  </p>
                )}
              </div>
            </SectionContent>
          </SectionContainer>
        </div>
      </Detail.ContentContainer>
    </Detail.Container>
  )
}
