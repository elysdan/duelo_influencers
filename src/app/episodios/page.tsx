import { auth } from '@/lib/auth'
import { db } from '@/db'
import { podcastEpisodes, users } from '@/db/schema'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import SmartPlayer from '@/components/podcast/SmartPlayer'
import AdminPanel from '@/components/podcast/AdminPanel'
import PodcastLibrary from '@/components/podcast/PodcastLibrary'
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

              {/* Podcast Date-Based Folder Library */}
              <PodcastLibrary episodes={episodes} activeEpisodeId={activeEpisode.id} />

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
