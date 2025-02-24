import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Link from 'next/link'
import { Home, Award, BookOpen, Calendar, BarChart2, Plus } from 'lucide-react'
import { ThemeProvider } from '@/components/providers/theme-provider'
import { Header } from '@/components/ui/header'

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
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {/* Main Content */}
          <div className="min-h-screen bg-background">
            <Header />
            {children}

            {/* Bottom Navigation */}
            <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border p-4">
              <div className="flex justify-around items-center max-w-4xl mx-auto relative">
                <Link href="/" className="flex flex-col items-center text-foreground hover:text-primary">
                  <Home className="h-6 w-6" />
                  <span className="text-xs">Home</span>
                </Link>
                <Link href="/qualifications" className="flex flex-col items-center text-foreground hover:text-primary">
                  <Award className="h-6 w-6" />
                  <span className="text-xs">Quals + Experience</span>
                </Link>
                <div className="relative -top-0">
                  <Link 
                    href="/quick-actions" 
                    className="flex flex-col items-center justify-center w-14 h-14 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg"
                  >
                    <Plus className="h-8 w-8" />
                  </Link>
                </div>
                <Link href="/competencies" className="flex flex-col items-center text-foreground hover:text-primary">
                  <BookOpen className="h-6 w-6" />
                  <span className="text-xs">Role Competency</span>
                </Link>
                <Link href="/sessions" className="flex flex-col items-center text-foreground hover:text-primary">
                  <Calendar className="h-6 w-6" />
                  <span className="text-xs">Session Library</span>
                </Link>
              </div>
            </nav>
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
} 