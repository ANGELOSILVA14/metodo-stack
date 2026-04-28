'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

// ---- Renderizador de markdown simples ----
function renderInline(text: string): React.ReactNode {
  const parts: React.ReactNode[] = []
  const regex = /(\*\*(.+?)\*\*|\*(.+?)\*|([^*]+))/g
  let match
  let key = 0
  while ((match = regex.exec(text)) !== null) {
    if (match[2]) parts.push(<strong key={key++}>{match[2]}</strong>)
    else if (match[3]) parts.push(<em key={key++} className="text-gray-500 italic">{match[3]}</em>)
    else if (match[4]) parts.push(<span key={key++}>{match[4]}</span>)
  }
  return parts.length > 0 ? parts : text
}

function MarkdownContent({ content }: { content: string }) {
  const lines = content.split('\n')
  const elements: React.ReactNode[] = []
  const buffer: string[] = []
  let key = 0

  function flush() {
    if (buffer.length === 0) return
    const text = buffer.join(' ').trim()
    if (text) {
      elements.push(
        <p key={key++} className="text-gray-700 leading-relaxed mb-4 text-base">
          {renderInline(text)}
        </p>
      )
    }
    buffer.length = 0
  }

  for (const line of lines) {
    const t = line.trim()
    if (t.startsWith('# ')) {
      flush()
      elements.push(
        <h1 key={key++} className="text-3xl font-bold text-navy-900 mt-10 mb-4 first:mt-0">
          {t.slice(2)}
        </h1>
      )
    } else if (t.startsWith('## ')) {
      flush()
      elements.push(
        <h2 key={key++} className="text-xl font-bold text-navy-800 mt-10 mb-3 pb-2 border-b-2 border-gold-500/30">
          {t.slice(3)}
        </h2>
      )
    } else if (t.startsWith('### ')) {
      flush()
      elements.push(
        <h3 key={key++} className="text-base font-bold text-navy-700 mt-6 mb-2 uppercase tracking-wide text-sm">
          {t.slice(4)}
        </h3>
      )
    } else if (t === '---') {
      flush()
      elements.push(<hr key={key++} className="border-gray-200 my-8" />)
    } else if (t === '') {
      flush()
    } else {
      buffer.push(t)
    }
  }
  flush()

  return <div className="blueprint-content">{elements}</div>
}

export default function BlueprintPage() {
  const router = useRouter()
  const [content, setContent] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [userName, setUserName] = useState('')

  useEffect(() => { loadData() }, [])

  async function loadData() {
    try {
      const [meRes, docRes] = await Promise.all([
        fetch('/api/auth/me'),
        fetch('/api/documents/blueprint'),
      ])
      const meData = await meRes.json()
      if (meData.user) setUserName(meData.user.name.split(' ')[0])

      if (docRes.ok) {
        const docData = await docRes.json()
        setContent(docData.content)
      } else {
        router.push('/metodo')
      }
    } catch {
      router.push('/metodo')
    } finally {
      setIsLoading(false)
    }
  }

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/')
  }

  function handlePrint() {
    window.print()
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-gray-400 text-sm">Carregando Blueprint...</div>
      </div>
    )
  }

  return (
    <>
      {/* Print styles */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .print-container { max-width: 100% !important; padding: 0 !important; }
          body { background: white !important; }
          header { display: none !important; }
          .action-bar { display: none !important; }
        }
      `}</style>

      <div className="min-h-screen bg-slate-50">
        {/* Header */}
        <header className="no-print bg-white border-b border-gray-100 sticky top-0 z-10">
          <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-navy-700 rounded-md flex items-center justify-center font-bold text-white text-xs">MS</div>
              <span className="font-bold text-navy-900 text-sm hidden sm:block">Método Stack</span>
            </div>
            <div className="flex items-center gap-3">
              {userName && <span className="text-sm text-gray-500 hidden sm:block">Olá, {userName}</span>}
              <Link href="/metodo" className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
                ← Editar respostas
              </Link>
              <button onClick={handleLogout} className="text-xs text-gray-400 hover:text-gray-600 transition-colors ml-2">
                Sair
              </button>
            </div>
          </div>
        </header>

        {/* Document */}
        <main className="max-w-3xl mx-auto px-4 py-10 print-container">
          {/* Document header */}
          <div className="no-print text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-navy-700 text-white text-xs font-bold px-3 py-1.5 rounded-full mb-4 uppercase tracking-wider">
              Blueprint Gerado
            </div>
            <p className="text-gray-500 text-sm">
              Seu projeto completo de comunidade. Leia com calma e guarde.
            </p>
          </div>

          {/* Content card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-8 py-10 mb-8">
            {content && <MarkdownContent content={content} />}
          </div>

          {/* Action bar */}
          <div className="action-bar no-print bg-white rounded-2xl border border-gray-100 p-6 mb-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <p className="font-semibold text-navy-900 text-sm">Exportar este Blueprint</p>
                <p className="text-xs text-gray-500 mt-0.5">Salve uma cópia para usar fora da plataforma.</p>
              </div>
              <div className="flex gap-3 flex-wrap justify-center">
                <button
                  onClick={handlePrint}
                  className="btn-secondary text-sm px-4 py-2 flex items-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                  </svg>
                  Salvar como PDF
                </button>
              </div>
            </div>
          </div>

          {/* Continue CTA */}
          <div className="no-print bg-navy-900 rounded-2xl p-8 text-center text-white">
            <div className="text-gold-400 text-3xl mb-3">→</div>
            <h3 className="text-xl font-bold mb-2">Pronto para o próximo passo?</h3>
            <p className="text-white/60 text-sm mb-6">
              O Plano de Ação vai transformar seu Blueprint em uma estratégia de lançamento com cronograma semana a semana.
            </p>
            <Link
              href="/plano"
              className="inline-flex items-center gap-2 bg-gold-500 hover:bg-gold-600 text-navy-900 font-bold px-8 py-3 rounded-xl transition-all hover:scale-105"
            >
              Continuar para o Plano de Ação →
            </Link>
          </div>
        </main>
      </div>
    </>
  )
}
