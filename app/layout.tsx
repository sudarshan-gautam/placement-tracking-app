import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Link from 'next/link'
import { Home, Award, BookOpen, Calendar, BarChart2, Plus } from 'lucide-react'

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
        {/* Main Content */}
        <div className="min-h-screen bg-gray-50">
          {children}

          {/* Bottom Navigation */}
          <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
            <div className="flex justify-around items-center max-w-4xl mx-auto relative">
              <Link href="/" className="flex flex-col items-center text-gray-600 hover:text-blue-600">
                <Home className="h-6 w-6" />
                <span className="text-xs">Home</span>
              </Link>
              <Link href="/qualifications" className="flex flex-col items-center text-gray-600 hover:text-blue-600">
                <Award className="h-6 w-6" />
                <span className="text-xs">Quals + Experience</span>
              </Link>
              <div className="relative -top-8">
                <Link 
                  href="/quick-actions" 
                  className="flex flex-col items-center justify-center w-14 h-14 rounded-full bg-blue-600 text-white hover:bg-blue-700 shadow-lg"
                >
                  <Plus className="h-8 w-8" />
                </Link>
              </div>
              <Link href="/competencies" className="flex flex-col items-center text-gray-600 hover:text-blue-600">
                <BookOpen className="h-6 w-6" />
                <span className="text-xs">Role Competency</span>
              </Link>
              <Link href="/sessions" className="flex flex-col items-center text-gray-600 hover:text-blue-600">
                <Calendar className="h-6 w-6" />
                <span className="text-xs">Session Library</span>
              </Link>
            </div>
          </nav>
        </div>
      </body>
    </html>
  )
} 