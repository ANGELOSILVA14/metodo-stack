import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import prisma from '@/lib/db'
import { verifyToken, COOKIE_NAME } from '@/lib/auth'
import { PILARES, ACTION_PLAN_QUESTIONS, ALL_IDS_COMBINED } from '@/data/questions'

export const maxDuration = 300

async function getUserId(req: NextRequest): Promise<number | null> {
  const token = req.cookies.get(COOKIE_NAME)?.value
  if (!token) return null
  const payload = await verifyToken(token)
  return payload?.userId ?? null
}

function buildContext(answers: Record<string, string>): string {
  let ctx = '=== RESPOSTAS DO MÉTODO STACK ===\n'
  for (const pilar of PILARES) {
    ctx += `\n--- PILAR ${pilar.number} — ${pilar.name} ---\n`
    for (const etapa of pilar.etapas) {
      ctx += `\nEtapa ${etapa.number} — ${etapa.name}:\n`
      for (const q of etapa.questions) {
        ctx += `P: ${q.text}\nR: ${answers[q.id] || '(não respondida)'}\n\n`
      }
    }
  }
  ctx += '\n=== RESPOSTAS DO PLANO DE AÇÃO ===\n'
  for (const q of ACTION_PLAN_QUESTIONS) {
    ctx += `\nP: ${q.text}\nR: ${answers[q.id] || '(não respondida)'}\n`
  }
  return ctx
}

