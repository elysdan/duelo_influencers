'use server'

import { auth } from '@/lib/auth'
import { db } from '@/db'
import { users } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { writeFile, mkdir, unlink } from 'fs/promises'
import fs from 'fs'
import path from 'path'

export async function uploadNewAvatar(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) return { error: 'No autorizado' }

  const profileFile = formData.get('file') as File | null
  if (!profileFile || profileFile.size === 0) return { error: 'Archivo no válido' }

  try {
    const bytes = await profileFile.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const uploadDir = path.join(process.cwd(), 'uploads', session.user.id)
    await mkdir(uploadDir, { recursive: true })

    const ext = profileFile.name.split('.').pop() || 'jpg'
    const filename = `avatar-${Date.now()}.${ext}`
    const filepath = path.join(uploadDir, filename)

    await writeFile(filepath, buffer)
    const picturePath = `/api/uploads/${session.user.id}/${filename}`
    
    // Auto-set as avatar
    await db
      .update(users)
      .set({
        avatarUrl: picturePath,
      })
      .where(eq(users.id, session.user.id))

    revalidatePath('/perfil')
    return { success: 'Foto subida exitosamente', url: picturePath }
  } catch (error) {
    console.error('Error uploading avatar:', error)
    return { error: 'Error interno al subir la foto' }
  }
}

export async function deleteAvatar(url: string) {
  const session = await auth()
  if (!session?.user?.id) return { error: 'No autorizado' }

  if (!url.startsWith(`/api/uploads/${session.user.id}/`)) {
    return { error: 'No tienes permisos para borrar esta imagen' }
  }

  const filename = url.split('/').pop()
  if (!filename) return { error: 'Archivo inválido' }

  const filePath = path.join(process.cwd(), 'uploads', session.user.id, filename)
  
  try {
    if (fs.existsSync(filePath)) {
      await unlink(filePath)
      
      const current = await db.select({ avatarUrl: users.avatarUrl, profilePicture: users.profilePicture }).from(users).where(eq(users.id, session.user.id)).limit(1)
      const updates: any = {}
      if (current[0]?.avatarUrl === url) updates.avatarUrl = null
      if (current[0]?.profilePicture === url) updates.profilePicture = null
      
      if (Object.keys(updates).length > 0) {
        await db.update(users).set(updates).where(eq(users.id, session.user.id))
      }
      
      revalidatePath('/perfil')
      return { success: 'Foto eliminada correctamente' }
    }
    return { error: 'Archivo no encontrado' }
  } catch (e) {
    console.error('Error al borrar la foto:', e)
    return { error: 'Error interno al borrar la foto' }
  }
}

export async function updateProfile(formData: FormData) {
  const session = await auth()

  if (!session?.user?.id) {
    return { error: 'No autorizado' }
  }

  const name = formData.get('name') as string
  const avatarUrl = formData.get('avatarUrl') as string

  if (!name || name.trim().length === 0) {
    return { error: 'El nombre es obligatorio' }
  }

  const fullName = formData.get('fullName') as string | null
  const birthDateStr = formData.get('birthDate') as string | null
  const phone = formData.get('phone') as string | null
  const altEmail = formData.get('altEmail') as string | null
  const addressCountry = formData.get('addressCountry') as string | null
  const addressState = formData.get('addressState') as string | null
  const addressCity = formData.get('addressCity') as string | null
  const gender = formData.get('gender') as string | null

  let parsedBirthDate: Date | null = null
  if (birthDateStr) {
    const today = new Date()
    parsedBirthDate = new Date(birthDateStr)
    let age = today.getFullYear() - parsedBirthDate.getFullYear()
    const m = today.getMonth() - parsedBirthDate.getMonth()
    if (m < 0 || (m === 0 && today.getDate() < parsedBirthDate.getDate())) {
      age--
    }
    if (age < 18) {
      return { error: 'Debes ser mayor de 18 años' }
    }
  }

  try {
    await db
      .update(users)
      .set({
        name: name.trim(),
        avatarUrl: avatarUrl ? avatarUrl : null,
        fullName: fullName?.trim() || null,
        birthDate: parsedBirthDate,
        phone: phone?.trim() || null,
        altEmail: altEmail?.trim() || null,
        addressCountry: addressCountry?.trim() || null,
        addressState: addressState?.trim() || null,
        addressCity: addressCity?.trim() || null,
        gender: gender?.trim() || null,
      })
      .where(eq(users.id, session.user.id))

    revalidatePath('/perfil')
    return { success: 'Perfil actualizado exitosamente' }
  } catch (error) {
    console.error('Error updating profile:', error)
    return { error: 'Hubo un error al actualizar tu perfil' }
  }
}
