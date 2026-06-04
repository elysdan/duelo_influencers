import { notFound } from 'next/navigation'
import { db } from '@/db'
import { players, newsItems, users } from '@/db/schema'
import { eq, desc, ilike, or, and, sql } from 'drizzle-orm'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { auth } from '@/lib/auth'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import ClipGrid from '@/components/players/ClipGrid'
import InfluencerProfileDetails from '@/components/players/InfluencerProfileDetails'
import PlayerFeaturedVideo from '@/components/players/PlayerFeaturedVideo'

const POSITION_LABELS: Record<string, string> = {
  POR: 'Slots Creator', DEF: 'Roulette Creator', MED: 'Live Show Host', DEL: 'VIP Player', ENT: 'TV Show Host'
}
const POSITION_COLORS: Record<string, string> = {
  POR: 'var(--yellow)', DEF: '#3b82f6', MED: '#8b5cf6', DEL: '#ef4444', ENT: '#a3a3a3'
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [player] = await db.select({ name: players.name }).from(players).where(eq(players.id, id)).limit(1)
  return { title: `${player?.name || 'Influencer'} | Micasino TV Show` }
}

export default async function PlayerProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  const currentUserId = session?.user?.id

  // Fetch Player and Hype Status
  const [player] = await db
    .select({
      id: players.id,
      name: players.name,
      position: players.position,
      club: players.club,
      number: players.number,
      imageUrl: players.imageUrl,
      bio: players.bio,
      goals: players.goals,
      assists: players.assists,
      caps: players.caps,
      hypeCount: players.hypeCount,
      age: players.age,
      gender: players.gender,
      clips: players.clips,
      videoUrl: players.videoUrl,
      country: players.country,
      hasHyped: currentUserId
        ? sql<boolean>`CASE WHEN (SELECT 1 FROM player_hypes ph WHERE ph.player_id = ${players.id} AND ph.user_id = ${currentUserId}) = 1 THEN true ELSE false END`.as('has_hyped')
        : sql<boolean>`false`.as('has_hyped')
    })
    .from(players)
    .where(eq(players.id, id))
    .limit(1)

  if (!player) notFound()

  let isAdmin = false
  if (currentUserId) {
    const [user] = await db
      .select({ role: users.role })
      .from(users)
      .where(eq(users.id, currentUserId))
      .limit(1)
    isAdmin = user?.role === 'ADMIN'
  }

  // Fetch News dynamically using player name
  const nameParts = player.name.split(' ')
  const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : player.name

  const relatedNews = await db
    .select()
    .from(newsItems)
    .where(or(ilike(newsItems.title, `%${lastName}%`), ilike(newsItems.excerpt, `%${lastName}%`)))
    .orderBy(desc(newsItems.publishedAt))
    .limit(3)

  const displayNews = relatedNews.length > 0 ? relatedNews : await db.select().from(newsItems).orderBy(desc(newsItems.publishedAt)).limit(3)

  return (
    <>
      <Navbar userName={session?.user?.name} />

      <main className="min-h-screen bg-[#eaeaea] text-[#1a1a1a] pt-24 pb-16 px-4 overflow-hidden relative">

        <div className="max-w-4xl mx-auto relative z-10">

          <Link
            href="/influencers"
            className="inline-flex items-center gap-2 text-sm mb-8 transition-colors hover:text-black text-zinc-500 font-bold"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a Influencers
          </Link>

          <div className="flex flex-col gap-10">

            {/* ====== Row 1 & 2: Details & Admin Edit Form ====== */}
            <InfluencerProfileDetails player={player} isAdmin={isAdmin} />

            {/* ====== Row 2.5: Featured Presentation Video ====== */}
            <PlayerFeaturedVideo playerId={player.id} videoUrl={player.videoUrl} isAdmin={isAdmin} />

            {/* ====== Row 3: Clips Grid ====== */}
            <ClipGrid
              playerName={player.name}
              playerId={player.id}
              isAdmin={isAdmin}
              initialClips={player.clips || []}
            />

          </div>
        </div>
      </main>

      <Footer />
    </>
  )
}