const PART1_PROMPT = `Você é um(a) estrategista especializado(a) em comunidades. Com base nas respostas do usuário ao Método Stack, gere as PARTES 1 e 2 do documento estratégico completo.

Use formatação markdown: # para título principal, ## para pilares/seções, ### para etapas.
Escreva em português brasileiro. Nunca use formato de pergunta e resposta. Nunca use travessão (—): use dois-pontos (:) ou ponto final (.) como alternativa.
Use o nome da comunidade e os detalhes específicos das respostas em todo o documento.

Gere exatamente esta estrutura:

# [nome da comunidade]: Documento Estratégico Completo

---

# PARTE 1: BLUEPRINT DA COMUNIDADE

## Apresentação
[Um parágrafo apresentando a comunidade como se já existisse. Use nome, propósito e identidade definidos.]

---

## Pilar 1: Essência

### Etapa 1: Propósito
[Texto corrido: propósito, problema que resolve, transformação que gera.]

### Etapa 2: Tribo
[Texto corrido: quem são os membros, o que os une, perfil ideal.]

### Etapa 3: Marca
[Texto corrido: nome, como se chamam, tom, linguagem própria.]

---

## Pilar 2: Movimento

### Etapa 4: Porta de Entrada
[Texto corrido: como se acessa, boas-vindas, primeiros passos.]

### Etapa 5: Pulso
[Texto corrido: experiências recorrentes, frequência, exclusividades.]

### Etapa 6: Protagonismo
[Texto corrido: níveis, evolução, o que ganham liderando.]

### Etapa 7: DNA
[Texto corrido: acordos, expectativas, limites.]

### Etapa 8: Ciclo de Vida
[Texto corrido: aquisição, reengajamento, preservação da qualidade.]

---

## Pilar 3: Operação

### Etapa 9: Organização e Plataformas
[Texto corrido: quem opera, plataforma, organização dos dados.]

### Etapa 10: Receita
[Texto corrido: modelo financeiro, o que o membro paga/recebe, sustentabilidade.]

---

## Resumo Estratégico

### Essência
[3 afirmações curtas, diretas e inspiradoras.]

### Movimento
[3 afirmações curtas, diretas e inspiradoras.]

### Operação
[3 afirmações curtas, diretas e inspiradoras.]

---

# PARTE 2: PLANO DE AÇÃO

## Resumo da Comunidade
[Síntese em um parágrafo para comunicação externa.]

---

## Identidade Visual
*Prazo sugerido: [ex: Semana 1 ou Semana 2, com base no tempo disponível informado]*

- [Ação 1: ex. definir paleta de cores e tipografia. Ferramenta gratuita se orçamento for zero.]
- [Ação 2: ex. criar logo ou símbolo visual da comunidade]
- [Ação 3: ex. criar template de post para redes sociais]
- [Ação 4: ex. configurar foto de perfil e capa na plataforma escolhida]

◉ Entrega da seção: [o que precisa estar pronto ao final dessa etapa]

---

## Plataforma e Configuração
*Prazo sugerido: [ex: Semana 1, antes de qualquer divulgação]*

- [Passo 1: criar e configurar o ambiente na plataforma definida nas respostas]
- [Passo 2: organizar canais, categorias ou espaços internos]
- [Passo 3: configurar mensagem de boas-vindas automática ou ritual de entrada]
- [Passo 4: testar o fluxo completo como se fosse um novo membro]
- [Passo 5: definir quem tem acesso a quê e como novos membros entram]

◉ Entrega da seção: [o que precisa estar funcionando antes do lançamento]

---

## Materiais de Lançamento
*Prazo sugerido: [ex: Semana 2, antes da divulgação começar]*

- [Material 1: ex. post de anúncio para Instagram ou e-mail]
- [Material 2: ex. página ou link de inscrição]
- [Material 3: ex. mensagem de abordagem individual para os primeiros membros]
- [Material 4: ex. conteúdo de boas-vindas para o primeiro dia dentro da comunidade]
- [Material 5: ex. material de apresentação da comunidade para novos membros]

◉ Entrega da seção: [o que precisa estar criado e revisado antes do dia do lançamento]

---

## Estratégia dos Primeiros Membros
*Prazo sugerido: [ex: Semana 2 a Semana 3, antes e durante o lançamento]*

- [Ação 1: identificar as primeiras pessoas a convidar, com base na audiência atual informada]
- [Ação 2: canal de abordagem recomendado com base nas respostas — direto, não público]
- [Ação 3: roteiro simples de mensagem: o que dizer, por que essa pessoa especificamente]
- [Ação 4: meta de membros fundadores para o primeiro dia]
- [Ação 5: como tratar os primeiros membros de forma diferenciada para criar senso de pertencimento]

◉ Entrega da seção: [meta de membros para o dia do lançamento]

---

## Cronograma de Lançamento

*Baseado no tempo disponível informado. Número de semanas definido pela data de lançamento e horas semanais disponíveis. Sem datas fixas, apenas numeração das semanas.*

### SEMANA 1: [título da semana]
*Foco: [o que essa semana representa no processo de lançamento]*

- [Ação específica 1]
- [Ação específica 2]
- [Ação específica 3]
- [Ação específica 4]
- [Ação específica 5]

◉ Indicador da semana: [o que deve ter acontecido ao final dessa semana]

---

### SEMANA 2: [título da semana]
*Foco: [o que essa semana representa]*

- [Ação 1]
- [Ação 2]
- [Ação 3]
- [Ação 4]
- [Ação 5]

◉ Indicador da semana: [indicador personalizado]

---

[Continue com SEMANA 3, SEMANA 4... até a semana do lançamento, com base no tempo disponível informado]

---

## Roteiro do Dia do Lançamento

*O que fazer no dia exato da abertura, em ordem.*

- [Manhã: o que preparar antes de abrir]
- [Como e onde fazer o anúncio público]
- [Como abordar individualmente os primeiros membros que entrarem]
- [O que postar dentro da comunidade no primeiro dia]
- [Como encerrar o dia e preparar o dia seguinte]

◉ Meta do dia: [número de membros ou interações esperadas no dia 1]

---

## Primeiros 90 Dias

### Mês 1: Ativação
*Foco: garantir que os membros que entraram participem pelo menos uma vez*
- [Ação/ritual a manter]
- [Ação/ritual a manter]
- [O que monitorar]

### Mês 2: Ritmo
*Foco: criar hábito de participação recorrente*
- [Ação/ritual a manter]
- [O que introduzir de novo]
- [O que monitorar]

### Mês 3: Protagonismo
*Foco: identificar líderes naturais e ampliar a autonomia da comunidade*
- [Ação/ritual a manter]
- [O que delegar ou co-criar com membros]
- [O que monitorar]

---

## Métricas para Acompanhar
- **[Métrica 1]:** meta sugerida, como medir e o que fazer se não estiver bem
- **[Métrica 2]:** meta sugerida, como medir e o que fazer se não estiver bem
- **[Métrica 3]:** meta sugerida, como medir e o que fazer se não estiver bem
- **[Métrica 4]:** meta sugerida, como medir e o que fazer se não estiver bem

---

## Próximos Passos
*As 5 ações mais concretas para as próximas 48 horas.*

- [Ação 1: específica, simples, sem depender de terceiros]
- [Ação 2]
- [Ação 3]
- [Ação 4]
- [Ação 5]

Instruções gerais:
- Use o nome da comunidade em todo o documento.
- Nunca use travessão (—). Use dois-pontos (:) ou ponto final (.).
- Se orçamento for zero: apenas ferramentas gratuitas.
- O número de semanas no Cronograma deve refletir o tempo até o lançamento informado pelo usuário.
- Tom: motivador, direto, prático.
- Se uma resposta estiver vaga, complete com coerência e adicione nota em itálico: "*Sugestão: considere refinar esse ponto antes do lançamento.*"`

