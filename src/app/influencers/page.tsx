import { auth } from '@/lib/auth'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { db } from '@/db'
import { players, users } from '@/db/schema'
import { desc, asc, eq } from 'drizzle-orm'
import Link from 'next/link'

export const metadata = { title: 'Influencers Oficiales | Micasino TV Show' }

export default async function JugadoresPage() {
  const session = await auth()
  const allPlayers = await db.select().from(players).orderBy(asc(players.country), asc(players.name))

  let isAdmin = false
  if (session?.user?.id) {
    const [user] = await db
      .select({ role: users.role })
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1)
    isAdmin = user?.role === 'ADMIN'
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#06070b] relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-[10%] left-[-15%] w-[600px] h-[600px] bg-yellow-500/3 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[-15%] w-[600px] h-[600px] bg-yellow-500/3 rounded-full blur-[150px] pointer-events-none" />

      <Navbar userName={session?.user?.name} />

      <main className="flex-grow pt-32 pb-24 px-4 sm:px-6 relative z-10">
        <div className="max-w-[95%] sm:max-w-[90%] xl:max-w-[1200px] mx-auto flex flex-col gap-16">

          {/* Header Title Block matching mockup minimal design */}
          <div className="text-center flex flex-col items-center gap-4">
            <div className="flex justify-center select-none pointer-events-none mb-2">
              <img
                src="/titulo_influencers.png"
                alt="Influencers"
                className="w-full max-w-[280px] sm:max-w-[380px] md:max-w-[480px] h-auto object-contain block"
              />
            </div>
            {isAdmin && (
              <Link
                href="/admin/influencers"
                className="px-6 py-2.5 bg-yellow-500 hover:bg-yellow-400 text-black font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-[0_4px_15px_rgba(245,197,24,0.2)] hover:scale-[1.02] flex items-center gap-2 mt-2"
              >
                Crear Nuevo Influencer
              </Link>
            )}
          </div>

          {/* Unified Grid of Influencers matching 4 columns on large screens */}
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8 w-full">
            {allPlayers.map((player) => {
              return (
                <Link
                  key={player.id}
                  href={`/influencers/${player.id}`}
                  className="group flex flex-col bg-[#6e6e6e] border border-white/10 rounded-2xl overflow-hidden shadow-lg hover:shadow-[0_0_30px_rgba(245,197,24,0.15)] transition-all duration-300 cursor-pointer w-full keep-text-white"
                >
                  {/* Padded Container for Image & Details */}
                  <div className="p-4 flex flex-col gap-4">
                    {/* Rectangular Grayscale portrait image with Gold Border */}
                    <div className="relative w-full aspect-[4/5] rounded-xl overflow-hidden bg-black/40 border border-[#f5c518] group-hover:border-yellow-400 transition-all duration-300">
                      {player.imageUrl ? (
                        <img
                          src={player.imageUrl}
                          alt={player.name}
                          className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-[1.02] transition-all duration-500 block"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-4xl bg-[#111622] text-gray-500">
                          🎰
                        </div>
                      )}
                    </div>

                    {/* Influencer Details aligned with mockup */}
                    <div className="flex justify-between items-center w-full gap-2">
                      <div className="text-left min-w-0">
                        <h3 className="text-sm sm:text-base font-black uppercase text-white tracking-tight line-clamp-1 leading-snug">
                          {player.name}
                        </h3>
                        <p className="text-[10px] uppercase font-bold tracking-widest text-yellow-500 mt-0.5 font-mono truncate">
                          {player.club}
                        </p>
                      </div>
                      {player.country && (
                        <div className="w-8 h-8 rounded-full overflow-hidden border border-white/10 shrink-0 shadow-md">
                          <img
                            src={`/banderas/${player.country.toLowerCase().replace(' ', '-')}.png`}
                            alt={player.country}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                    </div>
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
