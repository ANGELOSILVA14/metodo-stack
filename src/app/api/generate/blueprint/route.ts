import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import prisma from '@/lib/db'
import { verifyToken, COOKIE_NAME } from '@/lib/auth'
import { PILARES, ALL_QUESTION_IDS } from '@/data/questions'

export const maxDuration = 300

async function getUserId(req: NextRequest): Promise<number | null> {
  const token = req.cookies.get(COOKIE_NAME)?.value
  if (!token) return null
  const payload = await verifyToken(token)
  return payload?.userId ?? null
}

function buildAnswerContext(answers: Record<string, string>): string {
  let context = ''
  for (const pilar of PILARES) {
    context += `\n\n=== PILAR ${pilar.number} — ${pilar.name.toUpperCase()} ===\n`
    for (const etapa of pilar.etapas) {
      context += `\n--- Etapa ${etapa.number} — ${etapa.name} ---\n`
      for (const q of etapa.questions) {
        context += `\nPergunta: ${q.text}\nResposta: ${answers[q.id] || '(não respondida)'}\n`
      }
    }
  }
  return context
}

const BLUEPRINT_PROMPT = `Você é um(a) estrategista especializado(a) em comunidades. Com base nas respostas do cliente ao Método Stack, gere o Blueprint oficial da comunidade dele(a).

O Blueprint é um documento profissional que apresenta o projeto completo da comunidade. Ele deve ser escrito em linguagem fluida, inspiradora e profissional — nunca no formato de pergunta e resposta. Nunca use bullet points. Escreva sempre em texto corrido.

Use formatação markdown com # para títulos principais, ## para subtítulos de pilar, ### para subtítulos de etapa.

Siga obrigatoriamente essa estrutura:

# Blueprint da Comunidade — [nome da comunidade]

## Apresentação

[Um parágrafo que apresenta a comunidade como descrição oficial. Use o nome, propósito e identidade definidos.]

---

## Pilar 1 — Essência

### Etapa 1 — Propósito
[Texto corrido apresentando propósito, problema que resolve e transformação que gera.]

### Etapa 2 — Tribo
[Texto corrido descrevendo quem são os membros, o que os une e o perfil ideal.]

### Etapa 3 — Marca
[Texto corrido apresentando nome, como se chamam, tom e linguagem do grupo.]

---

## Pilar 2 — Movimento

### Etapa 4 — Porta de Entrada
[Texto corrido sobre acesso, boas-vindas e primeiros passos.]

### Etapa 5 — Pulso
[Texto corrido sobre experiências recorrentes, frequência e exclusividades.]

### Etapa 6 — Protagonismo
[Texto corrido sobre níveis, como evoluem e o que ganham assumindo liderança.]

### Etapa 7 — DNA
[Texto corrido sobre acordos, expectativas e limites.]

### Etapa 8 — Ciclo de Vida
[Texto corrido sobre aquisição, reengajamento e preservação da qualidade.]

---

## Pilar 3 — Operação

### Etapa 9 — Organização e Plataformas
[Texto corrido sobre quem opera, plataforma e organização dos dados.]

### Etapa 10 — Receita
[Texto corrido sobre modelo financeiro e sustentabilidade.]

---

## Resumo Estratégico

### Essência
[3 afirmações curtas, diretas e inspiradoras.]

### Movimento
[3 afirmações curtas, diretas e inspiradoras.]

### Operação
[3 afirmações curtas, diretas e inspiradoras.]

---

Instruções: Use o nome da comunidade e detalhes específicos das respostas. Nunca gere conteúdo genérico. Se uma resposta estiver vaga, complete com coerência e adicione nota em itálico: "*Sugestão: considere refinar esse ponto antes do lançamento.*". O cliente deve sentir que tem nas mãos o projeto mais completo que já viu.`

export async function POST(req: NextRequest) {
  const userId = await getUserId(req)
  if (!userId) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const rows = await prisma.response.findMany({ where: { userId } })
  const answers: Record<string, string> = {}
  for (const row of rows) answers[row.questionId] = row.answer

  const unanswered = ALL_QUESTION_IDS.filter((id) => !answers[id]?.trim())
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
    const answerContext = buildAnswerContext(answers)

    const message = await client.messages.create({
      model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-5',
      max_tokens: 8192,
      system: BLUEPRINT_PROMPT,
      messages: [
        {
          role: 'user',
          content: `Aqui estão as respostas do cliente ao Método Stack:\n${answerContext}\n\nGere o Blueprint completo.`,
        },
      ],
    })

    const content = (message.content[0] as { type: string; text: string }).text

    await prisma.document.upsert({
      where: { userId_type: { userId, type: 'blueprint' } },
      update: { content },
      create: { userId, type: 'blueprint', content },
    })

    return NextResponse.json({ ok: true })
  } catch (err: unknown) {
    console.error('Anthropic error:', err)
    const message = err instanceof Error ? err.message : 'Erro ao chamar a API da Anthropic.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
