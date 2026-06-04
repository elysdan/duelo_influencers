import { auth } from '@/lib/auth'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { db } from '@/db'
import { users, showGames } from '@/db/schema'
import { eq } from 'drizzle-orm'
import Link from 'next/link'
import { HelpCircle } from 'lucide-react'

export const metadata = { 
  title: 'Juegos del Show - Reglas e Influencer Arena | Micasino TV Show',
  description: 'Descubre las reglas oficiales y disfruta de los mejores juegos de la arena de Micasino TV Show.'
}

export default async function JuegosPage() {
  const session = await auth()

  // Verify if the user is an admin
  let isAdmin = false
  if (session?.user?.id) {
    const [user] = await db
      .select({ role: users.role })
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1)
    isAdmin = user?.role === 'ADMIN'
  }

  // Fetch games from database
  let allGames = await db.select().from(showGames).orderBy(showGames.createdAt)

  // Auto-seed default games if table is empty
  if (allGames.length === 0) {
    const initialGames = [
      {
        title: 'Piedra Papel o Tijera',
        imageUrl: '/piedra_papel_tijera.png',
        hasImage: true,
        description: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since 1966, when designers at Letraset and James Mosley, the librarian at St Bride Printing Library, took a 1914 Cicero translation and scrambled it to make dummy text for Letraset's Body Type sheets.",
      },
      {
        title: 'Cuenta Relámpago',
        imageUrl: null,
        hasImage: false,
        description: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since 1966, when designers at Letraset and James Mosley, the librarian at St Bride Printing Library, took a 1914 Cicero translation and scrambled it to make dummy text for Letraset's Body Type sheets.",
      },
      {
        title: 'Batalla de Rima',
        imageUrl: null,
        hasImage: false,
        description: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since 1966, when designers at Letraset and James Mosley, the librarian at St Bride Printing Library, took a 1914 Cicero translation and scrambled it to make dummy text for Letraset's Body Type sheets.",
      },
      {
        title: 'El Parpadeo',
        imageUrl: null,
        hasImage: false,
        description: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since 1966, when designers at Letraset and James Mosley, the librarian at St Bride Printing Library, took a 1914 Cicero translation and scrambled it to make dummy text for Letraset's Body Type sheets.",
      },
    ]

    try {
      await db.insert(showGames).values(initialGames)
      allGames = await db.select().from(showGames).orderBy(showGames.createdAt)
    } catch (err) {
      console.error('Error seeding games:', err)
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#06070b] relative overflow-hidden">
      {/* Background radial glows */}
      <div className="absolute top-[10%] left-[-10%] w-[600px] h-[600px] bg-yellow-500/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[-10%] w-[600px] h-[600px] bg-yellow-500/3 rounded-full blur-[160px] pointer-events-none" />

      <Navbar userName={session?.user?.name} />

      <main className="flex-grow pt-32 pb-24 relative z-10">
        
        {/* Parent Wrapper allowing overflow for the overlapping title logo */}
        <div className="relative w-full mb-16">
          
          {/* Centered Title overlapping the top edge of the banner */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 select-none pointer-events-none w-full max-w-[280px] sm:max-w-[340px] md:max-w-[380px] flex justify-center">
            <img 
              src="/titulo_juegos.png" 
              alt="Juegos" 
              className="h-16 sm:h-20 md:h-24 lg:h-28 object-contain block drop-shadow-md" 
            />
          </div>

          {/* Hero Banner Container (with overflow-hidden for the background image crop) */}
          <div className="relative w-full overflow-hidden pt-24 pb-36 bg-[#eaeaea] h-[500px] sm:h-[680px] md:h-[880px] flex flex-col justify-center border-t border-b border-zinc-200/30">
            
            {/* Background Layer: tarjeta_roja.jpg sharp, covering the entire section */}
            <div className="absolute inset-0 z-0 select-none pointer-events-none">
              <img 
                src="/tarjeta_roja.jpg" 
                alt="Fondo Tarjeta Roja" 
                className="w-full h-full object-cover object-[center_35%]"
              />
              {/* Gradients to fade cleanly into the #eaeaea background */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#eaeaea] via-[#eaeaea]/85 md:via-[#eaeaea]/40 to-transparent z-10" />
              <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-[#eaeaea] to-transparent z-10" />
              <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[#eaeaea] to-transparent z-10" />
              <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-[#eaeaea] to-transparent z-10" />
            </div>

            {/* Content Layer (Grid) - Full screen width with left padding shifted to the right */}
            <div className="relative z-10 w-full grid grid-cols-12 gap-8 items-center pl-6 sm:pl-12 md:pl-[160px] pr-4 sm:pr-8 md:pr-12 mt-12 sm:mt-16 md:mt-24">
              {/* Left Content Column */}
              <div className="col-span-12 md:col-span-7 lg:col-span-6 flex flex-col gap-4 text-left justify-center">
                <p className="text-base sm:text-lg text-zinc-900 leading-relaxed font-bold font-sans max-w-[500px] sm:max-w-[550px] md:max-w-[580px]">
                  Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since 1966, when designers at Letraset and James Mosley, the librarian at St Bride Printing Library, took a 1914 Cicero translation and scrambled it to make dummy text for Letraset's Body Type sheets.
                </p>
              </div>

              {/* Right Column empty so the background photo's red card subject remains visible */}
              <div className="hidden md:block md:col-span-5 lg:col-span-6" />
            </div>
          </div>
        </div>

        {/* Spacing container for the games grid */}
        <div className="max-w-[95%] sm:max-w-[90%] xl:max-w-[1200px] mx-auto px-4 sm:px-6 flex flex-col gap-8 items-center">

          {/* Admin link button (if user is admin) */}
          {isAdmin && (
            <div className="w-full max-w-5xl mx-auto flex justify-center mb-2">
              <Link
                href="/admin/juegos"
                className="px-6 py-2.5 bg-yellow-500 hover:bg-yellow-400 text-black font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-md hover:scale-[1.02] flex items-center gap-2 cursor-pointer font-sans"
              >
                Administrar Juegos
              </Link>
            </div>
          )}

          {/* Grid of Dynamic Games */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 md:gap-10 w-full max-w-5xl mx-auto mt-4">
            {allGames.map((game) => (
              <Link 
                key={game.id} 
                href={`/juegos/${game.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col gap-3 group cursor-pointer"
              >
                {/* Image card container (Square aspect ratio, edge-to-edge) */}
                <div className="relative w-full aspect-square rounded-2xl sm:rounded-3xl overflow-hidden border border-zinc-200/80 bg-white hover:border-yellow-500/50 hover:shadow-lg transition-all duration-300 flex items-center justify-center">
                  {game.hasImage && game.imageUrl ? (
                    <img 
                      src={game.imageUrl} 
                      alt={game.title} 
                      className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500 block select-none pointer-events-none"
                    />
                  ) : (
                    <div className="w-full h-full bg-zinc-100 flex flex-col items-center justify-center p-6 border border-zinc-100 relative">
                      <HelpCircle className="w-12 h-12 text-zinc-400 group-hover:text-yellow-600 transition-colors duration-300" />
                      <span className="absolute bottom-4 text-[9px] font-black uppercase tracking-widest text-zinc-400 font-mono select-none">
                        PRÓXIMAMENTE
                      </span>
                    </div>
                  )}
                </div>

                {/* Title */}
                <span className="text-sm sm:text-base font-black text-center text-black group-hover:text-yellow-600 transition-colors uppercase tracking-wider leading-snug mt-1">
                  {game.title}
                </span>
              </Link>
            ))}
          </div>

        </div>
      </main>

      <Footer />
    </div>
  )
}

