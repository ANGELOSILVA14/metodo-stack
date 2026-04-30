import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const token = req.nextUrl.searchParams.get('hottok')
    if (token !== process.env.HOTMART_WEBHOOK_TOKEN) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await req.json()

    const status = body?.data?.purchase?.status
    if (status !== 'APPROVED' && status !== 'COMPLETE') {
      return NextResponse.json({ ok: true, message: 'Status ignorado' })
    }

    const email = body?.data?.buyer?.email?.toLowerCase().trim()
    if (!email) {
      return NextResponse.json({ error: 'E-mail não encontrado no payload' }, { status: 400 })
    }

    await prisma.authorizedEmail.upsert({
      where: { email },
      update: {},
      create: { email },
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Webhook Hotmart erro:', err)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
