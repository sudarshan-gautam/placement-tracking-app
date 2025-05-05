import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Header } from '@/components/ui/header'
import { Footer } from '@/components/ui/footer'
import { BottomNav } from '@/components/ui/bottom-nav'
import { AuthProvider } from '@/lib/auth-context'
import { Toaster } from "@/components/ui/toaster"
import { ClientInitializer } from '@/components/client-initializer'

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
        <AuthProvider>
          <ClientInitializer />
          <div className="min-h-screen bg-white flex flex-col">
            <Header />
            <main className="flex-grow pb-32">
              {children}
            </main>
            <Footer />
          </div>
          <BottomNav />
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  )
} 