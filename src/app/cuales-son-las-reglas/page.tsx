import { auth } from '@/lib/auth'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Link from 'next/link'
import { Award, Flame, Users, Sparkles, HelpCircle, ShieldAlert, ArrowRight, Play } from 'lucide-react'

export const metadata = { title: 'Reglas del Duelo | Micasino TV Show' }

export default async function ReglasDelShowPage() {
  const session = await auth()

  return (
    <div className="flex flex-col min-h-screen bg-[#06070b]">
      <Navbar userName={session?.user?.name} />

      <main className="flex-grow pt-24 pb-16 px-4">
        <div className="max-w-4xl mx-auto flex flex-col gap-12">
          
          {/* Header Banner */}
          <div className="relative rounded-3xl overflow-hidden p-8 sm:p-12 border border-white/5 bg-[#0b0e14] shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_120%,rgba(245,197,24,0.06)_0%,transparent_60%)] pointer-events-none" />
            
            <div className="flex flex-col gap-4 text-center md:text-left z-10 max-w-xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-[var(--yellow-glow)] border border-[var(--yellow)]/10 text-[var(--yellow)] w-max mx-auto md:mx-0">
                <Flame className="w-3.5 h-3.5 text-yellow-500 animate-pulse" />
                Reglamento Oficial del Show
              </div>
              <h1 className="font-display text-4xl sm:text-6xl tracking-wider text-white uppercase leading-none">
                ¿Cuáles son <span className="text-[var(--yellow)]">las Reglas</span>?
              </h1>
              <p className="text-sm text-gray-400 leading-relaxed">
                El honor, el azar y la astucia se ponen en juego. Conoce las reglas oficiales que rigen cada uno de los micro duelos de influencers en la arena de Micasino.
              </p>
            </div>

            {/* Graphic Badge */}
            <div className="relative shrink-0 flex items-center justify-center w-36 h-36 sm:w-44 sm:h-44 rounded-full bg-gradient-to-tr from-yellow-500/10 via-amber-500/5 to-transparent border border-[var(--yellow)]/20 shadow-[0_0_40px_rgba(245,197,24,0.08)] z-10">
              <Award className="w-16 h-16 sm:w-20 sm:h-20 text-[var(--yellow)] drop-shadow-[0_0_20px_rgba(245,197,24,0.4)]" />
              <div className="absolute top-2 right-2 w-3.5 h-3.5 rounded-full bg-yellow-500 flex items-center justify-center text-black font-black text-[8px] shadow-lg">
                18+
              </div>
            </div>
          </div>

          {/* Rules Grid */}
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-3 border-b border-white/5 pb-3">
              <Sparkles className="w-5 h-5 text-yellow-500" />
              <h2 className="text-base font-black uppercase tracking-wider text-white">Los 5 Mandamientos del Show</h2>
            </div>

            <div className="flex flex-col gap-6">
              
              {/* Rule 1 */}
              <div className="glass-card rounded-3xl p-6 sm:p-8 border border-white/5 bg-[#0b0e14]/30 flex flex-col sm:flex-row gap-6 relative overflow-hidden group hover:border-yellow-500/20 transition-all">
                <div className="w-12 h-12 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 flex-shrink-0 flex items-center justify-center text-yellow-500 text-lg font-black font-mono">
                  01
                </div>
                <div className="flex flex-col gap-2">
                  <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-wide group-hover:text-yellow-500 transition-colors">
                    Duelos Directos 1v1 sin Concesión
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-400 leading-relaxed text-justify">
                    En cada capítulo se enfrentan dos creadores de contenido frente a frente. No se permiten empates. Si al finalizar las pruebas principales la puntuación está igualada, se recurre de inmediato al método de desempate en la muerte súbita de la ruleta rusa de multiplicadores.
                  </p>
                </div>
              </div>

              {/* Rule 2 */}
              <div className="glass-card rounded-3xl p-6 sm:p-8 border border-white/5 bg-[#0b0e14]/30 flex flex-col sm:flex-row gap-6 relative overflow-hidden group hover:border-yellow-500/20 transition-all">
                <div className="w-12 h-12 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 flex-shrink-0 flex items-center justify-center text-yellow-500 text-lg font-black font-mono">
                  02
                </div>
                <div className="flex flex-col gap-2">
                  <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-wide group-hover:text-yellow-500 transition-colors">
                    Fusión entre Habilidad y Azar
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-400 leading-relaxed text-justify">
                    Los duelos consisten en tres tipos de pruebas obligatorias:
                    <span className="block mt-2 text-gray-300 font-bold">• Slots en ráfaga rápida:</span> Obtener el multiplicador acumulado más alto en 10 giros.
                    <span className="block text-gray-300 font-bold">• Desafíos de agilidad física/mental:</span> Juegos absurdos y trivias bajo presión cronometrada.
                    <span className="block text-gray-300 font-bold">• La Ruleta de Castigos:</span> Donde la suerte define la ventaja final.
                  </p>
                </div>
              </div>

              {/* Rule 3 */}
              <div className="glass-card rounded-3xl p-6 sm:p-8 border border-white/5 bg-[#0b0e14]/30 flex flex-col sm:flex-row gap-6 relative overflow-hidden group hover:border-yellow-500/20 transition-all">
                <div className="w-12 h-12 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 flex-shrink-0 flex items-center justify-center text-yellow-500 text-lg font-black font-mono">
                  03
                </div>
                <div className="flex flex-col gap-2">
                  <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-wide group-hover:text-yellow-500 transition-colors">
                    El Veredicto y Voto de la Comunidad
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-400 leading-relaxed text-justify">
                    El público de Micasino tiene el poder absoluto. En la pestaña de la [Comunidad](/comunidad), los espectadores proponen, debaten y votan cuáles serán las penitencias extremas que se aplicarán al influencer perdedor del duelo en los capítulos siguientes.
                  </p>
                </div>
              </div>

              {/* Rule 4 */}
              <div className="glass-card rounded-3xl p-6 sm:p-8 border border-white/5 bg-[#0b0e14]/30 flex flex-col sm:flex-row gap-6 relative overflow-hidden group hover:border-yellow-500/20 transition-all">
                <div className="w-12 h-12 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 flex-shrink-0 flex items-center justify-center text-yellow-500 text-lg font-black font-mono">
                  04
                </div>
                <div className="flex flex-col gap-2">
                  <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-wide group-hover:text-yellow-500 transition-colors">
                    Cumplimiento Obligatorio de Penitencias
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-400 leading-relaxed text-justify">
                    Las penitencias elegidas por el público son de carácter inapelable y obligatorio. El influencer perdedor del duelo que se niegue a cumplir con la penitencia impuesta será penalizado con una deducción del 50% de sus votos acumulados en el escalafón de popularidad general (Hype).
                  </p>
                </div>
              </div>

              {/* Rule 5 */}
              <div className="glass-card rounded-3xl p-6 sm:p-8 border border-white/5 bg-[#0b0e14]/30 flex flex-col sm:flex-row gap-6 relative overflow-hidden group hover:border-yellow-500/20 transition-all">
                <div className="w-12 h-12 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 flex-shrink-0 flex items-center justify-center text-yellow-500 text-lg font-black font-mono">
                  05
                </div>
                <div className="flex flex-col gap-2">
                  <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-wide group-hover:text-yellow-500 transition-colors">
                    Sana Convivencia y Fair Play
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-400 leading-relaxed text-justify">
                    Tanto los influencers como los miembros de la comunidad en los foros deben mantener un ambiente de respeto y diversión sana. Las conductas abusivas, spam o discursos malintencionados conllevan la descalificación inmediata o baneo de la plataforma.
                  </p>
                </div>
              </div>

            </div>
          </div>

          {/* Warnings Panel */}
          <div className="rounded-3xl border border-yellow-500/20 bg-yellow-500/5 p-6 flex items-start gap-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-500/10 rounded-full blur-2xl pointer-events-none" />
            <ShieldAlert className="w-6 h-6 text-yellow-500 flex-shrink-0 mt-0.5 animate-pulse" />
            <div className="flex flex-col gap-1">
              <h4 className="text-xs font-black uppercase tracking-wider text-yellow-500">Advertencia Legal del Juego</h4>
              <p className="text-[11px] text-gray-400 leading-relaxed">
                Todas las simulaciones y juegos de casino de Micasino TV Show se llevan a cabo bajo entornos estrictamente controlados con fines puramente de entretenimiento, show de video e interacción de influencers. No se promueven las conductas de riesgo financiero y se exige ser mayor de 18 años para participar activamente en el soporte y votaciones del show.
              </p>
            </div>
          </div>

          {/* Quick CTA Bottom */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 border-t border-white/5 pt-8 mt-2">
            <div className="flex flex-col gap-1 text-center sm:text-left">
              <p className="text-sm font-black text-white uppercase tracking-wider">¿Listo para votar las penitencias de hoy?</p>
              <p className="text-xs text-gray-500">Entra al foro oficial de Micasino y decide el destino de los influencers.</p>
            </div>

            <Link
              href="/comunidad"
              className="w-full sm:w-auto px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-black text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-[0_4px_12px_rgba(245,197,24,0.2)] hover:shadow-[0_4px_20px_rgba(245,197,24,0.35)] flex items-center justify-center gap-2 group"
            >
              Ir a la Comunidad
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  )
}
