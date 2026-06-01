import { auth } from '@/lib/auth'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

export const metadata = { title: 'Tabla de Clasificación Oficial | Micasino TV Show' }

export default async function ClasificacionPage() {
  const session = await auth()

  // Dynamic ranking images served from root /uploads path
  const topRankingImage = '/api/uploads/ranking-images/e78e5b0170e574ce9dfe03e43b55f6a23335ea2d.png'
  const bottomRankingImage = '/api/uploads/ranking-images/fa9af7c81095a7638d4c3b60cd462f5a0e288512.png'

  return (
    <div className="flex flex-col min-h-screen bg-[#06070b] relative overflow-hidden">
      {/* Background Decorative Glow Orbs */}
      <div className="absolute top-[20%] left-[-10%] w-[500px] h-[500px] bg-yellow-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[30%] right-[-10%] w-[600px] h-[600px] bg-yellow-500/3 rounded-full blur-[150px] pointer-events-none" />
      
      <Navbar userName={session?.user?.name} />

      <main className="flex-grow pt-32 pb-24 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-[95%] sm:max-w-[90%] xl:max-w-[1200px] mx-auto flex flex-col gap-12 text-center">
          
          {/* Header Title Block with Gold Accent */}
          <div className="flex flex-col gap-4 items-center">
            <div className="w-16 h-[2px] bg-gradient-to-r from-transparent via-yellow-500 to-transparent mb-1" />
            <h1 className="font-display font-black text-4xl sm:text-6xl lg:text-7xl text-white tracking-widest uppercase leading-none">
              CLASIFICACIÓN
            </h1>
            <p className="text-xs sm:text-sm text-gray-400 max-w-2xl mx-auto leading-relaxed px-4">
              Conoce a las estrellas de los esports y el entretenimiento. Jugadores profesionales, streamers y personalidades que dominan la escena.
            </p>
          </div>

          {/* Staked Dynamic High-Fidelity Ranking Boards */}
          <div className="flex flex-col gap-12 w-full items-center">
            
            {/* Top Widescreen Board: Country Standings */}
            <div className="w-full relative rounded-2xl overflow-hidden bg-black/60 border border-white/5 shadow-2xl hover:border-yellow-500/20 hover:shadow-[0_0_40px_rgba(245,197,24,0.15)] hover:scale-[1.01] transition-all duration-500 group">
              <div className="absolute inset-0 bg-gradient-to-t from-yellow-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              <img 
                src={topRankingImage} 
                alt="Tabla General de Clasificación de Países" 
                className="w-full h-auto object-contain block relative z-10"
                loading="eager"
              />
            </div>

            {/* Bottom Widescreen Board: Group Positions Calendar */}
            <div className="w-full relative rounded-2xl overflow-hidden bg-black/60 border border-white/5 shadow-2xl hover:border-yellow-500/20 hover:shadow-[0_0_40px_rgba(245,197,24,0.15)] hover:scale-[1.01] transition-all duration-500 group">
              <div className="absolute inset-0 bg-gradient-to-t from-yellow-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              <img 
                src={bottomRankingImage} 
                alt="Rank de Posiciones y Calendario Semanal" 
                className="w-full h-auto object-contain block relative z-10"
                loading="lazy"
              />
            </div>

          </div>

        </div>
      </main>

      <Footer />
    </div>
  )
}

