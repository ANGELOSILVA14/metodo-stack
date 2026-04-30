import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { hashPassword, createToken, COOKIE_NAME } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json()

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Preencha todos os campos.' }, { status: 400 })
    }
    if (password.length < 6) {
      return NextResponse.json({ error: 'A senha deve ter pelo menos 6 caracteres.' }, { status: 400 })
    }

    const normalizedEmail = email.toLowerCase().trim()

    const authorized = await prisma.authorizedEmail.findUnique({ where: { email: normalizedEmail } })
    if (!authorized) {
      return NextResponse.json(
        { error: 'E-mail não autorizado. Adquira o Método Stack para criar sua conta.' },
        { status: 403 }
      )
    }
    if (authorized.usedAt) {
      return NextResponse.json(
        { error: 'Esse e-mail já foi utilizado para criar uma conta. Acesse a página de login.' },
        { status: 409 }
      )
    }

    const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } })
    if (existing) {
      return NextResponse.json({ error: 'E-mail já cadastrado.' }, { status: 409 })
    }

    const passwordHash = await hashPassword(password)
    const user = await prisma.user.create({
      data: { name: name.trim(), email: normalizedEmail, passwordHash },
    })

    await prisma.authorizedEmail.update({
      where: { email: normalizedEmail },
      data: { usedAt: new Date() },
    })

    const token = await createToken(user.id)
    const res = NextResponse.json({ ok: true })
    res.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
    })
    return res
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Erro interno. Tente novamente.' }, { status: 500 })
  }
}
