import { NextResponse } from 'next/server'
import { db } from '@/db'
import { users } from '@/db/schema'
import { eq } from 'drizzle-orm'
import bcrypt from 'bcryptjs'

export async function POST(request: Request) {
  try {
    const { name, email, password, phone, fullName } = await request.json()

    if (!name || !email || !password || !phone || !fullName) {
      return NextResponse.json(
        { error: 'Todos los campos son requeridos' },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'La contraseña debe tener al menos 8 caracteres' },
        { status: 400 }
      )
    }

    const [existing] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email.toLowerCase()))
      .limit(1)

    if (existing) {
      return NextResponse.json(
        { error: 'Ya existe una cuenta con este correo' },
        { status: 409 }
      )
    }

    const passwordHash = await bcrypt.hash(password, 12)

    const [newUser] = await db
      .insert(users)
      .values({
        name: name.trim(),
        email: email.toLowerCase().trim(),
        passwordHash,
        phone: phone.trim(),
        fullName: fullName.trim(),
      })
      .returning({ id: users.id, name: users.name, email: users.email })

    return NextResponse.json(
      { message: 'Cuenta creada exitosamente', user: newUser },
      { status: 201 }
    )
  } catch (error) {
    console.error('Register error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
