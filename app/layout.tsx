import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Header } from '@/components/ui/header'
import { Footer } from '@/components/ui/footer'
import { BottomNav } from '@/components/ui/bottom-nav'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Practitioner Passport',
  description: 'Track your professional development journey',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-white flex flex-col">
          <Header />
          <main className="flex-grow pb-32">
            {children}
          </main>
          <Footer />
        </div>
        <BottomNav />
      </body>
    </html>
  )
} 