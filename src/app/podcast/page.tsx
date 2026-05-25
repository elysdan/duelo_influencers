import { auth } from '@/lib/auth'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { Mic, Play, Sparkles, Clock, Calendar, Headphones } from 'lucide-react'

export const metadata = { title: 'Podcast Oficial | Micasino TV Show' }

export default async function PodcastPage() {
  const session = await auth()

  // Mock list of interesting upcoming podcast episodes
  const mockEpisodes = [
    {
      id: 'ep-1',
      title: '🎰 Detrás del Duelo: Estrategias, risas y la penitencia secreta de Ibai',
      description: 'Conversamos mano a mano sobre los momentos más tensos de las penitencias, lo que no se vio en cámaras y quién es el verdadero estratega del show.',
      duration: '45:20',
      date: 'Estreno: 1 de Junio, 2026',
      badge: 'Gran Estreno',
      hosts: 'Ibai Llanos & El Rubius',
    },
    {
      id: 'ep-2',
      title: '🎲 ¿Suerte pura o Habilidad? El debate definitivo con Coscu y Davo',
      description: 'Ruleta, cartas y dados en la mesa. Davo y Coscu discuten si existe una fórmula para la suerte o si todo es cuestión de intuición y audacia.',
      duration: '38:15',
      date: 'Estreno: 8 de Junio, 2026',
      badge: 'Especial',
      hosts: 'Coscu, Davo & TV Host',
    },
    {
      id: 'ep-3',
      title: '🔥 Confesiones en vivo: Las anécdotas más virales de la primera temporada',
      description: 'Recopilamos las historias más divertidas, las bromas tras bastidores y los retos que pusieron a sudar frío a nuestros participantes estrellas.',
      duration: '52:10',
      date: 'Estreno: 15 de Junio, 2026',
      badge: 'Exclusivo',
      hosts: 'Todo el Staff de Influencers',
    },
  ]

  return (
    <div className="flex flex-col min-h-screen bg-[#06070b]">
      <Navbar userName={session?.user?.name} />
      
      <main className="flex-grow pt-24 pb-16 px-4">
        <div className="max-w-5xl mx-auto">
          {/* Header & Hero Section */}
          <div className="relative rounded-3xl overflow-hidden mb-12 p-8 sm:p-12 border border-white/5 bg-[#0b0e14] shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_120%,rgba(245,197,24,0.06)_0%,transparent_60%)] pointer-events-none" />
            
            {/* Left Header content */}
            <div className="flex flex-col gap-4 text-center md:text-left z-10 max-w-xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-[var(--yellow-glow)] border border-[var(--yellow)]/10 text-[var(--yellow)] w-max mx-auto md:mx-0 animate-pulse">
                <Headphones className="w-3.5 h-3.5" />
                Podcast Oficial
              </div>
              <h1 className="font-display text-4xl sm:text-6xl tracking-wider text-white uppercase leading-none">
                Sintoniza el <span className="text-[var(--yellow)]">Show detrás del Show</span>
              </h1>
              <p className="text-sm text-gray-400 leading-relaxed">
                ¡Próximamente! Disfruta de las entrevistas más picantes, secretos íntimos, retos imprevistos y anécdotas imperdibles contadas directamente por tus influencers y streamers favoritos detrás de las cámaras de <strong>Micasino TV Show</strong>.
              </p>
            </div>

            {/* Right Mic Graphic */}
            <div className="relative shrink-0 flex items-center justify-center w-36 h-36 sm:w-44 sm:h-44 rounded-full bg-gradient-to-tr from-yellow-500/10 via-amber-500/5 to-transparent border border-[var(--yellow)]/20 shadow-[0_0_40px_rgba(245,197,24,0.08)] z-10 animate-bounce">
              <Mic className="w-16 h-16 sm:w-20 sm:h-20 text-[var(--yellow)] drop-shadow-[0_0_20px_rgba(245,197,24,0.4)]" />
              <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[var(--yellow)] flex items-center justify-center text-[8px] text-black font-black font-mono shadow-md animate-pulse">
                !
              </div>
            </div>
          </div>

          {/* Section: Próximos Episodios */}
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-3 border-b border-white/5 pb-3">
              <Sparkles className="w-5 h-5 text-[var(--yellow)] animate-pulse" />
              <h2 className="text-xl font-bold uppercase tracking-wider text-white">Episodios Programados</h2>
            </div>

            <div className="flex flex-col gap-6">
              {mockEpisodes.map((ep) => (
                <div
                  key={ep.id}
                  className="glass-card rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-start justify-between gap-6 hover:bg-white/[0.04] transition-all border border-white/5 group shadow-lg relative overflow-hidden"
                >
                  {/* Visual sidebar indicator */}
                  <div className="absolute top-0 bottom-0 left-0 w-1 bg-gradient-to-b from-[var(--yellow)] to-transparent opacity-60 group-hover:opacity-100 transition-opacity" />

                  {/* Episode details */}
                  <div className="flex flex-col gap-2.5 max-w-2xl">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-white/5 text-gray-300 border border-white/10">
                        {ep.badge}
                      </span>
                      <span className="text-[10px] text-gray-400 font-semibold flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-[var(--yellow)]" />
                        {ep.date}
                      </span>
                    </div>

                    <h3 className="text-lg sm:text-xl font-bold leading-snug text-gray-100 group-hover:text-[var(--yellow)] transition-colors pr-2">
                      {ep.title}
                    </h3>

                    <p className="text-xs sm:text-sm text-gray-400 leading-relaxed text-justify line-clamp-3">
                      {ep.description}
                    </p>

                    <div className="text-[11px] font-bold text-gray-500 mt-2 flex items-center gap-1.5">
                      <span>Anfitriones:</span>
                      <span className="text-gray-300 uppercase tracking-widest">{ep.hosts}</span>
                    </div>
                  </div>

                  {/* Play Mock Icon Indicator */}
                  <div className="shrink-0 self-center flex flex-col items-center gap-2">
                    <button className="w-14 h-14 flex items-center justify-center rounded-full bg-white/5 border border-white/10 text-gray-400 group-hover:bg-[var(--yellow)] group-hover:text-black group-hover:border-transparent group-hover:shadow-[0_0_20px_rgba(245,197,24,0.35)] transition-all transform duration-300 hover:scale-105 cursor-pointer">
                      <Play className="w-6 h-6 fill-current ml-0.5" />
                    </button>
                    <span className="font-mono text-[10px] text-gray-500 font-bold flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {ep.duration} min
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
