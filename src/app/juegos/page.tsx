import { auth } from '@/lib/auth'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { HelpCircle, Zap, Mic2, Eye } from 'lucide-react'

export const metadata = { 
  title: 'Juegos del Show - Reglas e Influencer Arena | Micasino TV Show',
  description: 'Descubre las reglas oficiales y disfruta de los mejores juegos de la arena de Micasino TV Show.'
}

export default async function JuegosPage() {
  const session = await auth()

  const games = [
    {
      id: 'piedra-papel-tijera',
      title: 'Piedra Papel o Tijera',
      imageUrl: '/piedra_papel_tijera.png',
      hasImage: true,
    },
    {
      id: 'cuenta-relampago',
      title: 'Cuenta Relámpago',
      imageUrl: null,
      icon: Zap,
      hasImage: false,
    },
    {
      id: 'batalla-rima',
      title: 'Batalla de Rima',
      imageUrl: null,
      icon: Mic2,
      hasImage: false,
    },
    {
      id: 'el-parpadeo',
      title: 'El Parpadeo',
      imageUrl: null,
      icon: Eye,
      hasImage: false,
    },
  ]

  return (
    <div className="flex flex-col min-h-screen bg-[#06070b] relative overflow-hidden text-white">
      {/* Background radial glows for immersive casino experience */}
      <div className="absolute top-[10%] left-[-10%] w-[600px] h-[600px] bg-yellow-500/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[-10%] w-[600px] h-[600px] bg-red-600/3 rounded-full blur-[160px] pointer-events-none" />

      <Navbar userName={session?.user?.name} />

      <main className="flex-grow pt-32 pb-24 px-4 sm:px-6 relative z-10">
        <div className="max-w-[95%] sm:max-w-[90%] xl:max-w-[1200px] mx-auto flex flex-col gap-16 mt-8">
          
          {/* Expert Horizontal Web Hero Banner Block with overlapping JUEGOS logo */}
          <div className="relative w-full max-w-6xl mx-auto aspect-[2.39/1] min-h-[340px] sm:min-h-[400px] md:min-h-[450px] rounded-3xl border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.8)] flex items-center mb-6 group bg-[#06070b]">
            
            {/* Top Center Element: JUEGOS logo text perfectly centered, bleeding past the top edge */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 select-none pointer-events-none w-full max-w-[280px] sm:max-w-[340px] md:max-w-[380px] flex justify-center">
              <img 
                src="/titulo_juegos.png" 
                alt="Juegos" 
                className="h-16 sm:h-20 md:h-24 lg:h-28 object-contain block drop-shadow-[0_12px_24px_rgba(245,197,24,0.4)]" 
              />
            </div>

            {/* Background Layer: tarjeta_roja.jpg heavily blurred and darkened */}
            <div className="absolute inset-0 z-0 rounded-3xl overflow-hidden select-none pointer-events-none">
              <img 
                src="/tarjeta_roja.jpg" 
                alt="Blurred Background" 
                className="w-full h-full object-cover blur-3xl scale-110 opacity-35"
              />
              {/* Cinematic Vignette/Dark Overlay */}
              <div className="absolute inset-0 bg-[#06070b]/65 bg-gradient-to-r from-black via-black/80 to-transparent" />
            </div>

            {/* Content Layer (Grid) */}
            <div className="relative z-10 w-full h-full grid grid-cols-12 gap-8 items-center px-8 sm:px-12 md:px-16 py-8">
              
              {/* Left Content Column (Rules/Reglas text) */}
              <div className="col-span-12 md:col-span-7 flex flex-col gap-4 text-left justify-center h-full">
                <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-[#F5C518] uppercase tracking-wider font-display drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)] font-sans">
                  REGLAS
                </h2>
                <p className="text-xs sm:text-sm md:text-base text-gray-300 leading-relaxed font-normal font-sans max-w-lg drop-shadow-[0_1px_4px_rgba(0,0,0,0.6)]">
                  Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since 1966, when designers at Letraset and James Mosley, the librarian at St Bride Printing Library, took a 1914 Cicero translation and scrambled it to make dummy text for Letraset's Body Type sheets.
                </p>
              </div>

              {/* Right Content Column (Crisp tarjeta_roja.jpg asset positioned center-right) */}
              <div className="col-span-12 md:col-span-5 flex justify-center md:justify-end items-center h-full relative">
                <div className="w-[85%] sm:w-[75%] md:w-full max-w-[260px] sm:max-w-[290px] md:max-w-[310px] aspect-[3/4] rounded-2xl overflow-hidden border border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.8)] hover:scale-[1.01] transition-transform duration-500 relative">
                  <img 
                    src="/tarjeta_roja.jpg" 
                    alt="Reglas - Tarjeta Roja" 
                    className="w-full h-full object-cover block"
                  />
                  {/* Subtle dark bottom gradient overlay to blend seamlessly */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
                </div>
              </div>

            </div>
          </div>

          {/* Section 2: JUEGOS Title Right-Aligned */}
          <div className="w-full max-w-6xl mx-auto flex justify-end mt-4">
            <h2 className="text-2xl sm:text-3xl font-black text-[#F5C518] uppercase tracking-wider font-display font-sans">
              JUEGOS
            </h2>
          </div>

          {/* Section 3: Row of 4 Cards (Piedra Papel o Tijera + 3 Gray Placeholders) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 w-full max-w-6xl mx-auto">
            {games.map((game) => {
              const IconComponent = game.icon;

              return (
                <div key={game.id} className="flex flex-col gap-4 group cursor-pointer">
                  {/* Vertical card container with rounded corners and aspect-ratio */}
                  <div className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden border border-white/5 bg-[#0b0e14]/40 hover:border-yellow-500/20 hover:shadow-[0_0_30px_rgba(245,197,24,0.15)] transition-all duration-300 flex items-center justify-center">
                    
                    {game.hasImage && game.imageUrl ? (
                      <img 
                        src={game.imageUrl} 
                        alt={game.title} 
                        className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500 block"
                      />
                    ) : (
                      /* High-fidelity premium dark placeholder styling with icon and micro-glow */
                      <div className="w-full h-full bg-[#1b1c22]/40 bg-gradient-to-br from-[#16181d] to-[#0c0d12] flex flex-col items-center justify-center p-6 border border-white/5 relative">
                        {IconComponent && (
                          <IconComponent className="w-12 h-12 text-gray-600 group-hover:text-yellow-500/70 transition-colors duration-300" />
                        )}
                        <span className="absolute bottom-4 text-[9px] font-black uppercase tracking-widest text-gray-600 font-mono">
                          PRÓXIMAMENTE
                        </span>
                      </div>
                    )}

                    {/* Shadow overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
                  </div>

                  {/* Title centered below the card */}
                  <span className="text-xs sm:text-sm font-black text-center text-gray-200 group-hover:text-yellow-500 transition-colors uppercase tracking-widest leading-snug">
                    {game.title}
                  </span>
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
