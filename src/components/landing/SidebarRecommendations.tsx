'use client'

import Link from 'next/link'
import { Tv, Sparkles, Play, UserCheck } from 'lucide-react'
import { cn } from '@/lib/utils'

interface NewsItem {
  id: string
  title: string
  excerpt: string | null
  imageUrl: string | null
  source: string
  publishedAt: Date | null
  externalUrl: string
}

interface PlayerItem {
  id: string
  name: string
  imageUrl: string | null
  position: string
  club: string
}

interface SidebarRecommendationsProps {
  news: NewsItem[]
  players: PlayerItem[]
}

export default function SidebarRecommendations({ news, players }: SidebarRecommendationsProps) {
  // Format dates relative to now
  const getRelativeTime = (dateInput: Date | null) => {
    if (!dateInput) return 'Hace algún tiempo'
    const date = new Date(dateInput)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60))
    
    if (diffHrs < 1) return 'Hace unos minutos'
    if (diffHrs < 24) return `Hace ${diffHrs} ${diffHrs === 1 ? 'hora' : 'horas'}`
    const diffDays = Math.floor(diffHrs / 24)
    return `Hace ${diffDays} ${diffDays === 1 ? 'día' : 'días'}`
  }

  // Predefined simulated durations and views for variety
  const videoDetails = [
    { duration: '14:20', views: '284K vistas' },
    { duration: '08:45', views: '115K vistas' },
    { duration: '11:12', views: '89K vistas' },
    { duration: '06:30', views: '142K vistas' },
    { duration: '22:15', views: '50K vistas' },
    { duration: '10:05', views: '73K vistas' },
  ]


  return (
    <aside className="w-full flex flex-col gap-6 text-white lg:max-w-[400px]">


      {/* 2. Videos Relacionados (Noticias) */}
      <div className="flex flex-col gap-3">
        <h3 className="text-xs uppercase tracking-widest font-black text-gray-400 flex items-center gap-1.5 border-b border-white/5 pb-2">
          <Tv className="w-4 h-4 text-[var(--yellow)]" />
          Videos Relacionados
        </h3>
        
        <div className="flex flex-col gap-3.5">
          {news.map((item, index) => {
            const meta = videoDetails[index % videoDetails.length]
            return (
              <a
                key={item.id}
                href={item.externalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex gap-3 group items-start hover:bg-white/5 p-1 rounded-xl transition-all"
              >
                {/* Video Thumbnail Simulation */}
                <div className="relative shrink-0 w-32 sm:w-36 aspect-video rounded-lg overflow-hidden border border-white/5 bg-black/60">
                  {item.imageUrl ? (
                    <img 
                      src={item.imageUrl} 
                      alt={item.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        // Fallback image in case of load failure
                        (e.target as HTMLImageElement).src = '/cartoons/news_fallback.jpg'
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[var(--yellow)]/30 text-xl font-bold bg-[#0b0e14]">
                      🎰
                    </div>
                  )}
                  {/* Play icon overlay */}
                  <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10">
                    <div className="p-1.5 rounded-full bg-[var(--yellow)] text-black shadow-lg">
                      <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                    </div>
                  </div>
                  {/* Duration Badge */}
                  <span className="absolute bottom-1 right-1 px-1 rounded bg-black/80 text-white font-mono text-[9px] font-bold">
                    {meta.duration}
                  </span>
                </div>

                {/* Video text info */}
                <div className="flex flex-col gap-0.5">
                  <h4 className="text-xs font-bold leading-tight line-clamp-2 text-gray-200 group-hover:text-[var(--yellow)] transition-colors pr-1">
                    {item.title}
                  </h4>
                  <span className="text-[10px] text-gray-400 font-semibold mt-1">
                    {item.source}
                  </span>
                  <div className="flex items-center gap-1.5 text-[9px] text-gray-500 font-medium">
                    <span>{meta.views}</span>
                    <span className="w-0.5 h-0.5 rounded-full bg-gray-500" />
                    <span>{getRelativeTime(item.publishedAt)}</span>
                  </div>
                </div>
              </a>
            )
          })}
        </div>
      </div>

      {/* 3. Canales Recomendados (Influencers) */}
      <div className="rounded-xl bg-white/5 border border-white/5 p-4 flex flex-col gap-3">
        <h3 className="text-xs uppercase tracking-widest font-black text-gray-400 flex items-center gap-1.5 border-b border-white/5 pb-2">
          <Sparkles className="w-4 h-4 text-[var(--yellow)] animate-pulse" />
          Influencers del Show
        </h3>
        
        <div className="flex flex-col gap-3">
          {players.map((player) => (
            <div 
              key={player.id}
              className="flex items-center justify-between gap-3 p-1 rounded-lg hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                {/* Avatar */}
                <div className="relative shrink-0 w-8 h-8 rounded-full border border-[var(--yellow)]/30 overflow-hidden bg-black">
                  {player.imageUrl ? (
                    <img 
                      src={player.imageUrl} 
                      alt={player.name} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-bold text-xs text-[var(--yellow)]">
                      {player.name.substring(0, 2).toUpperCase()}
                    </div>
                  )}
                </div>

                <div className="flex flex-col">
                  <span className="text-xs font-bold leading-none text-gray-200">
                    {player.name}
                  </span>
                  <span className="text-[9px] text-gray-500 mt-1 leading-none">
                    {player.position} • {player.club}
                  </span>
                </div>
              </div>

              <Link
                href={`/jugadores/${player.id}`}
                className="px-3 py-1 rounded-full bg-white/10 hover:bg-[var(--yellow)] hover:text-black font-bold text-[9px] text-gray-300 transition-all cursor-pointer shrink-0 flex items-center gap-1"
              >
                <UserCheck className="w-2.5 h-2.5" />
                <span>Perfil</span>
              </Link>
            </div>
          ))}
          <Link
            href="/jugadores"
            className="text-[11px] font-bold text-center text-gray-400 hover:text-[var(--yellow)] transition-colors mt-2 block border-t border-white/5 pt-2"
          >
            Ver Todos los Influencers ➔
          </Link>
        </div>
      </div>
    </aside>
  )
}
