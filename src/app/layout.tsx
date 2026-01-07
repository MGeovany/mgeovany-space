import './globals.css'
import '../styles/custom-styles.css'
import '../styles/dracula.css'
import '../styles/prose-styles.css'
import '@mantine/core/styles.css'

import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { ReactNode } from 'react'

import { SiteLayout } from '@/components/layouts'
import { Providers } from '@/components/providers'
import { defaultSEO } from '@/config/seo'

const inter = Inter({ subsets: ['latin'] })

const baseUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.NODE_ENV === 'production'
    ? 'https://mgeovany.thefndrs.com'
    : 'http://localhost:3000')

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: defaultSEO.title,
    template: '%s | mgeovany',
  },
  description: defaultSEO.description,
  keywords: [
    'software engineer',
    'web development',
    'react',
    'next.js',
    'typescript',
    'full stack',
  ],
  authors: [{ name: 'mgeovany' }],
  creator: 'mgeovany',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: baseUrl,
    siteName: defaultSEO.openGraph.site_name,
    title: defaultSEO.title,
    description: defaultSEO.description,
    images: [
      {
        url: `${baseUrl}/static/meta/me.webp`,
        width: 1200,
        height: 630,
        alt: 'mgeovany',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: defaultSEO.title,
    description: defaultSEO.description,
    creator: defaultSEO.twitter.handle,
    site: defaultSEO.twitter.site,
    images: [`${baseUrl}/static/meta/me.webp`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [{ url: '/static/favicon.ico', sizes: 'any' }],
    apple: '/static/meta/apple-touch-icon.png',
  },
  manifest: '/static/meta/manifest.webmanifest',
}

export const viewport: Viewport = {
  themeColor: 'rgb(23, 23, 23)',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark" style={{ colorScheme: 'dark' }}>
      <body className={inter.className}>
        <Providers>
          <SiteLayout>{children}</SiteLayout>
        </Providers>
      </body>
    </html>
  )
}
