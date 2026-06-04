import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/db'
import { users, players } from '@/db/schema'
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
    const playerId = formData.get('playerId') as string
    const file = formData.get('file') as File | null

    if (!playerId) {
      return NextResponse.json({ error: 'ID de influencer obligatorio' }, { status: 400 })
    }

    if (!file || file.size === 0) {
      return NextResponse.json({ error: 'El archivo de video es obligatorio' }, { status: 400 })
    }

    // Save video file
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const uploadDir = path.join(process.cwd(), 'uploads', 'players', 'videos')
    await mkdir(uploadDir, { recursive: true })

    const ext = file.name.split('.').pop() || 'mp4'
    const filename = `video-${playerId}-${Date.now()}.${ext}`
    const filepath = path.join(uploadDir, filename)

    await writeFile(filepath, buffer)
    const videoUrl = `/api/uploads/players/videos/${filename}`

    // Update player record
    await db
      .update(players)
      .set({ videoUrl })
      .where(eq(players.id, playerId))

    revalidatePath(`/influencers/${playerId}`)
    
    return NextResponse.json({ success: 'Video subido exitosamente!', videoUrl })
  } catch (error) {
    console.error('Error uploading influencer video via API:', error)
    return NextResponse.json({ error: 'Hubo un error al guardar el video en el servidor' }, { status: 500 })
  }
}
