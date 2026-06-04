'use server'

import { auth } from '@/lib/auth'
import { db } from '@/db'
import { players, users } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

export async function createInfluencer(prevState: any, formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) {
    return { error: 'No autorizado' }
  }

  // Double check admin role in DB
  const [user] = await db
    .select({ role: users.role })
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1)

  if (user?.role !== 'ADMIN') {
    return { error: 'No tienes permisos de administrador para realizar esta acción' }
  }

  const name = formData.get('name') as string
  const socialNetwork = formData.get('socialNetwork') as string
  const position = (formData.get('position') as 'POR' | 'DEF' | 'MED' | 'DEL' | 'ENT') || 'MED'
  const bio = formData.get('bio') as string | null
  const numberStr = formData.get('number') as string | null
  const country = formData.get('country') as string | null
  const imageFile = formData.get('imageFile') as File | null

  if (!name || name.trim().length === 0) {
    return { error: 'El nombre del influencer es obligatorio' }
  }

  if (!socialNetwork || socialNetwork.trim().length === 0) {
    return { error: 'La red social es obligatoria' }
  }

  // Generate unique slug
  let slug = name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric chars with hyphen
    .replace(/(^-|-$)+/g, '') // Remove leading/trailing hyphens

  if (!slug) {
    slug = `influencer-${Date.now()}`
  }

  // Check if slug already exists and append suffix if necessary
  const existing = await db
    .select({ id: players.id })
    .from(players)
    .where(eq(players.id, slug))
    .limit(1)

  if (existing.length > 0) {
    slug = `${slug}-${Math.floor(1000 + Math.random() * 9000)}`
  }

  let imageUrl: string | null = null

  // Save image if uploaded
  if (imageFile && imageFile.size > 0) {
    try {
      const bytes = await imageFile.arrayBuffer()
      const buffer = Buffer.from(bytes)

      const uploadDir = path.join(process.cwd(), 'uploads', 'influencer-images')
      await mkdir(uploadDir, { recursive: true })

      const ext = imageFile.name.split('.').pop() || 'jpg'
      const filename = `${slug}-${Date.now()}.${ext}`
      const filepath = path.join(uploadDir, filename)

      await writeFile(filepath, buffer)
      imageUrl = `/api/uploads/influencer-images/${filename}`
    } catch (err) {
      console.error('Error saving influencer image:', err)
      return { error: 'Error al guardar la imagen subida' }
    }
  }

  // Parse custom number/id suffix
  const number = numberStr ? parseInt(numberStr, 10) : 0

  try {
    await db.insert(players).values({
      id: slug,
      name: name.trim(),
      club: socialNetwork.trim(), // Save social network in the club field
      position,
      imageUrl,
      number: isNaN(number) ? 0 : number,
      bio: bio?.trim() || null,
      goals: 0,
      assists: 0,
      caps: 0,
      hypeCount: 0,
      country: country?.trim() || null,
    })

    revalidatePath('/influencers')
    return { success: 'Influencer creado exitosamente!', slug }
  } catch (err) {
    console.error('Error creating influencer in DB:', err)
    return { error: 'Hubo un error al guardar el influencer en la base de datos' }
  }
}

export async function updateInfluencer(playerId: string, prevState: any, formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) {
    return { error: 'No autorizado' }
  }

  // Double check admin role in DB
  const [user] = await db
    .select({ role: users.role })
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1)

  if (user?.role !== 'ADMIN') {
    return { error: 'No tienes permisos de administrador para realizar esta acción' }
  }

  const name = formData.get('name') as string
  const socialNetwork = formData.get('socialNetwork') as string
  const position = formData.get('position') as 'POR' | 'DEF' | 'MED' | 'DEL' | 'ENT' | null
  const bio = formData.get('bio') as string | null
  const numberStr = formData.get('number') as string | null
  const ageStr = formData.get('age') as string | null
  const gender = formData.get('gender') as string | null
  const country = formData.get('country') as string | null
  const imageFile = formData.get('imageFile') as File | null

  if (!name || name.trim().length === 0) {
    return { error: 'El nombre del influencer es obligatorio' }
  }

  if (!socialNetwork || socialNetwork.trim().length === 0) {
    return { error: 'La red social es obligatoria' }
  }

  let imageUrl: string | null = null

  // Save image if uploaded
  if (imageFile && imageFile.size > 0) {
    try {
      const bytes = await imageFile.arrayBuffer()
      const buffer = Buffer.from(bytes)

      const uploadDir = path.join(process.cwd(), 'uploads', 'influencer-images')
      await mkdir(uploadDir, { recursive: true })

      const ext = imageFile.name.split('.').pop() || 'jpg'
      const filename = `${playerId}-${Date.now()}.${ext}`
      const filepath = path.join(uploadDir, filename)

      await writeFile(filepath, buffer)
      imageUrl = `/api/uploads/influencer-images/${filename}`
    } catch (err) {
      console.error('Error saving influencer image:', err)
      return { error: 'Error al guardar la imagen subida' }
    }
  }

  const number = numberStr ? parseInt(numberStr, 10) : 0
  const age = ageStr ? parseInt(ageStr, 10) : null

  try {
    const updateData: Record<string, any> = {
      name: name.trim(),
      club: socialNetwork.trim(), // Save social network in the club field
      bio: bio?.trim() || null,
      age: age !== null && !isNaN(age) ? age : null,
      gender: gender?.trim() || null,
      country: country?.trim() || null,
    }

    if (position) {
      updateData.position = position
    }

    if (numberStr) {
      const number = parseInt(numberStr, 10)
      updateData.number = isNaN(number) ? 0 : number
    }

    if (imageUrl) {
      updateData.imageUrl = imageUrl
    }

    await db.update(players).set(updateData).where(eq(players.id, playerId))

    revalidatePath(`/influencers`)
    revalidatePath(`/influencers/${playerId}`)
    return { success: 'Influencer actualizado exitosamente!' }
  } catch (err) {
    console.error('Error updating influencer in DB:', err)
    return { error: 'Hubo un error al actualizar el influencer en la base de datos' }
  }
}

