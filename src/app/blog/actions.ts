'use server'

import { db } from '@/db'
import { blogPosts, users } from '@/db/schema'
import { auth } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { eq } from 'drizzle-orm'

// Utility to generate dynamic slug from title
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD') // remove accents
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

export async function addBlogPost(formData: FormData) {
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
      return { error: 'No tienes permisos de administrador para añadir artículos de blog.' }
    }

    const title = formData.get('title') as string
    const caption = formData.get('caption') as string
    const content = formData.get('content') as string
    const author = (formData.get('author') as string) || 'Admin'
    const category = (formData.get('category') as string) || 'ENTREVISTA'
    const readTime = (formData.get('readTime') as string) || '3 min'
    const mainImageFile = formData.get('mainImageFile') as File | null
    const additionalImageFiles = formData.getAll('additionalImageFiles') as File[]

    if (!title || !content) {
      return { error: 'El título y el contenido del artículo son obligatorios.' }
    }

    const slug = generateSlug(title)
    if (!slug) {
      return { error: 'El título del artículo no permite generar un enlace web válido.' }
    }

    // Check if slug already exists to prevent unique violations
    const existing = await db
      .select({ id: blogPosts.id })
      .from(blogPosts)
      .where(eq(blogPosts.slug, slug))
      .limit(1)
    
    if (existing.length > 0) {
      return { error: 'Ya existe un artículo con un título muy similar. Elige un título diferente.' }
    }

    let imageUrl = '/esports_hero_bg.png' // Default thumbnail fallback

    // Process main image file upload if provided
    const hasMainUpload = mainImageFile && 
                          typeof mainImageFile === 'object' && 
                          'size' in mainImageFile && 
                          mainImageFile.size > 0 && 
                          'name' in (mainImageFile as any) &&
                          (mainImageFile as any).name !== '' &&
                          (mainImageFile as any).name !== 'undefined';

    if (hasMainUpload) {
      const fileToUpload = mainImageFile as File
      
      // Calculate current date in DDMMYY format
      const date = new Date()
      const day = String(date.getDate()).padStart(2, '0')
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const year = String(date.getFullYear()).slice(-2)
      const folderName = `${day}${month}${year}`

      const uploadDir = path.join(process.cwd(), 'uploads', 'blog-images', folderName)
      await mkdir(uploadDir, { recursive: true })

      const buffer = Buffer.from(await fileToUpload.arrayBuffer())
      const ext = path.extname(fileToUpload.name) || '.png'
      const filename = `blog-main-${Date.now()}${ext}`
      const filepath = path.join(uploadDir, filename)

      await writeFile(filepath, buffer)
      imageUrl = `/api/uploads/blog-images/${folderName}/${filename}`
    } else {
      const rawImageUrl = formData.get('imageUrl') as string
      if (rawImageUrl && rawImageUrl.trim() !== '') {
        imageUrl = rawImageUrl.trim()
      }
    }

    // Process additional images file uploads if provided
    const additionalImages: string[] = []
    
    for (let i = 0; i < additionalImageFiles.length; i++) {
      const file = additionalImageFiles[i]
      const hasUpload = file && 
                        typeof file === 'object' && 
                        'size' in file && 
                        file.size > 0 && 
                        'name' in (file as any) &&
                        (file as any).name !== '' &&
                        (file as any).name !== 'undefined';

      if (hasUpload) {
        // Calculate date folder format
        const date = new Date()
        const day = String(date.getDate()).padStart(2, '0')
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const year = String(date.getFullYear()).slice(-2)
        const folderName = `${day}${month}${year}`

        const uploadDir = path.join(process.cwd(), 'uploads', 'blog-images', folderName)
        await mkdir(uploadDir, { recursive: true })

        const buffer = Buffer.from(await file.arrayBuffer())
        const ext = path.extname(file.name) || '.png'
        const filename = `blog-add-${i}-${Date.now()}${ext}`
        const filepath = path.join(uploadDir, filename)

        await writeFile(filepath, buffer)
        additionalImages.push(`/api/uploads/blog-images/${folderName}/${filename}`)
      }
    }

    // Fallback if additional image URLs were inputted as raw strings
    const rawAdditionalImagesUrl = formData.get('additionalImagesUrl') as string
    if (rawAdditionalImagesUrl && rawAdditionalImagesUrl.trim() !== '') {
      const links = rawAdditionalImagesUrl.split(',').map(l => l.trim()).filter(l => l !== '')
      additionalImages.push(...links)
    }

    await db.insert(blogPosts).values({
      title,
      slug,
      imageUrl,
      author,
      caption: caption || null,
      content,
      additionalImages,
      category,
      readTime,
    })

    revalidatePath('/blog')
    return { success: '¡Artículo de blog publicado exitosamente!' }
  } catch (error: any) {
    console.error('Error adding blog post:', error)
    return { error: `Error interno al publicar artículo: ${error.message || 'Desconocido'}` }
  }
}

