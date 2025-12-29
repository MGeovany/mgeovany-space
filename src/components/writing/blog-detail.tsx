'use client'

import axios from 'axios'
import Image from 'next/image'
import Link from 'next/link'
import { NextSeo } from 'next-seo'
import { MutableRefObject, RefObject, useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'

import { Icons } from '@/components/icons'
import { Detail } from '@/components/list-detail/detail'
import { TitleBar } from '@/components/list-detail/title-bar'
import { MarkdownRenderer } from '@/components/markdown-renderer'
import routes from '@/config/routes'
import { API_URL } from '@/constants'

export function BlogDetail({ id }: { id: string }) {
  const [data, setData] = useState<Blog>()
  const [imageBroken, setImageBroken] = useState<boolean>()
  const [loading, setLoading] = useState<boolean>(false)

  const scrollContainerRef: RefObject<HTMLDivElement> = useRef(null)
  const titleRef: MutableRefObject<HTMLParagraphElement | null> = useRef(null)

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      try {
        const response = await axios.get(`${API_URL}/blog/${id}`)
        const data = response.data
        if (data.success) {
          setData(data.data)
        }
      } catch (error) {
        toast.error(`[Writing] Error fetching blog post: ${error}`)
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
          description: data.description,
          images: [
            {
              url: routes.writing.seo.image || '',
              alt: routes.writing.seo.description,
            },
          ],
        }}
      />
      <Detail.Container ref={scrollContainerRef}>
        <TitleBar
          backButton
          globalMenu={false}
          backButtonHref={'/writing'}
          magicTitle
          title={data.title}
          titleRef={titleRef}
          scrollContainerRef={scrollContainerRef}
        />
        <Detail.ContentContainer>
          <Detail.Header>
            <Link
              href={data.url ?? ''}
              target="_blank"
              rel="noopener"
              className="block"
            >
              <Detail.Title ref={titleRef}>{data.title}</Detail.Title>
            </Link>
            {/*  <Link
              href={data.url ?? ''}
              target="_blank"
              rel="noopener"
              className="flex items-center space-x-2 leading-snug text-tertiary"
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
              <span>{data.url ? new URL(data.url).hostname : ''}</span>
            </Link> */}
            {data.content && (
              <MarkdownRenderer
                className="prose italic opacity-70"
                children={data.content}
                variant="comment"
              />
            )}
          </Detail.Header>
        </Detail.ContentContainer>
      </Detail.Container>
    </>
  )
}
