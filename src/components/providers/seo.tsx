import dynamic from 'next/dynamic'
import Head from 'next/head'

import { defaultSEO } from '@/config/seo'

const DefaultSeo = dynamic(
  () => import('next-seo').then((mod) => mod.DefaultSeo),
  { ssr: false }
)

export function SEO() {
  return (
    <>
      <Head>
        <link rel="icon" href="/static/favicon.ico" sizes="any" />
        <link
          rel="icon"
          href="/static/favicon.ico"
          type="image/x-icon"
          sizes="any"
        />
        <link rel="mask-icon" href="/static/favicon.ico" />
        <link rel="apple-touch-icon" href="/static/meta/apple-touch-icon.png" />
        <link rel="manifest" href="/static/meta/manifest.webmanifest" />
        <meta
          name="theme-color"
          content="rgb(23, 23, 23)"
          media="(prefers-color-scheme: light)"
        />
        <meta
          name="theme-color"
          content="rgb(23, 23, 23)"
          media="(prefers-color-scheme: dark)"
        />
      </Head>
      <DefaultSeo {...defaultSEO} />
    </>
  )
}
