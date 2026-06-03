'use server'

import { db } from '@/db'
import { podcastEpisodes } from '@/db/schema'
import { auth } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import fs from 'fs'
import { desc, count } from 'drizzle-orm'

// Utility to extract YouTube Video ID from full URL
function extractYouTubeId(url: string): string {
  if (!url) return ''
  const trimmed = url.trim()
  if (trimmed.length <= 15) return trimmed // already an ID
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/
  const match = trimmed.match(regExp)
  return match && match[2].length === 11 ? match[2] : trimmed
}

// Utility to extract Vimeo Video ID from full URL
function extractVimeoId(url: string): string {
  if (!url) return ''
  const trimmed = url.trim()
  if (trimmed.length <= 12 && /^\d+$/.test(trimmed)) return trimmed // already an ID
  const match = trimmed.match(/(?:vimeo\.com\/|player\.vimeo\.com\/video\/)(\d+)/)
  return match ? match[1] : trimmed
}

// Utility to extract DailyMotion Video ID from full URL
function extractDailyMotionId(url: string): string {
  if (!url) return ''
  const trimmed = url.trim()
  if (trimmed.length <= 10 && !trimmed.includes('/')) return trimmed // already an ID
  const match = trimmed.match(/(?:dailymotion\.com\/video\/|dai\.ly\/)([a-zA-Z0-9]+)/)
  return match ? match[1] : trimmed
}

import { eq } from 'drizzle-orm'
import { users } from '@/db/schema'

export async function addPodcastEpisode(formData: FormData) {
  try {
    const session = await auth()
    const isSimulatedAdmin = formData.get('isSimulatedAdmin') === 'true'
    
    let isRealAdmin = false
    if (session?.user?.id) {
      const [userDb] = await db
        .select({ role: users.role })
        .from(users)
        .where(eq(users.id, session.user.id))
        .limit(1)
      if (userDb?.role === 'ADMIN') {
        isRealAdmin = true
      }
    }

    const isAdmin = isRealAdmin || (isSimulatedAdmin && process.env.NODE_ENV === 'development')

    if (!isAdmin) {
      return { error: 'No tienes permisos de administrador para añadir episodios.' }
    }

    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const category = (formData.get('category') as string) || 'ENTREVISTA'
    let shortDescription = (formData.get('shortDescription') as string) || ''
    const episodeNumberStr = formData.get('episodeNumber') as string
    const rawYoutube = formData.get('youtubeUrl') as string
    const rawVimeo = formData.get('vimeoUrl') as string
    const rawDailymotion = formData.get('dailymotionUrl') as string
    const thumbnailFile = formData.get('thumbnailFile') as File | null

    if (!title || !description || !episodeNumberStr) {
      return { error: 'El título, la descripción y el número de episodio son obligatorios.' }
    }

    if (shortDescription.length > 120) {
      shortDescription = shortDescription.slice(0, 120)
    }

    const episodeNumber = parseInt(episodeNumberStr, 10)
    if (isNaN(episodeNumber)) {
      return { error: 'El número de episodio debe ser un número entero válido.' }
    }

    const youtubeId = extractYouTubeId(rawYoutube)
    const vimeoId = extractVimeoId(rawVimeo)
    const dailymotionId = extractDailyMotionId(rawDailymotion)

    let thumbnailUrl = '/cartoons/avatar-1.png' // default fallback

    // Process file upload if provided and valid
    const hasUpload = thumbnailFile && 
                      typeof thumbnailFile === 'object' && 
                      'size' in thumbnailFile && 
                      thumbnailFile.size > 0 && 
                      'name' in (thumbnailFile as any) &&
                      (thumbnailFile as any).name !== '' &&
                      (thumbnailFile as any).name !== 'undefined';

    if (hasUpload) {
      const fileToUpload = thumbnailFile as File
      
      // Format current date as DDMMYY (e.g. 270526)
      const date = new Date()
      const day = String(date.getDate()).padStart(2, '0')
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const year = String(date.getFullYear()).slice(-2)
      const folderName = `${day}${month}${year}`

      const uploadDir = path.join(process.cwd(), 'uploads', 'podcast-thumbs', folderName)
      await mkdir(uploadDir, { recursive: true })

      const buffer = Buffer.from(await fileToUpload.arrayBuffer())
      const ext = path.extname(fileToUpload.name) || '.png'
      const filename = `ep-${episodeNumber}-${Date.now()}${ext}`
      const filepath = path.join(uploadDir, filename)

      await writeFile(filepath, buffer)
      thumbnailUrl = `/api/uploads/podcast-thumbs/${folderName}/${filename}`
    } else {
      const rawThumbnailUrl = formData.get('thumbnailUrl') as string
      if (rawThumbnailUrl && rawThumbnailUrl.trim() !== '') {
        thumbnailUrl = rawThumbnailUrl.trim()
      }
    }

    await db.insert(podcastEpisodes).values({
      episodeNumber,
      title,
      description,
      shortDescription,
      category,
      thumbnailUrl,
      youtubeId: youtubeId || null,
      vimeoId: vimeoId || null,
      dailymotionId: dailymotionId || null,
    })

    revalidatePath('/episodios')
    return { success: '¡Episodio cargado exitosamente!' }
  } catch (error: any) {
    console.error('Error adding podcast episode:', error)
    return { error: `Error interno del servidor: ${error.message || 'Desconocido'}` }
  }
}

