import './globals.css'
import '../styles/custom-styles.css'
import '../styles/dracula.css'
import '../styles/prose-styles.css'
import '@mantine/core/styles.css'

import { Inter } from 'next/font/google'
import { ReactNode } from 'react'

import { SiteLayout } from '@/components/layouts'
import { Providers } from '@/components/providers'

const inter = Inter({ subsets: ['latin'] })

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