export async function seedBlogPosts() {
  try {
    const existing = await db.select({ id: blogPosts.id }).from(blogPosts).limit(1)
    if (existing.length > 0) {
      return { info: 'El blog ya cuenta con artículos de muestra precargados.' }
    }

    // Seed 3 stunning influencer tournament blog posts
    const seedData = [
      {
        title: "Hablando con 'El Rey': Sus secretos revelados",
        slug: "rey-secretos",
        imageUrl: "/gaming_room.png",
        author: "Comité Editorial Show",
        caption: "Una mirada íntima al estudio donde se forjan las mejores estrategias de la temporada.",
        content: "El campeón del torneo nos abre las puertas de su estudio para revelarnos sus secretos de juego. 'La preparación mental es el 80% del duelo', confiesa el streamer mientras muestra su setup retroiluminado con luces LED rojas. En este artículo, repasamos su rutina de entrenamiento cronometrada, las tácticas avanzadas que utiliza en cada carrera de slots y cómo maneja la presión psicológica ante las cámaras de Micasino. Él afirma que la constancia y la lectura fría de los multiplicadores son clave para mantenerse en la cima de los duelos de video.",
        additionalImages: ["/esports_hero_bg.png", "/gaming_keyboard.png"],
        category: "ENTREVISTA",
        readTime: "3 min",
      },
      {
        title: "Errores Fatales en la Ronda de Eliminación",
        slug: "errores-eliminacion",
        imageUrl: "/gaming_keyboard.png",
        author: "Staff Técnico Micasino",
        caption: "Los detalles del teclado mecánico dorado que acompañó la dramática caída de tres favoritos.",
        content: "La ronda de eliminación de esta semana dejó a todos con la boca abierta. Tres de los jugadores más populares del show fueron eliminados de forma fulminante debido a errores milimétricos en la ruleta de desempate. Analizamos paso a paso las decisiones críticas del staff, la reacción de los influencers eliminados y las estadísticas de votos de Hype que determinaron el desenlace. ¿Fue azar o un fallo de estrategia matemática? El debate sigue encendido en el foro de la comunidad, y las cosas se pondrán intensas en la siguiente ronda.",
        additionalImages: ["/gaming_room.png"],
        category: "EPISODIO 03",
        readTime: "4 min",
      },
      {
        title: "Las Penitencias más Votadas de la Semana",
        slug: "penitencias-semana",
        imageUrl: "/esports_hero_bg.png",
        author: "Moderador de Comunidad",
        caption: "Un repaso a las penitencias extremas propuestas por los foristas en la Comunidad.",
        content: "La pestaña de Comunidad ha estado más activa que nunca. Esta semana, el público votó por las penitencias más extremas para los perdedores del próximo duelo. Desde comer comida picante en vivo hasta someterse a retos de resistencia física. Repasamos las tres penitencias con más Hype de la votación oficial. Recuerda que el influencer perdedor que se niegue a cumplirlas sufrirá un descuento inmediato del 50% de sus puntos de popularidad. ¡No te pierdas el próximo episodio en vivo para ver el castigo definitivo!",
        additionalImages: ["/gaming_keyboard.png", "/gaming_room.png"],
        category: "COMUNIDAD",
        readTime: "2 min",
      }
    ]

    for (const item of seedData) {
      await db.insert(blogPosts).values(item)
    }

    revalidatePath('/blog')
    return { success: '¡Artículos de muestra precargados exitosamente!' }
  } catch (error: any) {
    console.error('Error seeding blog posts:', error)
    return { error: `Error de siembra del blog: ${error.message || 'Desconocido'}` }
  }
}

