'use server'

import { auth } from '@/lib/auth'
import { db } from '@/db'
import { users, showGames } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

export async function createGame(title: string, description: string | null, imageFile: File | null) {
  const session = await auth()
  if (!session?.user?.id) {
    return { error: 'No autorizado' }
  }

  // Check admin role in DB
  const [user] = await db
    .select({ role: users.role })
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1)

  if (user?.role !== 'ADMIN') {
    return { error: 'No tienes permisos de administrador para realizar esta acción' }
  }

  if (!title || title.trim().length === 0) {
    return { error: 'El título del juego es obligatorio' }
  }

  let imageUrl = null
  let hasImage = false

  if (imageFile && imageFile.size > 0) {
    try {
      const bytes = await imageFile.arrayBuffer()
      const buffer = Buffer.from(bytes)

      const uploadDir = path.join(process.cwd(), 'uploads', 'juegos')
      await mkdir(uploadDir, { recursive: true })

      const ext = imageFile.name.split('.').pop() || 'png'
      const filename = `game-${Date.now()}.${ext}`
      const filepath = path.join(uploadDir, filename)

      await writeFile(filepath, buffer)
      imageUrl = `/api/uploads/juegos/${filename}`
      hasImage = true
    } catch (err) {
      console.error('Error saving game image:', err)
      return { error: 'Error al guardar la imagen subida' }
    }
  }

  try {
    await db.insert(showGames).values({
      title: title.trim(),
      description: description && description.trim().length > 0 ? description.trim() : null,
      imageUrl,
      hasImage,
    })

    revalidatePath('/juegos')
    return { success: 'Juego creado exitosamente!' }
  } catch (err) {
    console.error('Error creating game in DB:', err)
    return { error: 'Hubo un error al guardar el juego en la base de datos' }
  }
}

export async function deleteGame(gameId: string) {
  const session = await auth()
  if (!session?.user?.id) {
    return { error: 'No autorizado' }
  }

  // Check admin role in DB
  const [user] = await db
    .select({ role: users.role })
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1)

  if (user?.role !== 'ADMIN') {
    return { error: 'No tienes permisos de administrador para realizar esta acción' }
  }

  try {
    await db.delete(showGames).where(eq(showGames.id, gameId))

    revalidatePath('/juegos')
    return { success: 'Juego eliminado exitosamente!' }
  } catch (err) {
    console.error('Error deleting game from DB:', err)
    return { error: 'Hubo un error al eliminar el juego de la base de datos' }
  }
}

export async function updateGame(
  gameId: string,
  title: string,
  description: string | null,
  imageFile: File | null
) {
  const session = await auth()
  if (!session?.user?.id) {
    return { error: 'No autorizado' }
  }

  // Check admin role in DB
  const [user] = await db
    .select({ role: users.role })
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1)

  if (user?.role !== 'ADMIN') {
    return { error: 'No tienes permisos de administrador para realizar esta acción' }
  }

  if (!title || title.trim().length === 0) {
    return { error: 'El título del juego es obligatorio' }
  }

  // Fetch current game to check image
  const [game] = await db.select().from(showGames).where(eq(showGames.id, gameId)).limit(1)
  if (!game) {
    return { error: 'Juego no encontrado' }
  }

  let imageUrl = game.imageUrl
  let hasImage = game.hasImage

  // If a new image is uploaded, save it
  if (imageFile && imageFile.size > 0) {
    try {
      const bytes = await imageFile.arrayBuffer()
      const buffer = Buffer.from(bytes)

      const uploadDir = path.join(process.cwd(), 'uploads', 'juegos')
      await mkdir(uploadDir, { recursive: true })

      const ext = imageFile.name.split('.').pop() || 'png'
      const filename = `game-${Date.now()}.${ext}`
      const filepath = path.join(uploadDir, filename)

      await writeFile(filepath, buffer)
      imageUrl = `/api/uploads/juegos/${filename}`
      hasImage = true
    } catch (err) {
      console.error('Error updating game image:', err)
      return { error: 'Error al guardar la nueva imagen de portada' }
    }
  }

  try {
    await db
      .update(showGames)
      .set({
        title: title.trim(),
        description: description && description.trim().length > 0 ? description.trim() : null,
        imageUrl,
        hasImage,
      })
      .where(eq(showGames.id, gameId))

    revalidatePath('/juegos')
    revalidatePath(`/juegos/${gameId}`)
    return { success: 'Juego actualizado exitosamente!' }
  } catch (err) {
    console.error('Error updating game in DB:', err)
    return { error: 'Hubo un error al actualizar el juego en la base de datos' }
  }
}
