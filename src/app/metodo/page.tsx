'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  PILARES, ALL_QUESTION_IDS, TOTAL_QUESTIONS,
  ACTION_PLAN_QUESTIONS, ALL_IDS_COMBINED, TOTAL_COMBINED,
  type Etapa, type Pilar,
} from '@/data/questions'

type Phase = 'intro' | 'pilar-intro' | 'etapa' | 'action-intro' | 'action' | 'done'

const ETAPAS_FLAT: Array<{ etapa: Etapa; pilar: Pilar }> = PILARES.flatMap((pilar) =>
  pilar.etapas.map((etapa) => ({ etapa, pilar }))
)

function ProgressBar({ answered, total }: { answered: number; total: number }) {
  const pct = Math.round((answered / total) * 100)
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
        <div className="h-2 bg-navy-700 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-semibold text-gray-500 whitespace-nowrap">{answered}/{total}</span>
    </div>
  )
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
        <h3 className="text-lg font-bold text-navy-900 mb-2">Gerando seu documento completo...</h3>
        <p className="text-sm text-gray-500 mb-1">Blueprint · Plano de Ação · Checklist de 30 dias</p>
        <p className="text-xs text-gray-400">Isso pode levar até 5 minutos.</p>
      </div>
    </div>
  )
}

export default function MetodoPage() {
  const router = useRouter()
  const [phase, setPhase] = useState<Phase>('intro')
  const [etapaIndex, setEtapaIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generateError, setGenerateError] = useState('')
  const [userName, setUserName] = useState('')
  const saveTimeout = useRef<ReturnType<typeof setTimeout>>()
  const pendingSaves = useRef<Record<string, string>>({})

  useEffect(() => { loadData() }, [])

  async function loadData() {
    try {
      const [meRes, answersRes] = await Promise.all([fetch('/api/auth/me'), fetch('/api/responses')])
      const meData = await meRes.json()
      const answersData = await answersRes.json()
      if (meData.user) setUserName(meData.user.name.split(' ')[0])
      if (answersData.answers) setAnswers(answersData.answers)
    } catch { /* silently fail */ }
    finally { setIsLoading(false) }
  }

  const scheduleSave = useCallback((qid: string, value: string) => {
    pendingSaves.current[qid] = value
    clearTimeout(saveTimeout.current)
    saveTimeout.current = setTimeout(async () => {
      const toSave = { ...pendingSaves.current }
      pendingSaves.current = {}
      try {
        await fetch('/api/responses', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ answers: toSave }),
        })
      } catch { /* silently fail */ }
    }, 800)
  }, [])

  function handleAnswer(qid: string, value: string) {
    setAnswers((prev) => ({ ...prev, [qid]: value }))
    scheduleSave(qid, value)
  }

  const answeredBlueprint = ALL_QUESTION_IDS.filter((id) => answers[id]?.trim()).length
  const answeredAction = ACTION_PLAN_QUESTIONS.filter((q) => answers[q.id]?.trim()).length
  const answeredTotal = answeredBlueprint + answeredAction
  const allAnswered = answeredTotal === TOTAL_COMBINED

  const currentItem = ETAPAS_FLAT[etapaIndex]

  function getNextLabel(): string {
    if (etapaIndex >= ETAPAS_FLAT.length - 1) return 'Próximo: Plano de Ação →'
    const next = ETAPAS_FLAT[etapaIndex + 1]
    const cur = ETAPAS_FLAT[etapaIndex]
    if (next.pilar.number !== cur.pilar.number) return `Próximo: Pilar ${next.pilar.number}: ${next.pilar.name} →`
    return `Próxima: ${next.etapa.name} →`
  }

  function goNext() {
    if (etapaIndex >= ETAPAS_FLAT.length - 1) {
      setPhase('action-intro')
      return
    }
    const nextIndex = etapaIndex + 1
    const nextPilar = ETAPAS_FLAT[nextIndex].pilar
    const curPilar = ETAPAS_FLAT[etapaIndex].pilar
    setEtapaIndex(nextIndex)
    setPhase(nextPilar.number !== curPilar.number ? 'pilar-intro' : 'etapa')
  }

  function goPrev() {
    if (phase === 'done') { setPhase('action'); return }
    if (phase === 'action') { setPhase('action-intro'); return }
    if (phase === 'action-intro') { setEtapaIndex(ETAPAS_FLAT.length - 1); setPhase('etapa'); return }
    if (phase === 'done') { setPhase('etapa'); return }
    if (etapaIndex === 0 && phase === 'etapa') { setPhase('pilar-intro'); return }
    if (phase === 'pilar-intro') {
      if (etapaIndex === 0) { setPhase('intro') }
      else { setEtapaIndex(etapaIndex - 1); setPhase('etapa') }
      return
    }
    if (etapaIndex > 0) {
      const prevIndex = etapaIndex - 1
      const prevPilar = ETAPAS_FLAT[prevIndex].pilar
      const curPilar = ETAPAS_FLAT[etapaIndex].pilar
      setEtapaIndex(prevIndex)
      setPhase(prevPilar.number !== curPilar.number ? 'pilar-intro' : 'etapa')
    }
  }

  async function handleGenerate() {
    setGenerateError('')
    setIsGenerating(true)

    if (Object.keys(pendingSaves.current).length > 0) {
      try {
        await fetch('/api/responses', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ answers: pendingSaves.current }),
        })
        pendingSaves.current = {}
      } catch { /* silently fail */ }
    }

    try {
      const res = await fetch('/api/generate/complete', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) {
        setGenerateError(data.error || 'Erro ao gerar o documento.')
        setIsGenerating(false)
        return
      }
      router.push('/resultado')
    } catch {
      setGenerateError('Erro de conexão. Verifique sua chave da Anthropic no arquivo .env.local e tente novamente.')
      setIsGenerating(false)
    }
  }

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/')
  }

  if (isLoading) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center"><div className="text-gray-400 text-sm">Carregando...</div></div>
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {isGenerating && <GeneratingModal />}

      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-navy-700 rounded-md flex items-center justify-center font-bold text-white text-xs">MS</div>
            <span className="font-bold text-navy-900 text-sm hidden sm:block">Método Stack</span>
          </div>
          <div className="flex-1 max-w-xs mx-6 hidden sm:block">
            <ProgressBar answered={answeredTotal} total={TOTAL_COMBINED} />
          </div>
          <div className="flex items-center gap-3">
            {userName && <span className="text-sm text-gray-500 hidden sm:block">Olá, {userName}</span>}
            <button onClick={handleLogout} className="text-xs text-gray-400 hover:text-gray-600 transition-colors">Sair</button>
          </div>
        </div>
        <div className="sm:hidden px-4 pb-2">
          <ProgressBar answered={answeredTotal} total={TOTAL_COMBINED} />
        </div>
      </header>

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-10">

        {/* ---- INTRO ---- */}
        {phase === 'intro' && (
          <div className="animate-slide-up">
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 bg-navy-100 text-navy-700 text-xs font-semibold px-3 py-1 rounded-full mb-4">Método Stack</div>
              <h1 className="text-4xl font-bold text-navy-900 mb-4 leading-tight">
                Você está prestes a construir algo que poucas marcas sabem fazer de verdade.
              </h1>
            </div>
            <div className="card space-y-4 text-gray-700 leading-relaxed text-base mb-8">
              <p>Não um grupo. Não uma audiência. <strong>Uma comunidade.</strong></p>
              <p>A diferença é simples: audiência consome o que você produz. Comunidade constrói junto com você. Audiência some quando você para de postar. Comunidade continua existindo porque as pessoas se importam umas com as outras, não só com você.</p>
              <p>As marcas mais poderosas do mundo entenderam isso. Harley-Davidson salvou sua empresa criando uma comunidade quando estava à beira da falência. O Nubank cresceu porque seus clientes criaram grupos espontâneos para defender a marca.</p>
              <p><strong>Comunidade não é tendência. É vantagem competitiva.</strong></p>
            </div>
            <div className="card mb-8">
              <h2 className="font-bold text-navy-900 mb-3 text-lg">O que você vai receber</h2>
              <div className="space-y-3">
                {[
                  { n: '1', text: '30 perguntas estratégicas em 3 Pilares e 10 Etapas: o Blueprint da sua comunidade' },
                  { n: '2', text: '7 perguntas de contexto para o Plano de Ação personalizado' },
                  { n: '3', text: 'Um documento completo com Blueprint + Plano de Ação + Checklist de 30 dias' },
                  { n: '4', text: 'Exportar o documento em PDF' },
                ].map((s) => (
                  <div key={s.n} className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-navy-700 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">{s.n}</span>
                    <p className="text-sm text-gray-700">{s.text}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800 mb-8">
              Suas respostas são salvas automaticamente. Você pode fechar e voltar quando quiser.
            </div>
            <button onClick={() => setPhase('pilar-intro')} className="btn-primary w-full text-center text-base py-4">
              Começar o Método Stack →
            </button>
          </div>
        )}

        {/* ---- PILAR INTRO ---- */}
        {phase === 'pilar-intro' && currentItem && (
          <div className="animate-slide-up">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 bg-gold-500/10 text-gold-600 text-xs font-bold px-3 py-1 rounded-full mb-4 uppercase tracking-wider">
                Pilar {currentItem.pilar.number} de 3
              </div>
              <h1 className="text-4xl font-bold text-navy-900 mb-1">{currentItem.pilar.name}</h1>
              <p className="text-gold-600 font-medium">{currentItem.pilar.subtitle}</p>
            </div>
            <div className="card mb-8">
              {currentItem.pilar.intro.split('\n\n').map((para, i) => (
                <p key={i} className="text-gray-700 leading-relaxed text-base mb-4 last:mb-0">{para}</p>
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={goPrev} className="btn-secondary">← Voltar</button>
              <button onClick={() => setPhase('etapa')} className="btn-primary flex-1 text-center">
                Começar: {currentItem.etapa.name} →
              </button>
            </div>
          </div>
        )}

        {/* ---- ETAPA QUESTIONS ---- */}
        {phase === 'etapa' && currentItem && (
          <div className="animate-slide-up">
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-bold text-gold-600 uppercase tracking-wider">
                  Pilar {currentItem.pilar.number}: {currentItem.pilar.name}
                </span>
                <span className="text-gray-300">·</span>
                <span className="text-xs text-gray-400">Etapa {currentItem.etapa.number}/10</span>
              </div>
              <h2 className="text-3xl font-bold text-navy-900 mb-3">Etapa {currentItem.etapa.number}: {currentItem.etapa.name}</h2>
              <div className="bg-white rounded-xl border border-gray-100 p-5">
                {currentItem.etapa.description.split('\n\n').map((para, i) => (
                  <p key={i} className="text-gray-600 text-sm leading-relaxed mb-3 last:mb-0">{para}</p>
                ))}
              </div>
            </div>
            <div className="space-y-6 mb-8">
              {currentItem.etapa.questions.map((q, i) => {
                const answered = !!answers[q.id]?.trim()
                return (
                  <div key={q.id} className="card">
                    <div className="flex items-start gap-3 mb-4">
                      <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 transition-colors ${answered ? 'bg-navy-700 text-white' : 'bg-gray-100 text-gray-400'}`}>
                        {answered ? '✓' : i + 1}
                      </span>
                      <label className="text-base font-semibold text-navy-900 leading-snug">{q.text}</label>
                    </div>
                    <textarea
                      value={answers[q.id] || ''}
                      onChange={(e) => handleAnswer(q.id, e.target.value)}
                      placeholder="Escreva sua resposta aqui..."
                      rows={4}
                      className="textarea-field"
                    />
                    <p className="text-xs text-gray-400 mt-3 leading-relaxed">{q.support}</p>
                  </div>
                )
              })}
            </div>
            <div className="flex gap-3">
              <button onClick={goPrev} className="btn-secondary">← Voltar</button>
              <button onClick={goNext} className="btn-primary flex-1 text-center">{getNextLabel()}</button>
            </div>
          </div>
        )}

        {/* ---- ACTION PLAN INTRO ---- */}
        {phase === 'action-intro' && (
          <div className="animate-slide-up">
            <div className="text-center mb-8">
              <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-green-500/10 flex items-center justify-center">
                <svg className="w-7 h-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
              </div>
              <div className="inline-flex items-center gap-2 bg-gold-500/10 text-gold-600 text-xs font-bold px-3 py-1 rounded-full mb-4 uppercase tracking-wider">
                Método Stack: Parte 2
              </div>
              <h1 className="text-4xl font-bold text-navy-900 mb-3">Plano de Ação</h1>
              <p className="text-gold-600 font-medium">Como lançar sua comunidade</p>
            </div>
            <div className="card mb-8">
              <p className="text-gray-700 leading-relaxed mb-4">
                Você acabou de definir tudo o que sua comunidade é. Agora é hora de definir como e quando ela vai ao ar.
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                Estas 7 perguntas vão personalizar o seu Plano de Ação com base na sua realidade atual: audiência, tempo disponível, orçamento e meta de lançamento.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Ao final, você vai gerar um único documento com o Blueprint completo, o Plano de Ação e o Checklist dos primeiros 30 dias.
              </p>
            </div>
            <div className="flex gap-3">
              <button onClick={goPrev} className="btn-secondary">← Voltar</button>
              <button onClick={() => setPhase('action')} className="btn-primary flex-1 text-center">
                Começar as 7 perguntas →
              </button>
            </div>
          </div>
        )}

        {/* ---- ACTION PLAN QUESTIONS ---- */}
        {phase === 'action' && (
          <div className="animate-slide-up">
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-bold text-gold-600 uppercase tracking-wider">Plano de Ação</span>
                <span className="text-gray-300">·</span>
                <span className="text-xs text-gray-400">7 perguntas</span>
              </div>
              <h2 className="text-3xl font-bold text-navy-900 mb-3">Contexto de Lançamento</h2>
              <div className="bg-white rounded-xl border border-gray-100 p-5">
                <p className="text-gray-600 text-sm leading-relaxed">
                  Responda com honestidade. Quanto mais preciso(a) você for, mais útil e aplicável será o plano que vai receber.
                </p>
              </div>
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
            <div className="flex gap-3">
              <button onClick={goPrev} className="btn-secondary">← Voltar</button>
              <button onClick={() => setPhase('done')} className="btn-primary flex-1 text-center">
                Ver resumo final →
              </button>
            </div>
          </div>
        )}

        {/* ---- DONE / SUBMIT ---- */}
        {phase === 'done' && (
          <div className="animate-slide-up">
            <div className="text-center mb-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-navy-700/10 flex items-center justify-center">
                <svg className="w-8 h-8 text-navy-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-navy-900 mb-2">Tudo pronto para gerar!</h1>
              <p className="text-gray-600">{answeredTotal}/{TOTAL_COMBINED} perguntas respondidas</p>
            </div>

            {/* Blueprint status */}
            <div className="grid gap-3 mb-4">
              {PILARES.map((pilar) => {
                const ids = pilar.etapas.flatMap((e) => e.questions.map((q) => q.id))
                const done = ids.filter((id) => answers[id]?.trim()).length
                const complete = done === ids.length
                return (
                  <div key={pilar.number} className={`card flex items-center justify-between py-4 ${!complete ? 'border-amber-300' : ''}`}>
                    <div>
                      <div className="text-xs font-bold text-gold-600 uppercase tracking-wider mb-0.5">Pilar {pilar.number}: Blueprint</div>
                      <div className="font-semibold text-navy-900 text-sm">{pilar.name}</div>
                    </div>
                    <div className={`text-sm font-bold ${complete ? 'text-green-600' : 'text-amber-600'}`}>
                      {complete ? '✓ Completo' : `${done}/${ids.length}`}
                    </div>
                  </div>
                )
              })}
              {/* Action plan status */}
              <div className={`card flex items-center justify-between py-4 ${answeredAction < 7 ? 'border-amber-300' : ''}`}>
                <div>
                  <div className="text-xs font-bold text-gold-600 uppercase tracking-wider mb-0.5">Plano de Ação</div>
                  <div className="font-semibold text-navy-900 text-sm">7 perguntas de contexto</div>
                </div>
                <div className={`text-sm font-bold ${answeredAction === 7 ? 'text-green-600' : 'text-amber-600'}`}>
                  {answeredAction === 7 ? '✓ Completo' : `${answeredAction}/7`}
                </div>
              </div>
            </div>

            {/* What will be generated */}
            <div className="bg-navy-900 text-white rounded-2xl p-6 mb-6">
              <p className="text-xs font-bold text-gold-400 uppercase tracking-wider mb-3">O que será gerado</p>
              <div className="space-y-2">
                {['Parte 1: Blueprint da Comunidade (10 etapas)', 'Parte 2: Plano de Ação (cronograma de lançamento)', 'Parte 3: Checklist dos Primeiros 30 Dias (bônus)'].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-white/80">
                    <span className="text-gold-400">✓</span> {item}
                  </div>
                ))}
              </div>
            </div>

            {!allAnswered && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800 mb-6">
                Ainda há {TOTAL_COMBINED - answeredTotal} pergunta(s) sem resposta. Volte e complete todas para gerar o documento.
              </div>
            )}

            {generateError && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700 mb-6">
                <strong>Erro:</strong> {generateError}
              </div>
            )}

            <div className="flex gap-3">
              <button onClick={goPrev} className="btn-secondary">← Revisar</button>
              <button
                onClick={handleGenerate}
                disabled={!allAnswered || isGenerating}
                className="btn-gold flex-1 text-center text-base py-4"
              >
                {isGenerating ? 'Gerando...' : 'Gerar Documento Completo →'}
              </button>
            </div>
            {!allAnswered && (
              <p className="text-center text-xs text-gray-400 mt-3">
                O botão será liberado quando todas as {TOTAL_COMBINED} perguntas estiverem respondidas.
              </p>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
