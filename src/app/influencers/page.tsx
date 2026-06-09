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

  // Group players by country/nationality (normalized to uppercase for case-insensitive grouping)
  const playersByCountry: { [key: string]: typeof allPlayers } = {}
  allPlayers.forEach((player) => {
    const countryKey = player.country ? player.country.trim().toUpperCase() : 'COLOMBIA'
    if (!playersByCountry[countryKey]) {
      playersByCountry[countryKey] = []
    }
    playersByCountry[countryKey].push(player)
  })

  // Sort countries alphabetically
  const sortedCountries = Object.keys(playersByCountry).sort((a, b) => a.localeCompare(b))

  // Assign a stable global index based on alphabetical rendering order for consistent style cycling
  let globalIndexCounter = 0
  const countriesWithPlayers = sortedCountries.map((countryName) => {
    const groupPlayers = playersByCountry[countryName].map((player) => {
      const playerWithIndex = {
        ...player,
        globalIndex: globalIndexCounter,
      }
      globalIndexCounter++
      return playerWithIndex
    })
    return {
      countryName,
      players: groupPlayers,
    }
  })

  // Define 6 card color schemes from the design mockup: Turquoise, Blue, Green, Yellow, Red/Rust, Purple
  const cardColors = [
    {
      // 1. Turquoise (Venezuela)
      bg: '#113a47',
      border: '#00d2ff',
      glow: 'rgba(0, 210, 255, 0.18)',
    },
    {
      // 2. Blue (Costa Rica)
      bg: '#0d233a',
      border: '#3a86c8',
      glow: 'rgba(58, 134, 200, 0.18)',
    },
    {
      // 3. Green (Colombia)
      bg: '#113520',
      border: '#00e676',
      glow: 'rgba(0, 230, 118, 0.18)',
    },
    {
      // 4. Yellow (Argentina)
      bg: '#3d300c',
      border: '#f1c40f',
      glow: 'rgba(241, 196, 15, 0.18)',
    },
    {
      // 5. Red/Rust (Chile)
      bg: '#472216',
      border: '#ff6b4a',
      glow: 'rgba(255, 107, 74, 0.18)',
    },
    {
      // 6. Purple (Ecuador)
      bg: '#251b40',
      border: '#9d4edd',
      glow: 'rgba(157, 78, 221, 0.18)',
    },
  ]

  const getFlagUrl = (countryName: string) => {
    const normalized = countryName
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/(^_|_$)+/g, '')

    return `/banderas/cabecera_de_influencers/${normalized}.png`
  }

  const getCountryTextColor = (countryName: string) => {
    const normalized = countryName
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/(^_|_$)+/g, '')

    const whiteTextCountries = ['venezuela', 'colombia', 'costa_rica', 'ecuador']

    if (whiteTextCountries.includes(normalized)) {
      return 'text-white'
    } else {
      return 'text-black'
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#06070b] relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-[10%] left-[-15%] w-[600px] h-[600px] bg-yellow-500/3 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[-15%] w-[600px] h-[600px] bg-yellow-500/3 rounded-full blur-[150px] pointer-events-none" />

      <Navbar userName={session?.user?.name} />

      <main className="flex-grow pt-24 pb-16 px-4 sm:px-6 relative z-10">
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

          {/* Country Groups Grid - 2 columns on desktop */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
            {countriesWithPlayers.map(({ countryName, players: groupPlayers }) => {
              return (
                <div
                  key={countryName}
                  className="flex flex-col bg-[#111622]/40 rounded-2xl overflow-hidden border border-white/5 backdrop-blur-sm shadow-xl"
                >
                  {/* Country Flag Banner */}
                  <div className="relative h-12 w-full overflow-hidden flex items-center justify-end px-6 select-none pointer-events-none keep-text-white">
                    <img
                      src={getFlagUrl(countryName)}
                      alt={countryName}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    <span className={`relative z-10 font-sans font-black text-sm sm:text-base md:text-lg tracking-widest uppercase ${getCountryTextColor(countryName)}`}>
                      {countryName}
                    </span>
                  </div>

                  {/* Influencers Cards Grid - 2 columns */}
                  <div className="p-4 sm:p-6 grid grid-cols-2 gap-4 sm:gap-6">
                    {groupPlayers.map((player) => {
                      // Cycle through the 6 colors in pairs of 2 using globalIndex
                      const style = cardColors[Math.floor(player.globalIndex / 2) % 6]

                      return (
                        <Link
                          key={player.id}
                          href={`/influencers/${player.id}`}
                          className="group flex flex-col border-2 rounded-2xl overflow-hidden transition-all duration-300 cursor-pointer w-full hover:scale-[1.02] hover:-translate-y-1 keep-text-white"
                          style={{
                            backgroundColor: style.bg,
                            borderColor: style.border,
                            boxShadow: `0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 0 15px ${style.glow}`,
                          }}
                        >
                          {/* Dark top header bar without text */}
                          <div className="h-6 w-full bg-black/40 border-b border-white/5" />
                          {/* Padded Container for Image & Details */}
                          <div className="p-3 sm:p-4 flex flex-col gap-3 sm:gap-4">
                            {/* Portrait Image */}
                            <div className="relative w-full aspect-[4/5] rounded-xl overflow-hidden bg-black/40 border border-white/10 group-hover:border-white/20 transition-all duration-300">
                              {player.imageUrl ? (
                                <img
                                  src={player.imageUrl}
                                  alt={player.name}
                                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500 block"
                                  loading="lazy"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-4xl bg-black/30 text-gray-500">
                                  🎰
                                </div>
                              )}
                            </div>

                            {/* Details */}
                            <div className="text-left min-w-0 flex flex-col gap-1">
                              <h3 className="text-sm sm:text-base font-sans font-black uppercase text-white tracking-wide line-clamp-1 leading-snug">
                                {player.name}
                              </h3>
                              <p className="text-[10px] sm:text-xs uppercase font-extrabold tracking-widest text-[#f5c518] font-mono truncate">
                                {player.club}
                              </p>
                            </div>
                          </div>
                        </Link>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>

        </div>
      </main>

      <Footer />
    </div>
  )
}
