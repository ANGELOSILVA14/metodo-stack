'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ACTION_PLAN_QUESTIONS } from '@/data/questions'

// ---- Renderizador de markdown ----
function renderInline(text: string): React.ReactNode {
  const parts: React.ReactNode[] = []
  const regex = /(\*\*(.+?)\*\*|\*(.+?)\*|([^*]+))/g
  let match; let key = 0
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
    if (!buffer.length) return
    const text = buffer.join(' ').trim()
    if (text) elements.push(
      <p key={key++} className="text-gray-700 leading-relaxed mb-4 text-base">{renderInline(text)}</p>
    )
    buffer.length = 0
  }

  for (const line of lines) {
    const t = line.trim()
    if (t.startsWith('# ')) {
      flush()
      elements.push(<h1 key={key++} className="text-3xl font-bold text-navy-900 mt-10 mb-4 first:mt-0">{t.slice(2)}</h1>)
    } else if (t.startsWith('## ')) {
      flush()
      elements.push(<h2 key={key++} className="text-xl font-bold text-navy-800 mt-10 mb-3 pb-2 border-b-2 border-gold-500/30">{t.slice(3)}</h2>)
    } else if (t.startsWith('### ')) {
      flush()
      elements.push(<h3 key={key++} className="text-base font-bold text-navy-700 mt-6 mb-2 uppercase tracking-wide text-sm">{t.slice(4)}</h3>)
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
  return <div>{elements}</div>
}

function GeneratingModal() {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-10 max-w-sm w-full mx-4 text-center shadow-2xl">
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-navy-700/10 flex items-center justify-center">
          <svg className="animate-spin w-8 h-8 text-navy-700" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-navy-900 mb-2">Gerando seu Plano de Ação...</h3>
        <p className="text-sm text-gray-500">A IA está criando um plano personalizado. Isso pode levar até 1 minuto.</p>
      </div>
    </div>
  )
}

type PagePhase = 'loading' | 'form' | 'generating' | 'result'

