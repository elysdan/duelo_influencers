import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ToastProvider } from '@/components/ui/ToastProvider'
import { SmoothScrollProvider } from '@/components/layout/SmoothScrollProvider'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'Micasino TV Show | Micro Duelo de Influencers',
    template: '%s | Micasino TV Show',
  },
  description:
    'El show televisivo oficial de Micasino. Micro duelos de influencers en vivo, noticias del show, opiniones y comunidad en un solo lugar.',
  keywords: ['Micasino', 'TV Show', 'Micro Duelos', 'Influencers', 'En Vivo', 'Comunidad'],
  openGraph: {
    title: 'Micasino TV Show | Micro Duelo de Influencers',
    description: 'El show televisivo oficial de Micasino. Micro duelos de influencers en vivo.',
    locale: 'es_VE',
    type: 'website',
  },
}

export const viewport: Viewport = {
  themeColor: '#07090F',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className={`${inter.variable} dark`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=JetBrains+Mono:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased min-h-screen">
        <SmoothScrollProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </SmoothScrollProvider>
      </body>
    </html>
  )
}
