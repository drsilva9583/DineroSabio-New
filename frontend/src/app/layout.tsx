import { type Metadata } from 'next'
import { Galindo, Nunito } from 'next/font/google'
import {
  ClerkProvider,
} from '@clerk/nextjs'
import ThemeProvider from '@/components/ThemeProvider'
import './globals.css'

// Galindo ships a single weight (400) — it's a display face, so that's all we need.
// `variable` exposes it as a CSS var that globals.css maps to --font-display.
const galindo = Galindo({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-galindo',
  display: 'swap',
})

// Nunito is the workhorse — load the weights the UI actually uses so we don't
// ship bytes for weights nothing renders.
const nunito = Nunito({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-nunito',
  display: 'swap',
})

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
      <html lang="en" className={`${galindo.variable} ${nunito.variable}`} suppressHydrationWarning>
        <body suppressHydrationWarning>
          <ThemeProvider>
            {children}
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}