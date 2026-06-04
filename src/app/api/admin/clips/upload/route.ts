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
    const title = formData.get('title') as string
    const file = formData.get('file') as File | null

    if (!playerId) {
      return NextResponse.json({ error: 'ID de influencer obligatorio' }, { status: 400 })
    }
    if (!title || title.trim().length === 0) {
      return NextResponse.json({ error: 'El título del clip es obligatorio' }, { status: 400 })
    }

    let thumbnailUrl = '/clips/clip_1.png' // Default fallback

    // Save clip file if uploaded
    if (file && file.size > 0) {
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)

      const uploadDir = path.join(process.cwd(), 'uploads', 'clips')
      await mkdir(uploadDir, { recursive: true })

      const ext = file.name.split('.').pop() || 'mp4'
      const filename = `clip-${playerId}-${Date.now()}.${ext}`
      const filepath = path.join(uploadDir, filename)

      await writeFile(filepath, buffer)
      thumbnailUrl = `/api/uploads/clips/${filename}`
    }

    // Fetch current influencer clips
    const [player] = await db
      .select({ clips: players.clips })
      .from(players)
      .where(eq(players.id, playerId))
      .limit(1)

    if (!player) {
      return NextResponse.json({ error: 'Influencer no encontrado' }, { status: 404 })
    }

    const currentClips = player.clips || []
    const newClip = {
      id: `clip-${Date.now()}`,
      title: title.trim(),
      thumbnailUrl,
    }
    const updatedClips = [...currentClips, newClip]

    await db
      .update(players)
      .set({ clips: updatedClips })
      .where(eq(players.id, playerId))

    revalidatePath(`/influencers/${playerId}`)
    return NextResponse.json({ success: 'Clip agregado exitosamente!', clips: updatedClips })
  } catch (error) {
    console.error('Error uploading clip via API:', error)
    return NextResponse.json({ error: 'Hubo un error al guardar el clip en el servidor' }, { status: 500 })
  }
}
