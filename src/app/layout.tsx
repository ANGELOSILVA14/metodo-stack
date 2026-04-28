import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Método Stack: Ferramenta de Comunidades',
  description: 'Construa a estratégia completa da sua comunidade com o Método Stack.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-slate-50">{children}</body>
    </html>
  )
}
