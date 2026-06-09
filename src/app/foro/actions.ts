'use server'

import { db } from '@/db'
import { comments } from '@/db/schema'
import { auth } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

export async function postGlobalComment(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) return { error: 'Debes iniciar sesión para comentar' }
  
  const content = formData.get('content') as string
  if (!content || content.trim() === '') return { error: 'El comentario no puede estar vacío' }
  if (content.length > 300) return { error: 'El comentario excede los 300 caracteres' }

  await db.insert(comments).values({
    content: content.trim(),
    authorId: session.user.id,
    playerId: null,
    newsId: null,
  })

  revalidatePath('/foro')
  return { success: true }
}
