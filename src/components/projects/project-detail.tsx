'use client'

import axios from 'axios'
import { LinkIcon } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { NextSeo } from 'next-seo'
import { MutableRefObject, RefObject, useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'

import { PrimaryButton, Size } from '@/components/button'
import { Icons } from '@/components/icons'
import { Detail } from '@/components/list-detail/detail'
import { TitleBar } from '@/components/list-detail/title-bar'
import { MarkdownRenderer } from '@/components/markdown-renderer'
import routes from '@/config/routes'
import { API_URL } from '@/constants'

export function ProjectDetail({ id }: { id: string }) {
  const [data, setData] = useState<ProjectIdeas>()
  const [imageBroken, setImageBroken] = useState<boolean>()
  const [loading, setLoading] = useState<boolean>(false)

  const scrollContainerRef: RefObject<HTMLDivElement> = useRef(null)
  const titleRef: MutableRefObject<HTMLParagraphElement | null> = useRef(null)

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      try {
        const response = await axios.get(`${API_URL}/project_ideas/${id}`)
        const data = response.data
        if (data.success) {
          setData(data.data)
        }
      } catch (error) {
        toast.error(`[Projects] Error fetching project idea: ${error}`)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [id])

  if (loading) {
    return <Detail.Loading />
  }

  if (!data) {
    return <Detail.Loading />
  }

  return (
    <>
      <NextSeo
        title={data.title}
        description={data.description}
        openGraph={{
          title: data.title,
          description: data.title,
          images: [
            {
              url: routes.projects.seo.image || '',
              alt: routes.projects.seo.description,
            },
          ],
        }}
      />
      <Detail.Container ref={scrollContainerRef}>
        <TitleBar
          backButton
          globalMenu={false}
          backButtonHref={'/project-ideas'}
          magicTitle
          title={data.title}
          titleRef={titleRef}
          scrollContainerRef={scrollContainerRef}
        />
        <Detail.ContentContainer>
          <Detail.Header>
            <Link
              href={data.url}
              target="_blank"
              rel="noopener"
              className="block"
            >
              <Detail.Title ref={titleRef}>{data.title}</Detail.Title>
            </Link>
            <Link
              href={data.url}
              target="_blank"
              rel="noopener"
              className="text-tertiary flex items-center space-x-2 leading-snug"
            >
              {imageBroken ? (
                <Icons.url />
              ) : (
                <Image
                  src={`https://www.google.com/s2/favicons?domain=${data.url}`}
                  alt="favicon"
                  width={16}
                  height={16}
                  onError={() => setImageBroken(true)}
                />
              )}
              <span>{new URL(data.url).hostname}</span>
            </Link>
            {data.url && (
              <MarkdownRenderer
                className="prose italic opacity-70"
                variant="comment"
              >
                {data.description}
              </MarkdownRenderer>
            )}
          </Detail.Header>
          <div className="mt-6">
            <PrimaryButton
              size={Size.large}
              href={data.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              <LinkIcon size={14} />
              <span>Visit</span>
            </PrimaryButton>
          </div>
        </Detail.ContentContainer>
      </Detail.Container>
    </>
  )
}
