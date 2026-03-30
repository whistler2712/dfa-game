import type { Metadata } from 'next'
import { Nunito, Gaegu } from 'next/font/google'
import './globals.css'

const nunito = Nunito({
  variable: '--font-nunito',
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
})

const gaegu = Gaegu({
  variable: '--font-gaegu',
  subsets: ['latin'],
  weight: ['400', '700'],
})

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : 'http://localhost:3000'
  ),
  title: '도형 미로 — 방과 통로를 연결하는 퍼즐',
  description: '별, 원, 네모 도형 순서를 보고 방과 통로 지도를 그리는 퍼즐 게임',
  icons: {
    icon: '/favicon.svg',
  },
  openGraph: {
    title: '도형 미로 — 방과 통로를 연결하는 퍼즐',
    description: '별, 원, 네모 도형 순서를 보고 방과 통로 지도를 그리는 퍼즐 게임',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '도형 미로 — 방과 통로를 연결하는 퍼즐',
    description: '별, 원, 네모 도형 순서를 보고 방과 통로 지도를 그리는 퍼즐 게임',
    images: ['/og-image.png'],
  },
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="ko"
      className={`${nunito.variable} ${gaegu.variable} h-full antialiased`}
    >
      <body className="h-full bg-[#FDF6EC]">{children}</body>
    </html>
  )
}