export default function PlanoPage() {
  const router = useRouter()
  const [phase, setPhase] = useState<PagePhase>('loading')
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [content, setContent] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [userName, setUserName] = useState('')
  const [isDownloading, setIsDownloading] = useState(false)

  useEffect(() => { loadData() }, [])

  async function loadData() {
    try {
      const [meRes, docRes] = await Promise.all([
        fetch('/api/auth/me'),
        fetch('/api/documents/action-plan'),
      ])
      const meData = await meRes.json()
      if (meData.user) setUserName(meData.user.name.split(' ')[0])

      if (docRes.ok) {
        const docData = await docRes.json()
        if (docData.exists) {
          setContent(docData.content)
          setPhase('result')
          return
        }
      }
      setPhase('form')
    } catch {
      setPhase('form')
    }
  }

  function handleAnswer(qid: string, value: string) {
    setAnswers((prev) => ({ ...prev, [qid]: value }))
  }

  const allAnswered = ACTION_PLAN_QUESTIONS.every((q) => answers[q.id]?.trim())

  async function handleGenerate() {
    setError('')
    setPhase('generating')

    try {
      const res = await fetch('/api/generate/action-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planAnswers: answers }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Erro ao gerar o Plano de Ação.')
        setPhase('form')
        return
      }

      // Load the generated content
      const docRes = await fetch('/api/documents/action-plan')
      const docData = await docRes.json()
      setContent(docData.content)
      setPhase('result')
    } catch {
      setError('Erro de conexão. Verifique sua chave da Anthropic no arquivo .env.local e tente novamente.')
      setPhase('form')
    }
  }

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/')
  }

  function handlePrint() { window.print() }

  async function handleDownloadWord() {
    setIsDownloading(true)
    try {
      const res = await fetch('/api/download/action-plan')
      if (!res.ok) throw new Error('Erro ao baixar')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'plano-de-acao.docx'
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      alert('Erro ao baixar. Tente novamente.')
    } finally {
      setIsDownloading(false)
    }
  }

  // ---- LOADING ----
  if (phase === 'loading') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-gray-400 text-sm">Carregando...</div>
      </div>
    )
  }

  return (
    <>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
          header { display: none !important; }
        }
      `}</style>

      <div className="min-h-screen bg-slate-50">
        {phase === 'generating' && <GeneratingModal />}

        {/* Header */}
        <header className="no-print bg-white border-b border-gray-100 sticky top-0 z-10">
          <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-navy-700 rounded-md flex items-center justify-center font-bold text-white text-xs">MS</div>
              <span className="font-bold text-navy-900 text-sm hidden sm:block">Método Stack</span>
            </div>
            <div className="flex items-center gap-3">
              {userName && <span className="text-sm text-gray-500 hidden sm:block">Olá, {userName}</span>}
              <Link href="/resultado/blueprint" className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
                ← Blueprint
              </Link>
              <button onClick={handleLogout} className="text-xs text-gray-400 hover:text-gray-600 transition-colors ml-2">Sair</button>
            </div>
          </div>
        </header>

        <main className="max-w-3xl mx-auto px-4 py-10">

          {/* ---- FORM ---- */}
          {(phase === 'form' || phase === 'generating') && (
            <div className="animate-slide-up">
              <div className="text-center mb-10">
                <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-gold-500/10 flex items-center justify-center text-2xl">🎉</div>
                <h1 className="text-3xl font-bold text-navy-900 mb-3">
                  Parabéns. Você acabou de construir o projeto completo da sua comunidade.
                </h1>
                <p className="text-gray-600 leading-relaxed max-w-xl mx-auto text-sm">
                  Agora é hora de transformar tudo isso em realidade. Responda com honestidade. Quanto mais preciso(a) você for, mais útil e aplicável será o plano.
                </p>
              </div>

              <div className="no-print mb-6">
                <Link href="/resultado/blueprint" className="inline-flex items-center gap-2 text-sm text-navy-700 font-semibold hover:underline">
                  ← Ver Blueprint gerado
                </Link>
              </div>

              <div className="space-y-6 mb-8">
                {ACTION_PLAN_QUESTIONS.map((q) => {
                  const answered = !!answers[q.id]?.trim()
                  return (
                    <div key={q.id} className="card">
                      <div className="flex items-start gap-3 mb-4">
                        <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 transition-colors ${answered ? 'bg-navy-700 text-white' : 'bg-gray-100 text-gray-400'}`}>
                          {answered ? '✓' : q.number}
                        </span>
                        <label className="text-base font-semibold text-navy-900 leading-snug">{q.text}</label>
                      </div>
                      <textarea
                        value={answers[q.id] || ''}
                        onChange={(e) => handleAnswer(q.id, e.target.value)}
                        placeholder="Escreva sua resposta aqui..."
                        rows={3}
                        className="textarea-field"
                      />
                      <p className="text-xs text-gray-400 mt-3 leading-relaxed">{q.support}</p>
                    </div>
                  )
                })}
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700 mb-6">
                  <strong>Erro:</strong> {error}
                </div>
              )}

              <button
                onClick={handleGenerate}
                disabled={!allAnswered || phase === 'generating'}
                className="btn-gold w-full text-center text-base py-4"
              >
                {phase === 'generating' ? 'Gerando...' : 'Gerar Plano de Ação →'}
              </button>

              {!allAnswered && (
                <p className="text-center text-xs text-gray-400 mt-3">
                  Responda todas as {ACTION_PLAN_QUESTIONS.length} perguntas para gerar o plano.
                </p>
              )}
            </div>
          )}

          {/* ---- RESULT ---- */}
          {phase === 'result' && content && (
            <div className="animate-slide-up">
              <div className="no-print text-center mb-10">
                <div className="inline-flex items-center gap-2 bg-navy-700 text-white text-xs font-bold px-3 py-1.5 rounded-full mb-4 uppercase tracking-wider">
                  Plano de Ação Gerado
                </div>
                <p className="text-gray-500 text-sm">Seu cronograma personalizado de lançamento, pronto para executar.</p>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-8 py-10 mb-8">
                <MarkdownContent content={content} />
              </div>

              {/* Export bar */}
              <div className="no-print bg-white rounded-2xl border border-gray-100 p-6 mb-6">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold text-navy-900 text-sm">Exportar este Plano de Ação</p>
                    <p className="text-xs text-gray-500 mt-0.5">Salve uma cópia para usar fora da plataforma.</p>
                  </div>
                  <div className="flex gap-3 flex-wrap justify-center">
                    <button onClick={handlePrint} className="btn-secondary text-sm px-4 py-2 flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0 1 10.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0 .229 2.523a1.125 1.125 0 0 1-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0 0 21 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 0 0-1.913-.247M6.34 18H5.25A2.25 2.25 0 0 1 3 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.056 48.056 0 0 1 1.913-.247m10.5 0a48.536 48.536 0 0 0-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5Zm-3 0h.008v.008H15V10.5Z" />
                      </svg>
                      Salvar como PDF
                    </button>
                    <button onClick={handleDownloadWord} disabled={isDownloading} className="btn-secondary text-sm px-4 py-2 flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                      </svg>
                      {isDownloading ? 'Baixando...' : 'Baixar em Word'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Regenerate option */}
              <div className="no-print text-center">
                <button
                  onClick={() => { setContent(null); setAnswers({}); setPhase('form') }}
                  className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
                >
                  Refazer o Plano de Ação com novas respostas
                </button>
              </div>
            </div>
          )}
        </main>

        <footer className="no-print border-t border-gray-100 py-6 text-center text-gray-400 text-xs">
          Método Stack · @angelosilva.co
        </footer>
      </div>
    </>
  )
}
