'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { useHotkeys } from 'react-hotkeys-hook'

import { Detail } from '@/components/list-detail/detail'
import { TitleBar } from '@/components/list-detail/title-bar'
import { toggleLogin } from '@/constants'
import { useSupabaseUser } from '@/hooks/useSupabaseUser'
import { registerUser } from '@/services/api/register-user'

function SectionTitle(props: any) {
  return (
    <h4
      className="col-span-2 pt-8 text-lg font-extrabold text-black md:pt-0 md:text-right md:text-base md:font-normal md:text-opacity-40 dark:text-white"
      {...props}
    />
  )
}

function SectionContent(props: any) {
  return <div className="col-span-10" {...props} />
}

interface TableRowProps {
  href: string
  title: string
  date: string
  subtitle?: string
}

function TableRow({ href, title, subtitle, date }: TableRowProps) {
  return (
    <a
      target="_blank"
      rel="noopener noreferrer"
      href={href}
      className="group flex flex-col gap-0.5 sm:flex-row sm:items-center sm:gap-4"
    >
      <strong className="line-clamp-2 font-medium text-gray-1000 group-hover:text-blue-600 group-hover:underline dark:text-gray-100 dark:group-hover:text-blue-500">
        {title}
      </strong>
      <span className="hidden flex-1 shrink border-t border-dashed border-gray-300 sm:flex dark:border-gray-800" />
      {subtitle && <span className="text-tertiary flex-none">{subtitle}</span>}
      {date && (
        <span className="text-quaternary flex-none font-mono">{date}</span>
      )}
    </a>
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

/* 
rojectos
- [ ] My-space
- [ ] Pausa
- [ ] Lector
- [ ] heyfrwrd
- [ ] Store env
 */

const projects = [
  {
    href: '/',
    title: 'My Space',
    subtitle: 'Archive writings, projects, and bookmark awesome stuff.',
  },
  {
    href: 'https://github.com/MGeovany/pausa',
    title: 'Pausa',
    subtitle: 'Pause your work and take a break.',
  },
  {
    href: 'https://lector.thefndrs.com/',
    title: 'Lector',
    subtitle: 'Read your favorite books.',
  },
  {
    href: 'https://www.heyfrwrd.me/',
    title: 'Heyfrwrd',
    subtitle: 'AI agent for Instagram sales.',
  },
  {
    href: 'https://store-env.vercel.app/',
    title: 'Store Env',
    subtitle: 'Store environment variables for your projects.',
  },

  {
    href: 'https://next-enterprise.thefndrs.com/',
    title: 'FNDRS Next Enterprise Boilerplate',
    subtitle: 'Boilerplate for Next.js enterprise projects.',
  },
]

const workHistory = [
  {
    href: 'https://savvly.com',
    title: 'Savvly',
    subtitle: 'Software Engineer',
    date: 'Jun 22 — Present',
  },
  {
    title: 'OneTouch',
    subtitle: 'Frontend Developer',
    date: 'Aug 23 — Jun 24',
  },
  {
    title: 'OnCorp',
    subtitle: 'Frontend Developer',
    date: 'Nov 25 — Jan 26',
  },
  {
    title: 'FNDRS',
    href: 'https://thefndrs.com',
    subtitle: 'Founder',
    date: 'Nov 24 — Present',
  },
]

export function Intro() {
  const [start, setStart] = useState(false)
  const { user } = useSupabaseUser()
  const titleRef = useRef<HTMLParagraphElement | null>(null)
  const scrollContainerRef = useRef(null)

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
              <div className="text-primary prose">
                <p>
                  Hi, I'm Marlon Geovany Castro Mejia.{' '}
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
                    rel={job.href ? 'noopener noreferrer' : ''}
                    className={job.href ? 'hover:underline' : 'no-underline'}
                    href={job.href ?? ''}
                    target={job.href ? '_blank' : '_self'}
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
                {projects.map((project) => (
                  <TableRow
                    key={project.title}
                    href={project.href}
                    title={project.title}
                    subtitle={project.subtitle}
                    date={project.date}
                  />
                ))}
              </div>
            </SectionContent>
          </SectionContainer>
        </div>
      </Detail.ContentContainer>
    </Detail.Container>
  )
}