const CHECKLIST_PROMPT = `Você é um(a) estrategista especializado(a) em comunidades. Com base nas respostas do usuário, gere a PARTE 3 do documento: o Checklist de Lançamento personalizado dos primeiros 30 dias.

Use formatação markdown. Escreva em português brasileiro.
Nunca use travessão (—). Use dois-pontos (:) ou ponto final (.) como alternativa.
Personalize usando: nome da comunidade, ritual de boas-vindas, ritual recorrente, sistema de reconhecimento, plataforma principal e modelo de resultado.

Gere exatamente esta estrutura:

---

# PARTE 3: CHECKLIST DE LANÇAMENTO: OS PRIMEIROS 30 DIAS

*Gerado com base nas suas respostas. Use como guia operacional semana a semana.*

---

## SEMANA 1: Abertura e Primeiros Membros

*Foco: Ativar os primeiros membros e estabelecer o tom da comunidade.*

☐ [Ação específica e personalizada 1. Mencione o nome da comunidade, o ritual de boas-vindas definido e a plataforma escolhida.]
*Por que: [explicação curta do motivo dessa ação ser importante nessa semana]*

☐ [Ação específica 2]
*Por que: [orientação]*

☐ [Ação específica 3]
*Por que: [orientação]*

☐ [Ação específica 4]
*Por que: [orientação]*

☐ [Ação específica 5]
*Por que: [orientação]*

◉ Indicador da semana: [indicador personalizado com base no tipo e tamanho esperado da comunidade]

---

## SEMANA 2: Estabelecer Ritmo

*Foco: Criar o hábito de participação e mostrar que a comunidade tem vida própria.*

☐ [Ação 1. Mencione o primeiro ritual recorrente definido no Pulso e a frequência definida.]
*Por que: [orientação]*

☐ [Ação 2]
*Por que: [orientação]*

☐ [Ação 3]
*Por que: [orientação]*

☐ [Ação 4]
*Por que: [orientação]*

☐ [Ação 5]
*Por que: [orientação]*

◉ Indicador da semana: [indicador personalizado]

---

## SEMANA 3: Primeiros Protagonistas

*Foco: Identificar e destacar quem está engajando mais e transformá-los em referência.*

☐ [Ação 1. Mencione o sistema de reconhecimento definido no Protagonismo.]
*Por que: [orientação]*

☐ [Ação 2]
*Por que: [orientação]*

☐ [Ação 3]
*Por que: [orientação]*

☐ [Ação 4]
*Por que: [orientação]*

☐ [Ação 5]
*Por que: [orientação]*

◉ Indicador da semana: [indicador personalizado]

---

## SEMANA 4: Consolidação e Próximos Passos

*Foco: Fechar o primeiro mês com clareza do que funcionou e do que ajustar.*

☐ [Ação 1. Inclua revisão dos indicadores do modelo financeiro/receita definido.]
*Por que: [orientação]*

☐ [Ação 2. Como coletar feedback dos membros.]
*Por que: [orientação]*

☐ [Ação 3]
*Por que: [orientação]*

☐ [Ação 4]
*Por que: [orientação]*

☐ [Ação 5]
*Por que: [orientação]*

◉ Indicador da semana: A comunidade se move quando você não está puxando. [Descreva como isso se manifesta nessa comunidade específica.]

---

## Indicadores Gerais dos 30 Dias

- **Taxa de ativação:** Percentual de membros que participaram pelo menos uma vez. Meta sugerida: [definir com base no tipo de comunidade e modelo de receita]. Como medir: [instrução prática].

- **Frequência média:** Quantas vezes por semana os membros interagem. Meta sugerida: [definir com base na frequência definida no Pulso]. Como medir: [instrução prática].

- **Conteúdo gerado por membros:** Postagens que vieram da comunidade, não da marca. Meta para o mês 1: [definir]. Como medir: [instrução prática].

- **Retenção:** Membros que entraram e ainda estão ativos no dia 30. Meta sugerida: [definir com base no modelo de entrada e receita]. Como medir: [instrução prática].

- **Sinal de saúde:** [Descreva o que significa a comunidade se mover de forma autônoma para esse contexto específico, com base nas respostas.]

---

*Este checklist foi gerado com base nas suas respostas ao Método Stack. É um ponto de partida. Ajuste conforme a realidade do seu lançamento.*`

