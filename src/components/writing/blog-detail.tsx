'use client'

import axios from 'axios'
import { formatDistanceToNowStrict } from 'date-fns'
import { motion } from 'framer-motion'
import { Calendar, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { NextSeo } from 'next-seo'
import { MutableRefObject, RefObject, useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'

import { Icons } from '@/components/icons'
import { Detail } from '@/components/list-detail/detail'
import { TitleBar } from '@/components/list-detail/title-bar'
import { MarkdownRenderer } from '@/components/markdown-renderer'
import routes from '@/config/routes'

type PostData = {
  id: string
  title: string
  slug: string
  excerpt: string | null
  content: string | null
  content_html: string | null
  url: string | null
  canonical_url: string | null
  published_at: string | null
  created_at: string
  updated_at: string
  source: 'local' | 'medium' | 'devto'
}

export function BlogDetail({ id }: { id: string }) {
  const [data, setData] = useState<PostData | null>(null)
  const [loading, setLoading] = useState<boolean>(false)

  const scrollContainerRef: RefObject<HTMLDivElement> = useRef(null)
  const titleRef: MutableRefObject<HTMLParagraphElement | null> = useRef(null)

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      try {
        const response = await axios.get(`/api/writings/${id}`)
        if (response.data.data) {
          setData(response.data.data)
        }
      } catch (error: any) {
        const errorMessage =
          error?.response?.data?.error ?? error?.message ?? 'Unknown error'
        toast.error(`[Writing] Error fetching blog post: ${errorMessage}`)
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

  if (!data) {
    return null
  }

  const publishedDate = data.published_at
    ? formatDistanceToNowStrict(new Date(data.published_at), {
        addSuffix: true,
      })
    : null

  return (
    <>
      <NextSeo
        title={data.title}
        description={data.excerpt || data.title}
        openGraph={{
          title: data.title,
          description: data.excerpt || data.title,
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
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <Detail.Header>
              <div className="space-y-4">
                <div>
                  <Detail.Title ref={titleRef}>{data.title}</Detail.Title>
                  {data.excerpt && (
                    <p className="mt-3 text-lg leading-relaxed text-neutral-400">
                      {data.excerpt}
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-4 border-b border-neutral-800 pb-4 text-sm text-neutral-500">
                  {data.source && data.source !== 'local' && (
                    <div className="flex items-center gap-2 rounded-full bg-neutral-800 px-3 py-1">
                      {data.source === 'medium' && (
                        <Icons.medium className="h-4 w-4" />
                      )}
                      {data.source === 'devto' && (
                        <Icons.devTo className="h-4 w-4" />
                      )}
                      <span className="capitalize">{data.source}</span>
                    </div>
                  )}
                  {publishedDate && (
                    <div className="flex items-center gap-2">
                      <Calendar size={14} />
                      <span>Published {publishedDate}</span>
                    </div>
                  )}
                  {data.url && (
                    <Link
                      href={data.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 transition-colors hover:text-neutral-300"
                    >
                      <ExternalLink size={14} />
                      <span className="max-w-[200px] truncate">
                        {new URL(data.url).hostname.replace('www.', '')}
                      </span>
                    </Link>
                  )}
                </div>
              </div>
            </Detail.Header>
          </motion.div>

          {(data.content || data.content_html) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.4,
                delay: 0.1,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="mt-8"
            >
              {data.content_html ? (
                <div
                  className="prose prose-invert max-w-none prose-headings:text-neutral-100 prose-p:text-neutral-300 prose-a:text-blue-400 prose-strong:text-neutral-100 prose-code:text-neutral-200 prose-pre:border prose-pre:border-neutral-800 prose-pre:bg-neutral-900"
                  dangerouslySetInnerHTML={{ __html: data.content_html }}
                />
              ) : (
                <MarkdownRenderer className="prose prose-invert max-w-none prose-headings:text-neutral-100 prose-p:text-neutral-300 prose-a:text-blue-400 prose-strong:text-neutral-100 prose-code:text-neutral-200 prose-pre:border prose-pre:border-neutral-800 prose-pre:bg-neutral-900">
                  {data.content || ''}
                </MarkdownRenderer>
              )}
            </motion.div>
          )}
        </Detail.ContentContainer>
      </Detail.Container>
    </>
  )
}
