import type { Metadata } from 'next'
import './globals.css'
import { Sidebar } from '@/components/Sidebar'

export const metadata: Metadata = {
  title: 'MaptorCards',
  description: 'Flashcards para aprendizado de programação',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body>
        <Sidebar />
        <main className="main">{children}</main>
      </body>
    </html>
  )
}
