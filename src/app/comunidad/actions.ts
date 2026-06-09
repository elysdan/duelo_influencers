'use server'

import { db } from '@/db'
import { comments } from '@/db/schema'
import { auth } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import fs from 'fs'
import path from 'path'

export async function postGlobalComment(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) return { error: 'Debes iniciar sesión para comentar' }
  
  const content = formData.get('content') as string
  if (!content || content.trim() === '') return { error: 'El comentario no puede estar vacío' }
  if (content.length > 300) return { error: 'El comentario excede los 300 caracteres' }

  // Process file upload if present
  let mediaUrl: string | null = null
  let mediaType: string | null = null

  const file = formData.get('mediaFile') as File | null
  if (file && file.size > 0 && file.name) {
    try {
      const extension = path.extname(file.name)
      const filename = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}${extension}`
      const uploadDir = path.join(process.cwd(), 'uploads', 'community')
      
      await fs.promises.mkdir(uploadDir, { recursive: true })
      
      const filepath = path.join(uploadDir, filename)
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      await fs.promises.writeFile(filepath, buffer)

      mediaUrl = `/api/uploads/community/${filename}`
      mediaType = file.type.startsWith('video/') ? 'video' : 'image'
    } catch (e) {
      console.error('Error saving uploaded community media:', e)
    }
  }

  // Slugs of the seeded players (influencers) in the database
  const PLAYER_IDS = [
    'camilo-vargas',
    'david-ospina',
    'luis-diaz',
    'james-rodriguez',
    'richard-rios',
    'andres-gomez',
    'yerson-mosquera',
    'daniel-munoz',
    'jhon-arias',
    'alvaro-montero'
  ]
  const randomPlayerId = PLAYER_IDS[Math.floor(Math.random() * PLAYER_IDS.length)]

  await db.insert(comments).values({
    content: content.trim(),
    authorId: session.user.id,
    playerId: randomPlayerId, // Associate an influencer so their photo is shown at the top of the card as a fallback
    newsId: null,
    mediaUrl,
    mediaType,
  })

  revalidatePath('/comunidad')
  return { success: true }
}
