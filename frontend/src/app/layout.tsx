import { type Metadata } from 'next'
import {
  ClerkProvider,
} from '@clerk/nextjs'
import './globals.css'

export const metadata: Metadata = {
  title: 'Dinero Sabio',
  description: 'Bilingual Personal Finance for First Time Investors',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body suppressHydrationWarning>
          {children}
        </body>
      </html>
    </ClerkProvider>
  )
}