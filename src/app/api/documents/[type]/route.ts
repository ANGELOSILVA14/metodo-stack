import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { verifyToken, COOKIE_NAME } from '@/lib/auth'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ type: string }> }
) {
  const token = req.cookies.get(COOKIE_NAME)?.value
  if (!token) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const payload = await verifyToken(token)
  if (!payload) return NextResponse.json({ error: 'Token inválido' }, { status: 401 })

  const { type } = await params
  if (!['blueprint', 'action-plan', 'complete'].includes(type)) {
    return NextResponse.json({ error: 'Tipo inválido' }, { status: 400 })
  }

  const doc = await prisma.document.findUnique({
    where: { userId_type: { userId: payload.userId, type } },
  })

  if (!doc) return NextResponse.json({ exists: false }, { status: 404 })

  return NextResponse.json({ exists: true, content: doc.content, createdAt: doc.createdAt })
}
