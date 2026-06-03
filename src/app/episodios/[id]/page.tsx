import { auth } from '@/lib/auth'
import { db } from '@/db'
import { podcastEpisodes, users } from '@/db/schema'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import SmartPlayer from '@/components/podcast/SmartPlayer'
import { eq } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import { Video, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [episode] = await db
    .select({ title: podcastEpisodes.title })
    .from(podcastEpisodes)
    .where(eq(podcastEpisodes.id, id))
    .limit(1)

  return { title: `${episode?.title || 'Episodio'} | Micasino TV Show` }
}

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EpisodeDetailPage({ params }: PageProps) {
  const { id } = await params
  const session = await auth()

  // Fetch the current episode
  const [episode] = await db
    .select()
    .from(podcastEpisodes)
    .where(eq(podcastEpisodes.id, id))
    .limit(1)

  if (!episode) {
    notFound()
  }

  // Check if current user is admin
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
        <div className="max-w-5xl mx-auto flex flex-col gap-8">
          {/* Back link & Player Header */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <Link 
                href="/episodios" 
                className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-gray-400 hover:text-yellow-500 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Volver a Episodios
              </Link>
              <div className="flex items-center gap-2">
                <Video className="w-4 h-4 text-yellow-500 animate-pulse" />
                <span className="text-xs font-black uppercase tracking-widest text-white">Reproductor Oficial</span>
              </div>
            </div>
            <SmartPlayer episode={episode} isAdmin={isRealAdmin} />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

