import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Header } from '@/components/ui/header'
import { Footer } from '@/components/ui/footer'
import { BottomNav } from '@/components/ui/bottom-nav'
import { AuthProvider } from '@/lib/auth-context'
import { ThemeProvider } from '@/components/providers/theme-provider'

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
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <AuthProvider>
            <div className="min-h-screen bg-white flex flex-col">
              <Header />
              <main className="flex-grow pb-32">
                {children}
              </main>
              <Footer />
            </div>
            <BottomNav />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
} 