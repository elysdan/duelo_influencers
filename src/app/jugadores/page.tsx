import { auth } from '@/lib/auth'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { db } from '@/db'
import { players } from '@/db/schema'
import { desc, asc } from 'drizzle-orm'
import Link from 'next/link'
import { Flame, Sparkles } from 'lucide-react'

export const metadata = { title: 'Influencers | Micasino TV Show' }

export default async function JugadoresPage() {
  const session = await auth()
  const allPlayers = await db.select().from(players).orderBy(desc(players.hypeCount), asc(players.name))

  return (
    <>
      <Navbar userName={session?.user?.name} />
      <main className="min-h-screen pt-24 pb-16 px-4 bg-[#06070b]">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-16 text-center">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-4 bg-white/5 border border-white/5 text-[var(--yellow)] shadow-[0_0_15px_rgba(245,197,24,0.1)]">
              <Sparkles className="w-3 h-3 text-[var(--yellow)] animate-pulse" />
              El Show
            </div>
            <h1 className="font-display text-5xl sm:text-7xl lg:text-8xl tracking-wider mb-4 text-white uppercase">
              Influencers
            </h1>
            <p className="text-sm max-w-md mx-auto text-gray-400">
              Conoce a las estrellas oficiales de <strong>Micasino TV Show</strong>. Dale hype a tu favorito y apóyalo en los duelos.
            </p>
          </div>

          {/* Unified Grid of Influencers (No Soccer divisions) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {allPlayers.map((player) => (
              <Link
                key={player.id}
                href={`/jugadores/${player.id}`}
                className="glass-card group flex flex-col items-center text-center p-6 rounded-2xl hover:-translate-y-1 transition-all"
              >
                {/* Avatar with gold border hover */}
                <div
                  className="w-24 h-24 rounded-full mb-4 flex items-center justify-center text-3xl overflow-hidden relative border border-white/5 transition-all group-hover:border-[var(--yellow)] group-hover:shadow-[0_0_15px_rgba(245,197,24,0.2)] bg-[#111622]"
                >
                  {player.imageUrl ? (
                    <img src={player.imageUrl} alt={player.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-gray-500">🎰</span>
                  )}
                </div>
                
                {/* Influencer Details */}
                <p className="font-bold text-sm mb-1 text-gray-200 group-hover:text-white transition-colors">
                  {player.name}
                </p>
                <p className="text-[10px] uppercase font-bold tracking-widest text-[var(--yellow)]/60 mb-3">
                  {player.club}
                </p>
                
                {/* Hype Counter Button */}
                <div className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-white/5 border border-white/5 group-hover:bg-[var(--yellow)] group-hover:text-black transition-colors"
                  style={{ color: 'var(--yellow)' }}>
                  <Flame className="w-3.5 h-3.5 fill-current" />
                  <span>{(player.hypeCount ?? 0).toLocaleString()} Hypes</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
