import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { verifyToken, COOKIE_NAME } from '@/lib/auth'
import { generateWordDocument } from '@/lib/docx-generator'

export async function GET(
  req: NextRequest,
  { params }: { params: { type: string } }
) {
  const token = req.cookies.get(COOKIE_NAME)?.value
  if (!token) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const payload = await verifyToken(token)
  if (!payload) return NextResponse.json({ error: 'Token inválido' }, { status: 401 })

  const docType = params.type
  if (!['blueprint', 'action-plan', 'complete'].includes(docType)) {
    return NextResponse.json({ error: 'Tipo inválido' }, { status: 400 })
  }

  const [doc, user] = await Promise.all([
    prisma.document.findUnique({
      where: { userId_type: { userId: payload.userId, type: docType } },
    }),
    prisma.user.findUnique({ where: { id: payload.userId }, select: { name: true } }),
  ])

  if (!doc) {
    return NextResponse.json({ error: 'Documento não encontrado. Gere o documento primeiro.' }, { status: 404 })
  }

  const titleMap: Record<string, string> = {
    blueprint: 'Blueprint da Comunidade',
    'action-plan': 'Plano de Ação',
    complete: 'Documento Estratégico Completo',
  }
  const filenameMap: Record<string, string> = {
    blueprint: 'blueprint-comunidade.docx',
    'action-plan': 'plano-de-acao.docx',
    complete: 'metodo-stack-documento-completo.docx',
  }
  const title = titleMap[docType]
  const filename = filenameMap[docType]

  const generatorOptions = docType === 'complete' ? {
    userName: user?.name || '',
    generatedAt: new Date(doc.createdAt).toLocaleDateString('pt-BR'),
  } : undefined

  const buffer = await generateWordDocument(doc.content, title, generatorOptions)

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': buffer.length.toString(),
    },
  })
}

export async function HEAD(
  req: NextRequest,
  { params }: { params: { type: string } }
) {
  const token = req.cookies.get(COOKIE_NAME)?.value
  if (!token) return new NextResponse(null, { status: 401 })

  const payload = await verifyToken(token)
  if (!payload) return new NextResponse(null, { status: 401 })

  const doc = await prisma.document.findUnique({
    where: { userId_type: { userId: payload.userId, type: params.type } },
  })

  return new NextResponse(null, { status: doc ? 200 : 404 })
}
