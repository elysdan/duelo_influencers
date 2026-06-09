import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/db'
import { users, systemSettings } from '@/db/schema'
import { eq } from 'drizzle-orm'
import path from 'path'
import { mkdir, writeFile } from 'fs/promises'
import { revalidatePath } from 'next/cache'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Check admin role in DB
    const [user] = await db
      .select({ role: users.role })
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1)

    if (user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'No tienes permisos de administrador para realizar esta acción' }, { status: 403 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const type = formData.get('type') as 'paises' | 'semana' | null
    const week = formData.get('week') as string | null
    const day = formData.get('day') as string | null

    if (!file || file.size === 0) {
      return NextResponse.json({ error: 'Archivo no proporcionado' }, { status: 400 })
    }
    if (type !== 'paises' && type !== 'semana') {
      return NextResponse.json({ error: 'Tipo de tabla no válido' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const uploadDir = path.join(process.cwd(), 'uploads', 'classification')
    await mkdir(uploadDir, { recursive: true })

    const ext = file.name.split('.').pop() || 'png'
    const filename = type === 'semana' && week && day
      ? `tabla-${type}-w${week}-d${day}-${Date.now()}.${ext}`
      : `tabla-${type}-${Date.now()}.${ext}`
    const filepath = path.join(uploadDir, filename)

    await writeFile(filepath, buffer)
    const fileUrl = `/api/uploads/classification/${filename}`

    const settingKey = type === 'paises'
      ? 'tabla_de_paises_url'
      : (week && day ? `tabla_semana_${week}_dia_${day}_url` : 'tabla_de_semana_url')

    // Upsert key in system_settings table
    const [existingSetting] = await db
      .select()
      .from(systemSettings)
      .where(eq(systemSettings.key, settingKey))
      .limit(1)

    if (existingSetting) {
      await db
        .update(systemSettings)
        .set({ value: fileUrl })
        .where(eq(systemSettings.key, settingKey))
    } else {
      await db
        .insert(systemSettings)
        .values({ key: settingKey, value: fileUrl })
    }

    revalidatePath('/clasificacion')
    return NextResponse.json({ success: true, url: fileUrl })
  } catch (error) {
    console.error('Error uploading classification image:', error)
    return NextResponse.json({ error: 'Hubo un error al guardar la imagen en el servidor' }, { status: 500 })
  }
}
