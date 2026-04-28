import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import prisma from '@/lib/db'
import { verifyToken, COOKIE_NAME } from '@/lib/auth'
import { PILARES, ACTION_PLAN_QUESTIONS } from '@/data/questions'

export const maxDuration = 300

async function getUserId(req: NextRequest): Promise<number | null> {
  const token = req.cookies.get(COOKIE_NAME)?.value
  if (!token) return null
  const payload = await verifyToken(token)
  return payload?.userId ?? null
}

function buildFullContext(
  stackAnswers: Record<string, string>,
  planAnswers: Record<string, string>
): string {
  let context = '=== RESPOSTAS DO MÉTODO STACK ===\n'
  for (const pilar of PILARES) {
    context += `\n--- PILAR ${pilar.number} — ${pilar.name} ---\n`
    for (const etapa of pilar.etapas) {
      context += `\nEtapa ${etapa.number} — ${etapa.name}:\n`
      for (const q of etapa.questions) {
        context += `P: ${q.text}\nR: ${stackAnswers[q.id] || '(não respondida)'}\n\n`
      }
    }
  }
  context += '\n=== RESPOSTAS DO PLANO DE AÇÃO ===\n'
  for (const q of ACTION_PLAN_QUESTIONS) {
    context += `\nP: ${q.text}\nR: ${planAnswers[q.id] || '(não respondida)'}\n`
  }
  return context
}

const ACTION_PLAN_PROMPT = `Você é um(a) estrategista especializado(a) em lançamento de comunidades. Com base nas respostas do Método Stack e do Plano de Ação, gere um plano completo, personalizado e acionável.

Use formatação markdown com # para títulos e ## para seções.

Estrutura obrigatória:

# Plano de Ação — [nome da comunidade]

## 1. Resumo da Comunidade
[Síntese em um parágrafo.]

---

## 2. Identidade Visual
[Orientações práticas. Ferramentas adequadas ao orçamento informado.]

---

## 3. Plataforma e Configuração
[Passo a passo para configurar o ambiente antes do lançamento.]

---

## 4. Materiais de Lançamento
[Lista de tudo que precisa ser criado antes de lançar.]

---

## 5. Estratégia dos Primeiros Membros
[Como abordar as primeiras pessoas com base na audiência atual.]

---

## 6. Cronograma de Lançamento
[Semana a semana até o dia do lançamento, baseado na data informada.]

---

## 7. Roteiro do Dia do Lançamento
[O que fazer no dia exato.]

---

## 8. Primeiros 90 Dias
[Calendário de atividades para os três primeiros meses.]

---

## 9. Métricas para Acompanhar
[4 indicadores semanais com como medir e o que fazer se não estiver bem.]

---

## 10. Próximos Passos
[Máximo 5 ações para as próximas 48 horas. Concretas e simples.]

---

Instruções: Use o nome da comunidade. Se orçamento for zero: apenas ferramentas gratuitas. Adapte ao tempo disponível por semana. Tom motivador, direto, prático. O cliente deve terminar sabendo exatamente o que fazer.`

export async function POST(req: NextRequest) {
  const userId = await getUserId(req)
  if (!userId) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const blueprintDoc = await prisma.document.findUnique({
    where: { userId_type: { userId, type: 'blueprint' } },
  })
  if (!blueprintDoc) {
    return NextResponse.json({ error: 'Gere o Blueprint primeiro.' }, { status: 400 })
  }

  const stackRows = await prisma.response.findMany({ where: { userId } })
  const stackAnswers: Record<string, string> = {}
  for (const row of stackRows) stackAnswers[row.questionId] = row.answer

  const { planAnswers } = await req.json() as { planAnswers: Record<string, string> }

  const unanswered = ACTION_PLAN_QUESTIONS.filter((q) => !planAnswers[q.id]?.trim())
  if (unanswered.length > 0) {
    return NextResponse.json({ error: `Ainda há ${unanswered.length} pergunta(s) sem resposta.` }, { status: 400 })
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey || apiKey.includes('SUBSTITUA')) {
    return NextResponse.json(
      { error: 'Chave da API da Anthropic não configurada. Abra o arquivo .env.local e adicione sua chave ANTHROPIC_API_KEY.' },
      { status: 500 }
    )
  }

  try {
    const client = new Anthropic({ apiKey })
    const fullContext = buildFullContext(stackAnswers, planAnswers)

    const message = await client.messages.create({
      model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-5',
      max_tokens: 8192,
      system: ACTION_PLAN_PROMPT,
      messages: [
        {
          role: 'user',
          content: `Respostas completas:\n\n${fullContext}\n\nGere o Plano de Ação completo.`,
        },
      ],
    })

    const content = (message.content[0] as { type: string; text: string }).text

    await prisma.document.upsert({
      where: { userId_type: { userId, type: 'action-plan' } },
      update: { content },
      create: { userId, type: 'action-plan', content },
    })

    return NextResponse.json({ ok: true })
  } catch (err: unknown) {
    console.error('Anthropic error:', err)
    const message = err instanceof Error ? err.message : 'Erro ao chamar a API da Anthropic.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
