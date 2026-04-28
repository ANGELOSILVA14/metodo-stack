import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { verifyToken, COOKIE_NAME } from '@/lib/auth'

async function getUserId(req: NextRequest): Promise<number | null> {
  const token = req.cookies.get(COOKIE_NAME)?.value
  if (!token) return null
  const payload = await verifyToken(token)
  return payload?.userId ?? null
}

export async function GET(req: NextRequest) {
  const userId = await getUserId(req)
  if (!userId) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const rows = await prisma.response.findMany({ where: { userId } })
  const answers: Record<string, string> = {}
  for (const row of rows) answers[row.questionId] = row.answer

  return NextResponse.json({ answers })
}

export async function POST(req: NextRequest) {
  const userId = await getUserId(req)
  if (!userId) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const { questionId, answer } = await req.json()
  if (!questionId) return NextResponse.json({ error: 'questionId obrigatório' }, { status: 400 })

  await prisma.response.upsert({
    where: { userId_questionId: { userId, questionId } },
    update: { answer: answer ?? '' },
    create: { userId, questionId, answer: answer ?? '' },
  })

  return NextResponse.json({ ok: true })
}

export async function PUT(req: NextRequest) {
  const userId = await getUserId(req)
  if (!userId) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const { answers } = await req.json() as { answers: Record<string, string> }
  if (!answers) return NextResponse.json({ error: 'answers obrigatório' }, { status: 400 })

  await Promise.all(
    Object.entries(answers).map(([questionId, answer]) =>
      prisma.response.upsert({
        where: { userId_questionId: { userId, questionId } },
        update: { answer },
        create: { userId, questionId, answer },
      })
    )
  )

  return NextResponse.json({ ok: true })
}
