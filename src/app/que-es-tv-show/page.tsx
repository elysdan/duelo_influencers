import { auth } from '@/lib/auth'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Link from 'next/link'
import { Tv, Sparkles, Gamepad2, Award, ShieldAlert, MessageSquare, Play, Users } from 'lucide-react'

export const metadata = { title: '¿Qué es Micasino TV Show? | Canal de Entretenimiento Oficial' }

export default async function QueEsTvShowPage() {
  const session = await auth()

  return (
    <div className="flex flex-col min-h-screen bg-[#06070b]">
      <Navbar userName={session?.user?.name} />

      <main className="flex-grow pt-24 pb-16 px-4">
        <div className="max-w-4xl mx-auto flex flex-col gap-12">
          
          {/* Hero Header */}
          <div className="relative rounded-3xl overflow-hidden p-8 sm:p-12 border border-white/5 bg-[#0b0e14] shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8">
            {/* Ambient Background Gold Glow */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_120%,rgba(245,197,24,0.06)_0%,transparent_60%)] pointer-events-none" />
            
            <div className="flex flex-col gap-4 text-center md:text-left z-10 max-w-xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-[var(--yellow-glow)] border border-[var(--yellow)]/10 text-[var(--yellow)] w-max mx-auto md:mx-0">
                <Tv className="w-3.5 h-3.5" />
                El Canal Oficial del Show
              </div>
              <h1 className="font-display text-4xl sm:text-6xl tracking-wider text-white uppercase leading-none">
                ¿Qué es <span className="text-[var(--yellow)]">Micasino TV Show</span>?
              </h1>
              <p className="text-sm text-gray-400 leading-relaxed">
                Descubre el fenómeno del entretenimiento interactivo donde tus creadores de contenido favoritos se enfrentan en duelos épicos de habilidad, azar y penitencias extremas.
              </p>
            </div>

            {/* Glowing Icon */}
            <div className="relative shrink-0 flex items-center justify-center w-36 h-36 sm:w-44 sm:h-44 rounded-full bg-gradient-to-tr from-yellow-500/10 via-amber-500/5 to-transparent border border-[var(--yellow)]/20 shadow-[0_0_40px_rgba(245,197,24,0.08)] z-10">
              <Tv className="w-16 h-16 sm:w-20 sm:h-20 text-[var(--yellow)] drop-shadow-[0_0_20px_rgba(245,197,24,0.4)]" />
              <div className="absolute top-2 right-2 w-3.5 h-3.5 rounded-full bg-green-500 flex items-center justify-center shadow-lg animate-pulse" />
            </div>
          </div>

          {/* Section 1: The Concept */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
            
            <div className="glass-card rounded-3xl p-6 sm:p-8 border border-white/5 bg-[#0b0e14]/40 flex flex-col gap-4 justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-500/5 rounded-full blur-2xl pointer-events-none" />
              <div className="flex flex-col gap-3">
                <div className="w-10 h-10 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center text-yellow-500">
                  <Gamepad2 className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-black uppercase text-white tracking-wide">La Arena del Duelo</h2>
                <p className="text-xs sm:text-sm text-gray-400 leading-relaxed text-justify">
                  Micasino TV Show es un espacio masivo interactivo que reúne a los streamers e influencers más audaces del continente. Aquí no hay libretos: los participantes compiten en tiempo real en una serie de micro-desafíos diseñados para poner a prueba su temple, su carisma y su suerte ante el gran público.
                </p>
              </div>
              <span className="text-[9px] font-mono font-bold text-yellow-500/60 uppercase tracking-widest mt-2">
                🎰 100% Impredecible
              </span>
            </div>

            <div className="glass-card rounded-3xl p-6 sm:p-8 border border-white/5 bg-[#0b0e14]/40 flex flex-col gap-4 justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-500/5 rounded-full blur-2xl pointer-events-none" />
              <div className="flex flex-col gap-3">
                <div className="w-10 h-10 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center text-yellow-500">
                  <Award className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-black uppercase text-white tracking-wide">Las Dinámicas</h2>
                <p className="text-xs sm:text-sm text-gray-400 leading-relaxed text-justify">
                  Desde intensas carreras de slots y multiplicadores matemáticos, hasta ruletas de la verdad y retos físicos absurdos. El perdedor de cada duelo se somete a penitencias en vivo, garantizando que cada episodio esté repleto de risas, emoción y drama genuino.
                </p>
              </div>
              <span className="text-[9px] font-mono font-bold text-yellow-500/60 uppercase tracking-widest mt-2">
                🏆 Gloria y Penitencias
              </span>
            </div>

          </div>

          {/* Section 2: Gamified Pillars */}
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-3 border-b border-white/5 pb-3">
              <Sparkles className="w-5 h-5 text-yellow-500" />
              <h2 className="text-base font-black uppercase tracking-wider text-white">Nuestros Pilares</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              
              {/* Pillar 1 */}
              <div className="glass-card rounded-2xl p-5 border border-white/5 hover:border-yellow-500/20 transition-all flex flex-col gap-3">
                <div className="w-8 h-8 rounded-lg bg-yellow-500/10 flex items-center justify-center text-yellow-500 text-sm font-bold">1</div>
                <h3 className="text-sm font-black text-white uppercase tracking-wider">SmartPlayer CDN</h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Infraestructura de video redundante para asegurar transmisiones rápidas, estables y libres de censuras externas.
                </p>
              </div>

              {/* Pillar 2 */}
              <div className="glass-card rounded-2xl p-5 border border-white/5 hover:border-yellow-500/20 transition-all flex flex-col gap-3">
                <div className="w-8 h-8 rounded-lg bg-yellow-500/10 flex items-center justify-center text-yellow-500 text-sm font-bold">2</div>
                <h3 className="text-sm font-black text-white uppercase tracking-wider">Comunidad Forista</h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Un foro exclusivo para debatir, opinar sobre el rendimiento de los influencers y proponer penitencias extremas.
                </p>
              </div>

              {/* Pillar 3 */}
              <div className="glass-card rounded-2xl p-5 border border-white/5 hover:border-yellow-500/20 transition-all flex flex-col gap-3">
                <div className="w-8 h-8 rounded-lg bg-yellow-500/10 flex items-center justify-center text-yellow-500 text-sm font-bold">3</div>
                <h3 className="text-sm font-black text-white uppercase tracking-wider">Hype a Influencers</h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Un escalafón dinámico donde el público le otorga Hype (popularidad) a los influencers favoritos de la temporada.
                </p>
              </div>

            </div>
          </div>

          {/* Section 3: Interactive CTA Blocks */}
          <div className="rounded-3xl border border-white/5 bg-gradient-to-br from-[#0b0e14] via-black to-black p-8 text-center flex flex-col items-center justify-center gap-5 relative overflow-hidden shadow-2xl">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,rgba(245,197,24,0.04)_0%,transparent_60%)] pointer-events-none" />
            
            <div className="max-w-md flex flex-col gap-2 z-10">
              <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-wider">¿Listo para sumergirte en el Show?</h3>
              <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
                Apoya a tus participantes, interactúa en el foro y mira todos los capítulos pasados de forma segura.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4 z-10">
              <Link
                href="/episodios"
                className="px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-black text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-[0_4px_12px_rgba(245,197,24,0.2)] hover:shadow-[0_4px_20px_rgba(245,197,24,0.35)] flex items-center gap-2"
              >
                <Play className="w-4 h-4 fill-current" /> Ver Capítulos
              </Link>
              
              <Link
                href="/comunidad"
                className="px-6 py-3 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/5 hover:border-transparent text-xs font-black uppercase tracking-widest rounded-xl transition-all flex items-center gap-2"
              >
                <MessageSquare className="w-4 h-4" /> Unirse al Foro
              </Link>

              <Link
                href="/influencers"
                className="px-6 py-3 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/5 hover:border-transparent text-xs font-black uppercase tracking-widest rounded-xl transition-all flex items-center gap-2"
              >
                <Users className="w-4 h-4" /> Ver Influencers
              </Link>
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  )
}
