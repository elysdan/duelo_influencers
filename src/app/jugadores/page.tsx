import { auth } from '@/lib/auth'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { db } from '@/db'
import { players } from '@/db/schema'
import { desc, asc } from 'drizzle-orm'
import Link from 'next/link'

export const metadata = { title: 'Influencers Oficiales | Micasino TV Show' }

export default async function JugadoresPage() {
  const session = await auth()
  const allPlayers = await db.select().from(players).orderBy(desc(players.hypeCount), asc(players.name))

  return (
    <div className="flex flex-col min-h-screen bg-[#06070b] relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-[10%] left-[-15%] w-[600px] h-[600px] bg-yellow-500/3 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[-15%] w-[600px] h-[600px] bg-yellow-500/3 rounded-full blur-[150px] pointer-events-none" />

      <Navbar userName={session?.user?.name} />

      <main className="flex-grow pt-32 pb-24 px-4 sm:px-6 relative z-10">
        <div className="max-w-[95%] sm:max-w-[90%] xl:max-w-[1200px] mx-auto flex flex-col gap-16">

          {/* Header Title Block matching mockup minimal design */}
          <div className="text-center">
            <h1 className="font-display font-black text-5xl sm:text-7xl lg:text-8xl tracking-widest text-white uppercase select-none leading-none">
              INFLUENCERS
            </h1>
          </div>

          {/* Unified Grid of Influencers matching 4 columns on large screens */}
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8 w-full">
            {allPlayers.map((player) => {
              // Generate cyber/gold IDs dynamically (e.g. ID: MED-010)
              const playerPos = player.position || 'INF'
              const playerNum = String(player.number || 0).padStart(3, '0')
              const customId = `ID: ${playerPos}-${playerNum}`

              return (
                <Link
                  key={player.id}
                  href={`/jugadores/${player.id}`}
                  className="group flex flex-col bg-[#0b0e14]/40 border border-white/5 rounded-2xl p-4 sm:p-5 hover:bg-[#0b0e14]/70 hover:border-yellow-500/20 hover:shadow-[0_0_30px_rgba(245,197,24,0.12)] transition-all duration-300 cursor-pointer"
                >

                  {/* Rectangular Grayscale portrait image with fine Gold Border */}
                  <div className="relative w-full aspect-[4/5] rounded-xl overflow-hidden bg-black/40 border border-white/10 group-hover:border-yellow-500/30 transition-all duration-300">
                    {player.imageUrl ? (
                      <img
                        src={player.imageUrl}
                        alt={player.name}
                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-[1.03] transition-all duration-500 block"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl bg-[#111622] text-gray-500">
                        🎰
                      </div>
                    )}
                  </div>

                  {/* Influencer Details aligned with mockup */}
                  <div className="mt-4 text-left">
                    <h3 className="text-sm sm:text-base font-black uppercase text-gray-200 group-hover:text-yellow-500 transition-colors line-clamp-1 leading-snug">
                      {player.name}
                    </h3>
                    <p className="text-[10px] uppercase font-bold tracking-widest text-yellow-500/60 mt-0.5 font-mono">
                      {player.club}
                    </p>
                  </div>
                </Link>
              )
            })}
          </div>

        </div>
      </main>

      <Footer />
    </div>
  )
}