export async function editBlogPost(formData: FormData) {
  try {
    const session = await auth()
    const id = formData.get('id') as string
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
      return { error: 'No tienes permisos de administrador para editar artículos de blog.' }
    }

    if (!id) {
      return { error: 'ID de artículo no especificado.' }
    }

    // Fetch existing post
    const [existing] = await db
      .select()
      .from(blogPosts)
      .where(eq(blogPosts.id, id))
      .limit(1)

    if (!existing) {
      return { error: 'El artículo a editar no existe.' }
    }

    const title = formData.get('title') as string
    const caption = formData.get('caption') as string
    const content = formData.get('content') as string
    const author = (formData.get('author') as string) || 'Admin'
    const category = (formData.get('category') as string) || 'ENTREVISTA'
    const readTime = (formData.get('readTime') as string) || '3 min'
    const mainImageFile = formData.get('mainImageFile') as File | null
    const additionalImageFiles = formData.getAll('additionalImageFiles') as File[]

    if (!title || !content) {
      return { error: 'El título y el contenido del artículo son obligatorios.' }
    }

    const slug = generateSlug(title)
    if (!slug) {
      return { error: 'El título del artículo no permite generar un enlace web válido.' }
    }

    // Check slug uniqueness if it changed
    if (slug !== existing.slug) {
      const slugDup = await db
        .select({ id: blogPosts.id })
        .from(blogPosts)
        .where(eq(blogPosts.slug, slug))
        .limit(1)
      if (slugDup.length > 0) {
        return { error: 'Ya existe otro artículo con un título muy similar.' }
      }
    }

    let imageUrl = existing.imageUrl

    // Process main image file upload if provided
    const hasMainUpload = mainImageFile && 
                          typeof mainImageFile === 'object' && 
                          'size' in mainImageFile && 
                          mainImageFile.size > 0 && 
                          'name' in (mainImageFile as any) &&
                          (mainImageFile as any).name !== '' &&
                          (mainImageFile as any).name !== 'undefined';

    if (hasMainUpload) {
      const fileToUpload = mainImageFile as File
      
      const date = new Date()
      const day = String(date.getDate()).padStart(2, '0')
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const year = String(date.getFullYear()).slice(-2)
      const folderName = `${day}${month}${year}`

      const uploadDir = path.join(process.cwd(), 'uploads', 'blog-images', folderName)
      await mkdir(uploadDir, { recursive: true })

      const buffer = Buffer.from(await fileToUpload.arrayBuffer())
      const ext = path.extname(fileToUpload.name) || '.png'
      const filename = `blog-main-${Date.now()}${ext}`
      const filepath = path.join(uploadDir, filename)

      await writeFile(filepath, buffer)
      imageUrl = `/api/uploads/blog-images/${folderName}/${filename}`
    } else {
      const rawImageUrl = formData.get('imageUrl') as string
      if (rawImageUrl && rawImageUrl.trim() !== '') {
        imageUrl = rawImageUrl.trim()
      }
    }

    // Process additional images
    const additionalImages: string[] = []
    
    // Check if we want to preserve previous gallery images
    const keepPreviousGallery = formData.get('keepPreviousGallery') === 'true'
    if (keepPreviousGallery && Array.isArray(existing.additionalImages)) {
      additionalImages.push(...(existing.additionalImages as string[]))
    }

    for (let i = 0; i < additionalImageFiles.length; i++) {
      const file = additionalImageFiles[i]
      const hasUpload = file && 
                        typeof file === 'object' && 
                        'size' in file && 
                        file.size > 0 && 
                        'name' in (file as any) &&
                        (file as any).name !== '' &&
                        (file as any).name !== 'undefined';

      if (hasUpload) {
        const date = new Date()
        const day = String(date.getDate()).padStart(2, '0')
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const year = String(date.getFullYear()).slice(-2)
        const folderName = `${day}${month}${year}`

        const uploadDir = path.join(process.cwd(), 'uploads', 'blog-images', folderName)
        await mkdir(uploadDir, { recursive: true })

        const buffer = Buffer.from(await file.arrayBuffer())
        const ext = path.extname(file.name) || '.png'
        const filename = `blog-add-${i}-${Date.now()}${ext}`
        const filepath = path.join(uploadDir, filename)

        await writeFile(filepath, buffer)
        additionalImages.push(`/api/uploads/blog-images/${folderName}/${filename}`)
      }
    }

    const rawAdditionalImagesUrl = formData.get('additionalImagesUrl') as string
    if (rawAdditionalImagesUrl && rawAdditionalImagesUrl.trim() !== '') {
      const links = rawAdditionalImagesUrl.split(',').map(l => l.trim()).filter(l => l !== '')
      additionalImages.push(...links)
    }

    await db
      .update(blogPosts)
      .set({
        title,
        slug,
        imageUrl,
        author,
        caption: caption || null,
        content,
        additionalImages,
        category,
        readTime,
      })
      .where(eq(blogPosts.id, id))

    revalidatePath('/blog')
    revalidatePath(`/blog/${slug}`)
    if (existing.slug !== slug) {
      revalidatePath(`/blog/${existing.slug}`)
    }

    return { 
      success: '¡Artículo de blog editado exitosamente!',
      newSlug: slug 
    }
  } catch (error: any) {
    console.error('Error editing blog post:', error)
    return { error: `Error interno al editar el artículo: ${error.message || 'Desconocido'}` }
  }
}

export async function deleteBlogPost(id: string, isSimulatedAdmin: boolean) {
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

    const isAdmin = isRealAdmin || (isSimulatedAdmin && process.env.NODE_ENV === 'development')

    if (!isAdmin) {
      return { error: 'No tienes permisos de administrador para eliminar artículos de blog.' }
    }

    if (!id) {
      return { error: 'ID de artículo no especificado.' }
    }

    // Fetch slug for cache revalidation
    const [existing] = await db
      .select({ slug: blogPosts.slug })
      .from(blogPosts)
      .where(eq(blogPosts.id, id))
      .limit(1)

    if (!existing) {
      return { error: 'El artículo que intentas eliminar no existe.' }
    }

    await db.delete(blogPosts).where(eq(blogPosts.id, id))

    revalidatePath('/blog')
    revalidatePath(`/blog/${existing.slug}`)

    return { success: '¡Artículo de blog eliminado exitosamente!' }
  } catch (error: any) {
    console.error('Error deleting blog post:', error)
    return { error: `Error interno al eliminar el artículo: ${error.message || 'Desconocido'}` }
  }
}