export async function deleteInfluencer(playerId: string) {
  const session = await auth()
  if (!session?.user?.id) {
    return { error: 'No autorizado' }
  }

  // Double check admin role in DB
  const [user] = await db
    .select({ role: users.role })
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1)

  if (user?.role !== 'ADMIN') {
    return { error: 'No tienes permisos de administrador para realizar esta acción' }
  }

  try {
    await db.delete(players).where(eq(players.id, playerId))

    revalidatePath('/influencers')
    return { success: 'Influencer eliminado exitosamente!' }
  } catch (err) {
    console.error('Error deleting influencer from DB:', err)
    return { error: 'Hubo un error al eliminar el influencer de la base de datos' }
  }
}

export async function addClipToInfluencer(playerId: string, title: string, imageFile: File | null) {
  const session = await auth()
  if (!session?.user?.id) {
    return { error: 'No autorizado' }
  }

  // Double check admin role in DB
  const [user] = await db
    .select({ role: users.role })
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1)

  if (user?.role !== 'ADMIN') {
    return { error: 'No tienes permisos de administrador para realizar esta acción' }
  }

  if (!title || title.trim().length === 0) {
    return { error: 'El título del clip es obligatorio' }
  }

  let thumbnailUrl = '/clips/clip_1.png' // Default fallback

  // Save image if uploaded
  if (imageFile && imageFile.size > 0) {
    try {
      const bytes = await imageFile.arrayBuffer()
      const buffer = Buffer.from(bytes)

      const uploadDir = path.join(process.cwd(), 'uploads', 'clips')
      await mkdir(uploadDir, { recursive: true })

      const ext = imageFile.name.split('.').pop() || 'jpg'
      const filename = `clip-${playerId}-${Date.now()}.${ext}`
      const filepath = path.join(uploadDir, filename)

      await writeFile(filepath, buffer)
      thumbnailUrl = `/api/uploads/clips/${filename}`
    } catch (err) {
      console.error('Error saving clip thumbnail image:', err)
      return { error: 'Error al guardar la miniatura subida' }
    }
  }

  try {
    // Fetch current influencer clips
    const [player] = await db
      .select({ clips: players.clips, name: players.name })
      .from(players)
      .where(eq(players.id, playerId))
      .limit(1)

    if (!player) {
      return { error: 'Influencer no encontrado' }
    }

    let currentClips = player.clips || []

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
    return { success: 'Clip agregado exitosamente!', clips: updatedClips }
  } catch (err) {
    console.error('Error adding clip in DB:', err)
    return { error: 'Hubo un error al guardar el clip en la base de datos' }
  }
}

export async function deleteClipFromInfluencer(playerId: string, clipId: string) {
  const session = await auth()
  if (!session?.user?.id) {
    return { error: 'No autorizado' }
  }

  // Double check admin role in DB
  const [user] = await db
    .select({ role: users.role })
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1)

  if (user?.role !== 'ADMIN') {
    return { error: 'No tienes permisos de administrador para realizar esta acción' }
  }

  try {
    // Fetch current influencer clips
    const [player] = await db
      .select({ clips: players.clips, name: players.name })
      .from(players)
      .where(eq(players.id, playerId))
      .limit(1)

    if (!player) {
      return { error: 'Influencer no encontrado' }
    }

    let currentClips = player.clips || []

    const updatedClips = currentClips.filter(c => c.id !== clipId)

    await db
      .update(players)
      .set({ clips: updatedClips })
      .where(eq(players.id, playerId))

    revalidatePath(`/influencers/${playerId}`)
    return { success: 'Clip eliminado exitosamente!', clips: updatedClips }
  } catch (err) {
    console.error('Error deleting clip in DB:', err)
    return { error: 'Hubo un error al eliminar el clip de la base de datos' }
  }
}

export async function deleteInfluencerVideo(playerId: string) {
  const session = await auth()
  if (!session?.user?.id) {
    return { error: 'No autorizado' }
  }

  // Double check admin role in DB
  const [user] = await db
    .select({ role: users.role })
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1)

  if (user?.role !== 'ADMIN') {
    return { error: 'No tienes permisos de administrador para realizar esta acción' }
  }

  try {
    await db
      .update(players)
      .set({ videoUrl: null })
      .where(eq(players.id, playerId))

    revalidatePath(`/influencers/${playerId}`)
    return { success: 'Video eliminado exitosamente!' }
  } catch (err) {
    console.error('Error deleting influencer video in DB:', err)
    return { error: 'Hubo un error al eliminar el video en la base de datos' }
  }
}

