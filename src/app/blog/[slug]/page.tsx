import { auth } from '@/lib/auth'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { db } from '@/db'
import { blogPosts, users } from '@/db/schema'
import { desc, eq, ne } from 'drizzle-orm'
import Link from 'next/link'
import { BookOpen, Calendar, User, ArrowLeft, ArrowRight, Star, Clock, Image as ImageIcon } from 'lucide-react'
import AdminBlogActions from '@/components/blog/AdminBlogActions'
import BlogGallery from '@/components/blog/BlogGallery'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params
  const [post] = await db
    .select({ title: blogPosts.title, caption: blogPosts.caption })
    .from(blogPosts)
    .where(eq(blogPosts.slug, resolvedParams.slug))
    .limit(1)

  if (!post) {
    return { title: 'Artículo no encontrado | Micasino TV Show' }
  }

  return {
    title: `${post.title} | Blog Micasino TV Show`,
    description: post.caption || 'Detalles oficiales y noticias del show.',
  }
}

interface PageProps {
  params: Promise<{ slug: string }>
}

export default async function BlogPostDetailPage({ params }: PageProps) {
  const session = await auth()
  const resolvedParams = await params
  const { slug } = resolvedParams

  const isDev = process.env.NODE_ENV === 'development'
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


  // 1. Fetch active blog post matching slug
  const [post] = await db
    .select()
    .from(blogPosts)
    .where(eq(blogPosts.slug, slug))
    .limit(1)

  // 2. Fetch recent posts to display in the sidebar (limit 4 to filter active one out)
  const recentPosts = await db
    .select()
    .from(blogPosts)
    .orderBy(desc(blogPosts.publishedAt))
    .limit(4)

  if (!post) {
    return (
      <div className="flex flex-col min-h-screen bg-[#06070b]">
        <Navbar userName={session?.user?.name} />
        <main className="flex-grow pt-32 pb-20 px-4 text-center flex flex-col items-center justify-center">
          <div className="glass-card rounded-3xl p-16 border border-white/5 max-w-md flex flex-col items-center gap-4">
            <BookOpen className="w-12 h-12 text-red-500 animate-pulse" />
            <h1 className="text-xl sm:text-2xl font-black text-white uppercase tracking-wider">Artículo No Encontrado</h1>
            <p className="text-sm text-gray-400 leading-relaxed">
              El artículo que intentas ver no existe en nuestro blog o ha sido retirado temporalmente.
            </p>
            <Link 
              href="/blog"
              className="mt-4 px-6 py-2.5 bg-yellow-500 hover:bg-yellow-600 text-black text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-[0_4px_10px_rgba(245,197,24,0.2)] flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" /> Volver al Blog
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  // Filter out the active post from the sidebar recent posts array to ensure at least 3 distinct ones
  const sidebarPosts = recentPosts.filter(p => p.id !== post.id).slice(0, 3)

  // Format date helper
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    })
  }

  // Split content by paragraphs
  const paragraphs = post.content.split('\n').filter(p => p.trim() !== '')

  return (
    <div className="flex flex-col min-h-screen bg-[#06070b]">
      <Navbar userName={session?.user?.name} />

      <main className="flex-grow pt-24 pb-16 px-4">
        <div className="max-w-[95%] mx-auto flex flex-col gap-6">
          
          {/* Back button */}
          <div className="z-10 text-left">
            <Link 
              href="/blog"
              className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-gray-500 hover:text-yellow-500 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Volver al Blog
            </Link>
          </div>

          {/* Main Content & Sidebar Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            
            {/* LEFT COLUMN: Main Post Details (lg:col-span-2) */}
            <div className="lg:col-span-2 flex flex-col gap-6 bg-[#0b0e14]/20 border border-white/5 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden text-left">
              {/* Decorative dynamic ambient glow */}
              <div className="absolute top-0 left-0 w-48 h-48 bg-yellow-500/5 rounded-full blur-3xl pointer-events-none" />

              {/* Admin Moderation Console */}
              {isRealAdmin && (
                <AdminBlogActions post={post} isRealAdmin={isRealAdmin} />
              )}

              {/* Title & Headers */}
              <div className="flex flex-col gap-3">
                <span className="px-3 py-1 rounded bg-yellow-500/10 text-yellow-500 text-[10px] font-black uppercase tracking-widest border border-yellow-500/20 w-max select-none font-mono">
                  {post.category}
                </span>
                
                <h1 className="font-display font-black text-2xl sm:text-4xl lg:text-5xl text-white tracking-wide uppercase leading-tight">
                  {post.title}
                </h1>

                {/* Metadata block */}
                <div className="flex flex-wrap items-center gap-4 text-xs font-mono font-bold text-gray-500 uppercase tracking-wide border-y border-white/5 py-3 mt-2">
                  <span className="flex items-center gap-1">
                    <User className="w-4 h-4 text-yellow-500 shrink-0" />
                    Por: <strong className="text-gray-300">{post.author}</strong>
                  </span>
                  <span className="hidden sm:inline text-gray-700">|</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4 shrink-0" />
                    Publicado: {formatDate(post.publishedAt)}
                  </span>
                  <span className="hidden sm:inline text-gray-700">|</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4 shrink-0" />
                    Lectura: {post.readTime}
                  </span>
                </div>
              </div>

              {/* Main Image adjusted to see full image without cropping */}
              <div className="relative rounded-2xl overflow-hidden bg-black border border-white/5 shadow-2xl max-h-[600px] flex items-center justify-center">
                <img 
                  src={post.imageUrl} 
                  alt={post.title} 
                  className="w-full h-auto max-h-[600px] object-contain rounded-2xl"
                />
              </div>

              {/* Caption / Intro Subtitle text */}
              {post.caption && (
                <div className="p-4 sm:p-5 rounded-2xl bg-yellow-500/5 border-l-4 border-yellow-500 text-sm text-gray-300 italic leading-relaxed">
                  {post.caption}
                </div>
              )}

              {/* Article content body */}
              <div className="flex flex-col gap-6 text-sm sm:text-base text-gray-300 leading-relaxed font-medium">
                {paragraphs.map((p, idx) => (
                  <p key={idx} className="text-justify font-sans">
                    {p}
                  </p>
                ))}
              </div>

              {/* Additional Images Gallery Section */}
              <BlogGallery additionalImages={post.additionalImages as string[]} />

            </div>

            {/* RIGHT COLUMN: Recent Posts Sidebar (lg:col-span-1) */}
            <div className="lg:col-span-1 flex flex-col gap-6 w-full text-left">
              
              <div className="flex items-center gap-3 border-b border-white/5 pb-3">
                <Star className="w-5 h-5 text-yellow-500 animate-pulse" />
                <h2 className="text-base font-black uppercase tracking-wider text-white">Post Recientes</h2>
              </div>

              <div className="glass-card rounded-3xl border border-white/5 bg-[#0b0e14]/40 p-6 flex flex-col gap-5 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-500/5 rounded-full blur-2xl pointer-events-none" />

                {sidebarPosts.length === 0 ? (
                  <p className="text-xs text-gray-500 italic text-center py-4">No hay otros artículos publicados de momento.</p>
                ) : (
                  <div className="flex flex-col gap-4">
                    {sidebarPosts.map((postItem) => (
                      <Link 
                        key={postItem.id}
                        href={`/blog/${postItem.slug}`}
                        className="group flex items-start gap-4 p-3 rounded-2xl border border-white/5 hover:border-yellow-500/20 hover:bg-[#0b0e14]/40 transition-all duration-300 cursor-pointer"
                      >
                        {/* Tiny Widescreen Thumbnail */}
                        <div className="relative w-16 sm:w-20 aspect-video rounded-xl overflow-hidden bg-black/60 shrink-0 border border-white/5">
                          <img 
                            src={postItem.imageUrl} 
                            alt={postItem.title} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>

                        {/* Text details */}
                        <div className="flex flex-col gap-1 min-w-0">
                          <h3 className="text-xs font-black text-gray-200 group-hover:text-yellow-500 transition-colors line-clamp-2 leading-snug">
                            {postItem.title}
                          </h3>
                          <span className="text-[8px] font-mono font-bold text-gray-500 uppercase tracking-widest mt-1">
                            {formatDate(postItem.publishedAt)}
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}

                {/* Back Link bottom */}
                <div className="border-t border-white/5 pt-4 flex justify-center">
                  <Link 
                    href="/blog"
                    className="text-[10px] font-black uppercase tracking-widest text-yellow-500 hover:text-yellow-400 transition-colors flex items-center gap-1 group"
                  >
                    Ver Todo el Blog
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>

              </div>

            </div>

          </div>

        </div>
      </main>

      <Footer />
    </div>
  )
}
