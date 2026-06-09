import { auth } from '@/lib/auth'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import AdminBlogConsole from '@/components/blog/AdminBlogConsole'
import { db } from '@/db'
import { blogPosts, users } from '@/db/schema'
import { desc, eq } from 'drizzle-orm'
import Link from 'next/link'
import { BookOpen, Calendar, User, ArrowRight, Sparkles } from 'lucide-react'

export const metadata = { title: 'Comunidad | Micasino TV Show' }

export default async function BlogPage() {
  const session = await auth()

  // Fetch all blog posts ordered by creation date descending
  const posts = await db
    .select()
    .from(blogPosts)
    .orderBy(desc(blogPosts.publishedAt))

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

  // Format date helper
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    })
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#06070b]">
      <Navbar userName={session?.user?.name} />

      <main className="flex-grow pt-24 pb-16 px-4">
        <div className="max-w-[95%] mx-auto flex flex-col gap-10">
          
          {/* Header Title */}
          <div className="flex justify-center mb-10 select-none pointer-events-none w-full">
            <img 
              src="/titulo_comunidad.png" 
              alt="Comunidad" 
              className="w-full max-w-[280px] sm:max-w-[380px] md:max-w-[480px] h-auto object-contain block" 
            />
          </div>

          {/* Collapsible Admin Console */}
          <AdminBlogConsole isDev={isDev} isRealAdmin={isRealAdmin} />

          {/* Posts Grid */}
          {posts.length === 0 ? (
            <div className="glass-card rounded-3xl p-16 text-center flex flex-col items-center justify-center border-dashed border-2 border-white/10 opacity-70">
              <BookOpen className="w-12 h-12 mb-4 text-gray-500 animate-pulse" />
              <h3 className="text-base sm:text-lg font-black text-gray-200 uppercase tracking-wider">Muro de Artículos Vacío</h3>
              <p className="text-xs sm:text-sm text-gray-400 mt-2 max-w-sm mx-auto leading-relaxed">
                Aún no hay artículos cargados en la comunidad. Si eres administrador, abre la Consola de Creación arriba para sembrar los artículos de muestra de Capture 2.
              </p>
            </div>
          ) : (
            <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8 [column-fill:_balance] text-left">
              {posts.map((post) => (
                <div 
                  key={post.id}
                  className="break-inside-avoid inline-block w-full group flex flex-col gap-4 bg-[#0b0e14]/20 border border-white/5 rounded-3xl p-5 hover:bg-[#0b0e14]/40 hover:border-yellow-500/20 transition-all duration-300 shadow-lg"
                >
                  {/* Pinterest-style Image Container showing FULL image */}
                  <div className="relative rounded-2xl overflow-hidden bg-black/60 border border-white/5">
                    <img 
                      src={post.imageUrl} 
                      alt={post.title} 
                      className="w-full h-auto object-contain group-hover:scale-[1.02] transition-transform duration-500 block"
                      loading="lazy"
                    />
                    
                    {/* Category Pill Tag */}
                    <span className="absolute top-3 left-3 px-3 py-1 rounded bg-black/70 text-[9px] font-black uppercase tracking-widest text-gray-200 border border-white/10 select-none font-mono">
                      {post.category}
                    </span>

                    {/* NEW Badge Overlay */}
                    {new Date().getTime() - new Date(post.createdAt).getTime() < 1000 * 60 * 60 * 24 * 3 && (
                      <span className="absolute bottom-3 right-3 px-3 py-1 rounded bg-red-600 text-[9px] font-black uppercase tracking-wider text-white shadow-md animate-pulse select-none">
                        NUEVO
                      </span>
                    )}
                  </div>

                  {/* Post Info */}
                  <div className="flex flex-col gap-3 flex-grow">
                    
                    {/* Metadata: Author and Date */}
                    <div className="flex items-center gap-3 text-[10px] font-bold text-gray-500 font-mono uppercase">
                      <span className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-yellow-500" />
                        {post.author}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {formatDate(post.publishedAt)}
                      </span>
                    </div>

                    <h3 className="text-base font-black leading-snug text-gray-100 group-hover:text-yellow-500 transition-colors line-clamp-2">
                      {post.title}
                    </h3>
                    
                    <p className="text-xs text-gray-400 leading-relaxed line-clamp-3">
                      {post.caption || post.content}
                    </p>

                    <Link 
                      href={`/comunidad/${post.slug}`}
                      className="w-full text-center py-2.5 rounded-xl text-xs font-black uppercase tracking-widest mt-auto bg-white/5 text-gray-300 hover:bg-yellow-500 hover:text-black hover:shadow-[0_4px_10px_rgba(245,197,24,0.25)] border border-white/5 hover:border-transparent transition-all duration-300 flex items-center justify-center gap-1.5"
                    >
                      Leer Artículo
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </main>

      <Footer />
    </div>
  )
}