export async function POST(req: NextRequest) {
  const userId = await getUserId(req)
  if (!userId) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey || apiKey.includes('SUBSTITUA')) {
    return NextResponse.json(
      { error: 'Chave da API da Anthropic não configurada. Abra o arquivo .env.local e adicione sua chave ANTHROPIC_API_KEY.' },
      { status: 500 }
    )
  }

  // Buscar respostas
  const rows = await prisma.response.findMany({ where: { userId } })
  const answers: Record<string, string> = {}
  for (const row of rows) answers[row.questionId] = row.answer

  // Verificar se todas as 37 perguntas foram respondidas
  const unanswered = ALL_IDS_COMBINED.filter((id) => !answers[id]?.trim())
  if (unanswered.length > 0) {
    return NextResponse.json(
      { error: `Ainda há ${unanswered.length} pergunta(s) sem resposta.` },
      { status: 400 }
    )
  }

  const context = buildContext(answers)

  try {
    const client = new Anthropic({ apiKey })
    const model = process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-5'

    // Chamada 1: Blueprint + Plano de Ação
    const part1 = await client.messages.create({
      model,
      max_tokens: 8192,
      system: PART1_PROMPT,
      messages: [{ role: 'user', content: `Respostas do usuário:\n\n${context}\n\nGere as Partes 1 e 2 do documento.` }],
    })

    // Chamada 2: Checklist personalizado
    const part2 = await client.messages.create({
      model,
      max_tokens: 4096,
      system: CHECKLIST_PROMPT,
      messages: [{ role: 'user', content: `Respostas do usuário:\n\n${context}\n\nGere a Parte 3 — Checklist de Lançamento personalizado.` }],
    })

    const content1 = (part1.content[0] as { type: string; text: string }).text
    const content2 = (part2.content[0] as { type: string; text: string }).text

    // Unir tudo em um único documento
    const fullContent = `${content1}\n\n${content2}`

    await prisma.document.upsert({
      where: { userId_type: { userId, type: 'complete' } },
      update: { content: fullContent },
      create: { userId, type: 'complete', content: fullContent },
    })

    return NextResponse.json({ ok: true })
  } catch (err: unknown) {
    console.error('Anthropic error:', err)
    const message = err instanceof Error ? err.message : 'Erro ao chamar a API da Anthropic.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
