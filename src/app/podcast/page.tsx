import { auth } from '@/lib/auth'
import { db } from '@/db'
import { podcastEpisodes, users } from '@/db/schema'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import SmartPlayer from '@/components/podcast/SmartPlayer'
import AdminPanel from '@/components/podcast/AdminPanel'
import { desc, eq } from 'drizzle-orm'
import Link from 'next/link'
import { Mic, Sparkles, Play, Calendar, Video, Clock } from 'lucide-react'

export const metadata = { title: 'Podcast y Videos Oficiales | Micasino TV Show' }

interface PageProps {
  searchParams: Promise<{ ep?: string }>
}

export default async function PodcastPage({ searchParams }: PageProps) {
  const session = await auth()
  const resolvedParams = await searchParams
  const activeEpId = resolvedParams.ep

  // Fetch all episodes from database in descending order of episodeNumber
  const episodes = await db
    .select()
    .from(podcastEpisodes)
    .orderBy(desc(podcastEpisodes.episodeNumber))

  // Find active episode (default to the latest/first episode if not specified)
  const activeEpisode = episodes.find(e => e.id === activeEpId) || episodes[0]

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

  return (
    <div className="flex flex-col min-h-screen bg-[#06070b]">
      <Navbar userName={session?.user?.name} />
      
      <main className="flex-grow pt-24 pb-16 px-4">
        <div className="max-w-5xl mx-auto">
          
          {/* Header & Hero Section */}
          <div className="relative rounded-3xl overflow-hidden mb-8 p-8 sm:p-12 border border-white/5 bg-[#0b0e14] shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_120%,rgba(245,197,24,0.06)_0%,transparent_60%)] pointer-events-none" />
            
            {/* Left Header content */}
            <div className="flex flex-col gap-4 text-center md:text-left z-10 max-w-xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-[var(--yellow-glow)] border border-[var(--yellow)]/10 text-[var(--yellow)] w-max mx-auto md:mx-0">
                <Mic className="w-3.5 h-3.5" />
                Podcast & Videos Oficiales
              </div>
              <h1 className="font-display text-4xl sm:text-6xl tracking-wider text-white uppercase leading-none">
                El Show <span className="text-[var(--yellow)]">detrás del Show</span>
              </h1>
              <p className="text-sm text-gray-400 leading-relaxed">
                Mira las entrevistas sin censura y los duelos completos de tus streamers favoritos de <strong>Micasino TV Show</strong>. Transmisiones estables y seguras con nuestra red de servidores redundantes de video.
              </p>
            </div>

            {/* Right Mic Graphic */}
            <div className="relative shrink-0 flex items-center justify-center w-36 h-36 sm:w-44 sm:h-44 rounded-full bg-gradient-to-tr from-yellow-500/10 via-amber-500/5 to-transparent border border-[var(--yellow)]/20 shadow-[0_0_40px_rgba(245,197,24,0.08)] z-10">
              <Mic className="w-16 h-16 sm:w-20 sm:h-20 text-[var(--yellow)] drop-shadow-[0_0_20px_rgba(245,197,24,0.4)]" />
              <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[var(--yellow)] flex items-center justify-center text-[8px] text-black font-black font-mono shadow-md animate-pulse">
                REC
              </div>
            </div>
          </div>

          {/* Admin Management Panel */}
          <AdminPanel isDev={isDev} isRealAdmin={isRealAdmin} />

          {/* Main Episode Content Layout */}
          {activeEpisode ? (
            <div className="flex flex-col gap-12">
              
              {/* Active Smart Player Box */}
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3 border-b border-white/5 pb-3">
                  <Video className="w-5 h-5 text-yellow-500" />
                  <h2 className="text-base font-black uppercase tracking-wider text-white">Reproductor Inteligente Activo</h2>
                </div>
                <SmartPlayer episode={activeEpisode} />
              </div>

              {/* Grid of Other Episodes */}
              <div className="flex flex-col gap-6">
                <div className="flex items-center gap-3 border-b border-white/5 pb-3">
                  <Sparkles className="w-5 h-5 text-yellow-500" />
                  <h2 className="text-base font-black uppercase tracking-wider text-white">Episodios Publicados</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {episodes.map((ep) => {
                    const isActive = ep.id === activeEpisode.id
                    return (
                      <div
                        key={ep.id}
                        className={`glass-card rounded-2xl overflow-hidden flex flex-col hover:bg-white/[0.04] transition-all border group shadow-lg ${isActive ? 'border-yellow-500 shadow-[0_0_20px_rgba(245,197,24,0.15)] bg-yellow-500/[0.01]' : 'border-white/5'}`}
                      >
                        {/* Thumbnail image with overlay and play icon */}
                        <div className="relative aspect-video w-full bg-black/60 overflow-hidden">
                          <img
                            src={ep.thumbnailUrl}
                            alt={ep.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className={`absolute inset-0 bg-black/40 flex items-center justify-center group-hover:opacity-100 transition-opacity ${isActive ? 'opacity-100 bg-yellow-500/10' : 'opacity-0'}`}>
                            <div className={`w-12 h-12 rounded-full bg-black/80 flex items-center justify-center text-white border border-white/10 ${isActive ? 'bg-yellow-500 text-black border-transparent scale-105' : 'group-hover:scale-105 group-hover:bg-yellow-500 group-hover:text-black group-hover:border-transparent'} transition-all`}>
                              <Play className="w-5 h-5 fill-current ml-0.5" />
                            </div>
                          </div>
                          <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/80 text-[8px] font-black uppercase tracking-wider text-gray-300 font-mono">
                            EP {ep.episodeNumber}
                          </span>
                        </div>

                        {/* Card Info */}
                        <div className="p-5 flex flex-col gap-2 flex-grow">
                          <h3 className={`text-sm sm:text-base font-black leading-snug line-clamp-2 transition-colors ${isActive ? 'text-yellow-500' : 'text-gray-100 group-hover:text-yellow-500'}`}>
                            {ep.title}
                          </h3>
                          <p className="text-xs text-gray-400 line-clamp-3 leading-relaxed mt-1 flex-grow">
                            {ep.description}
                          </p>
                          
                          <Link
                            href={`/podcast?ep=${ep.id}`}
                            className={`w-full text-center py-2.5 rounded-xl text-xs font-black uppercase tracking-widest mt-4 transition-all ${isActive ? 'bg-yellow-500 text-black shadow-[0_4px_10px_rgba(245,197,24,0.2)]' : 'bg-white/5 text-gray-300 hover:bg-yellow-500 hover:text-black hover:shadow-[0_4px_10px_rgba(245,197,24,0.2)] border border-white/5 hover:border-transparent'}`}
                          >
                            {isActive ? 'Reproduciendo Ahora' : 'Ver Video'}
                          </Link>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

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
