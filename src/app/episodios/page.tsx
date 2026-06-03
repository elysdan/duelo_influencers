import { auth } from '@/lib/auth'
import { db } from '@/db'
import { podcastEpisodes, users } from '@/db/schema'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import AdminPanel from '@/components/podcast/AdminPanel'
import { desc, eq } from 'drizzle-orm'
import Link from 'next/link'
import { Mic } from 'lucide-react'

export const metadata = { title: 'Episodios Oficiales | Micasino TV Show' }

interface PageProps {
  searchParams: Promise<{ ep?: string }>
}

export default async function PodcastPage({ searchParams }: PageProps) {
  const session = await auth()

  // Fetch all episodes from database in descending order of episodeNumber
  const episodes = await db
    .select()
    .from(podcastEpisodes)
    .orderBy(desc(podcastEpisodes.episodeNumber))

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

  // Helper to check if an episode is new (created in the last 3 days)
  const isNewEpisode = (createdAt: Date) => {
    const now = new Date()
    const diffTime = now.getTime() - new Date(createdAt).getTime()
    const diffDays = diffTime / (1000 * 60 * 60 * 24)
    return diffDays <= 3
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#06070b]">
      <Navbar userName={session?.user?.name} />
      
      <main className="flex-grow pt-24 pb-16 px-4">
        <div className="max-w-5xl mx-auto">
          
          {/* Header Image */}
          <div className="flex justify-center mb-10">
            <img 
              src="/logo_episodios.png" 
              alt="Episodios" 
              className="h-20 sm:h-28 w-auto object-contain drop-shadow-[0_0_15px_rgba(245,197,24,0.1)]"
            />
          </div>

          {/* Admin Management Panel */}
          <AdminPanel isDev={isDev} isRealAdmin={isRealAdmin} />

          {/* Main Episode Content Layout */}
          {episodes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-12">
              {episodes.map((ep) => (
                <Link 
                  key={ep.id} 
                  href={`/episodios/${ep.id}`} 
                  target="_blank" 
                  className="group flex flex-col gap-4 focus:outline-none"
                >
                  {/* Thumbnail Image Wrapper */}
                  <div className="relative aspect-[16/9] w-full rounded-none overflow-hidden bg-black border border-white/10 group-hover:border-yellow-500/30 transition-all duration-300 isolate">
                    <img 
                      src={ep.thumbnailUrl} 
                      alt={ep.title} 
                      className="w-full h-full object-contain rounded-none group-hover:scale-[1.02] transition-transform duration-500"
                    />
                    
                    {/* Category badge */}
                    <span className="absolute top-0 left-0 bg-white text-black text-[10px] font-black uppercase tracking-widest px-4 py-2 shadow-md animate-fade-in rounded-none">
                      {ep.category}
                    </span>

                    {/* Nuevo badge */}
                    {isNewEpisode(ep.createdAt) && (
                      <span className="absolute bottom-0 right-0 bg-[#e11d48] text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 shadow-md rounded-none">
                        NUEVO
                      </span>
                    )}
                  </div>

                  {/* Title & Brief Description */}
                  <div className="flex flex-col gap-2">
                    <h3 className="text-lg font-black text-white leading-snug group-hover:text-yellow-500 transition-colors duration-200">
                      {ep.title}
                    </h3>
                    <p className="text-sm text-gray-400 leading-relaxed line-clamp-2">
                      {ep.shortDescription || ep.description}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            // Empty State
            <div className="glass-card rounded-3xl p-16 text-center flex flex-col items-center justify-center border-dashed border-2 border-white/10 opacity-70">
              <Mic className="w-12 h-12 mb-4 text-gray-500 animate-pulse" />
              <h3 className="text-base sm:text-lg font-black text-gray-200 uppercase tracking-wider">Muro de Videos Vacío</h3>
              <p className="text-xs sm:text-sm text-gray-400 mt-2 max-w-sm mx-auto leading-relaxed">
                Aún no hay videos cargados para este show. Si eres desarrollador o administrador, abre la Consola de Carga arriba para sembrar los episodios de prueba.
              </p>
            </div>
          )}

        </div>
      </main>

      <Footer />
    </div>
  )
}