export async function seedPodcastEpisodes() {
  try {
    const session = await auth()
    let isRealAdmin = false
    if (session?.user?.id) {
      const [userDb] = await db
        .select({ role: users.role })
        .from(users)
        .where(eq(users.id, session.user.id))
        .limit(1)
      if (userDb?.role === 'ADMIN') {
        isRealAdmin = true
      }
    }

    const isAdmin = isRealAdmin || (process.env.NODE_ENV === 'development')

    if (!isAdmin) {
      return { error: 'No tienes permisos de administrador para sembrar episodios.' }
    }

    const [result] = await db.select({ count: count() }).from(podcastEpisodes)
    if (result.count > 0) {
      return { info: 'La base de datos ya cuenta con episodios cargados.' }
    }

    // Seed 3 stunning influencer podcast episodes
    const seedData = [
      {
        episodeNumber: 1,
        title: '🎰 Duelo de Titanes: Ibai Llanos vs Rubius | Gran Estreno Micasino',
        description: 'En este primer episodio del show, Ibai y Rubius se enfrentan en una serie de penitencias absurdas, revelan los secretos detrás de sus canales de streaming y confiesan qué harían con un bote millonario en Micasino. (Nota: YouTube está cargado con un ID roto a propósito para demostrar la transición automática y silenciosa a Vimeo).',
        shortDescription: 'Ibai y Rubius se enfrentan en penitencias absurdas y revelan secretos de streaming en Micasino.',
        category: 'ENTREVISTA',
        thumbnailUrl: '/cartoons/avatar-1.png',
        youtubeId: 'broken-youtube-link-test', // Will trigger fallback automatically!
        vimeoId: '76979871', // Cinematic public Vimeo video
        dailymotionId: 'x8nd58d',
      },
      {
        episodeNumber: 2,
        title: '🎲 Habilidad o Azar: El debate con Coscu y Davo Xeneize',
        description: '¿Los casinos y duelos de ruletas se ganan con estrategia matemática o es pura intuición divina? Davo Xeneize defiende sus tácticas de slots mientras Coscu relata su audacia y anécdotas de suerte en grandes casinos.',
        shortDescription: '¿Slots por estrategia o intuición? Davo Xeneize y Coscu debaten sus tácticas en vivo.',
        category: 'DEBATE',
        thumbnailUrl: '/cartoons/avatar-2.png',
        youtubeId: '90453221', // Rickroll or placeholder
        vimeoId: '338166524',
        dailymotionId: 'x8nd58d',
      },
      {
        episodeNumber: 3,
        title: '🔥 Confesiones en Vivo: Las penitencias del Staff de Influencers',
        description: 'Todo el elenco de creadores de contenido de slots, ruletas y televisión de Micasino se reúnen en la mesa de discusión. Revelan las anécdotas más virales de la temporada y el reto extremo que puso a sudar a los anfitriones.',
        shortDescription: 'El staff de influencers de Micasino revela anécdotas virales y el reto extremo de la temporada.',
        category: 'EN VIVO',
        thumbnailUrl: '/cartoons/avatar-3.png',
        youtubeId: 'dQw4w9WgXcQ', // Rickroll
        vimeoId: '76979871',
        dailymotionId: 'x8nd58d',
      }
    ]

    for (const item of seedData) {
      await db.insert(podcastEpisodes).values(item)
    }

    revalidatePath('/episodios')
    return { success: '¡Episodios de muestra sembrados exitosamente!' }
  } catch (error: any) {
    console.error('Error seeding episodes:', error)
    return { error: `Error de siembra: ${error.message || 'Desconocido'}` }
  }
}
