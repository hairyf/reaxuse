import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'reaxuse playground',
  description: 'A React port of VueUse — continuously AI-mapped from the upstream implementation',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
