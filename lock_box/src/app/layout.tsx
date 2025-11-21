import type { Metadata } from 'next'
import './globals.css'
import { AppProviders } from '@/components/app-providers'
import { AppLayout } from '@/components/app-layout'
import { Spotlight } from '@/components/ui/spotlight-new'
import React from 'react'

export const metadata: Metadata = {
  title: 'LockBox',
  description: 'A decentralized savings application built on Solana blockchain',
}

const links: { label: string; path: string }[] = [
  // More links...
  { label: 'Home', path: '/' },
  { label: 'Account', path: '/account' },
  { label: 'About', path: '/about' },
]

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning className="dark overflow-x-hidden">
      <body className={`antialiased overflow-x-hidden`}>
        <AppProviders>
          <AppLayout links={links}>
            <Spotlight />
            {children}
          </AppLayout>
        </AppProviders>
      </body>
    </html>
  )
}
// Patch BigInt so we can log it using JSON.stringify without any errors
declare global {
  interface BigInt {
    toJSON(): string
  }
}

BigInt.prototype.toJSON = function () {
  return this.toString()
}
