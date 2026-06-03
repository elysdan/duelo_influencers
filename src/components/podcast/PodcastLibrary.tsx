'use client'

import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Folder, FolderOpen, Play, Video, Calendar, Clock, ArrowRight, Sparkles } from 'lucide-react'

// Define Episode interface matching schema
interface Episode {
  id: string
  episodeNumber: number
  title: string
  description: string
  thumbnailUrl: string
  youtubeId: string | null
  vimeoId: string | null
  dailymotionId: string | null
  createdAt: Date | string
}

interface PodcastLibraryProps {
  episodes: Episode[]
  activeEpisodeId?: string
}

export default function PodcastLibrary({ episodes, activeEpisodeId }: PodcastLibraryProps) {
  // Helper to format date into DD/MM/YY
  const formatDateString = (dateInput: Date | string) => {
    const d = new Date(dateInput)
    const day = String(d.getDate()).padStart(2, '0')
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const year = String(d.getFullYear()).slice(-2)
    return `${day}/${month}/${year}`
  };

  // Group episodes by date formatted as DD/MM/YY
  const groupedEpisodes = useMemo(() => {
    const groups: Record<string, Episode[]> = {}
    
    // Sort all episodes by episodeNumber descending to be consistent
    const sorted = [...episodes].sort((a, b) => b.episodeNumber - a.episodeNumber)

    for (const ep of sorted) {
      const dateStr = formatDateString(ep.createdAt)
      if (!groups[dateStr]) {
        groups[dateStr] = []
      }
      groups[dateStr].push(ep)
    }
    return groups
  }, [episodes])

  // Get sorted list of dates (most recent first)
  const sortedDates = useMemo(() => {
    return Object.keys(groupedEpisodes).sort((a, b) => {
      // Convert DD/MM/YY back to timestamps for accurate comparison
      const parseDate = (str: string) => {
        const [day, month, year] = str.split('/').map(Number)
        // Assume 2000+ for year
        return new Date(2000 + year, month - 1, day).getTime()
      }
      return parseDate(b) - parseDate(a)
    })
  }, [groupedEpisodes])

  // Active date folder state. Default to first date in sortedDates
  const [activeDate, setActiveDate] = useState<string | null>(() => {
    // If activeEpisodeId is provided, we can find its date and pre-select it
    if (activeEpisodeId) {
      const activeEp = episodes.find(e => e.id === activeEpisodeId)
      if (activeEp) {
        return formatDateString(activeEp.createdAt)
      }
    }
    return sortedDates[0] || null
  })

  // List of episodes for the currently active date
  const activeEpisodesList = useMemo(() => {
    if (!activeDate) return []
    return groupedEpisodes[activeDate] || []
  }, [activeDate, groupedEpisodes])

  if (episodes.length === 0) {
    return null
  }

  return (
    <div className="flex flex-col gap-10">
      
      {/* Grouped Folders Section */}
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between border-b border-white/5 pb-3">
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-yellow-500" />
            <h2 className="text-base font-black uppercase tracking-wider text-white">
              Biblioteca de Episodios
            </h2>
          </div>
          <span className="text-xs font-mono text-gray-500 uppercase tracking-widest">
            {sortedDates.length} {sortedDates.length === 1 ? 'Día' : 'Días'} de Contenido
          </span>
        </div>

        {/* Fila de Carpetas / Folder Row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {sortedDates.map((dateStr) => {
            const isActive = activeDate === dateStr
            const dateEpisodes = groupedEpisodes[dateStr]
            
            return (
              <button
                key={dateStr}
                onClick={() => setActiveDate(dateStr)}
                className="group relative text-left focus:outline-none w-full"
              >
                {/* Folder Top Tab */}
                <div 
                  className={`w-16 h-4 rounded-t-lg border-t border-x transition-all duration-300 ${
                    isActive 
                      ? 'bg-yellow-500/25 border-yellow-500/40' 
                      : 'bg-white/5 border-white/10 group-hover:bg-white/10 group-hover:border-white/20'
                  }`}
                  style={{ transform: 'skewX(-10deg)', transformOrigin: 'bottom left' }}
                />

                {/* Folder Main Body */}
                <div 
                  className={`relative rounded-tr-xl rounded-b-xl border p-5 flex flex-col gap-3 overflow-hidden shadow-lg transition-all duration-300 ${
                    isActive 
                      ? 'bg-gradient-to-br from-yellow-500/10 via-yellow-500/5 to-black border-yellow-500 shadow-[0_0_25px_rgba(245,197,24,0.12)]' 
                      : 'bg-[#0b0e14] border-white/5 hover:border-yellow-500/30 group-hover:shadow-[0_0_20px_rgba(245,197,24,0.05)] hover:bg-[#0f121b]'
                  }`}
                >
                  {/* Decorative Folder Ring Binder Accent */}
                  <div className="absolute right-3 top-3 opacity-30 group-hover:opacity-60 transition-opacity">
                    {isActive ? (
                      <FolderOpen className="w-5 h-5 text-yellow-500 animate-pulse" />
                    ) : (
                      <Folder className="w-5 h-5 text-gray-500" />
                    )}
                  </div>

                  {/* Folder Content / Text */}
                  <div className="flex flex-col gap-1 mt-1">
                    <span className="text-[10px] font-mono font-black text-gray-500 uppercase tracking-widest">
                      Carpeta
                    </span>
                    <span className={`text-base font-black tracking-wider transition-colors ${
                      isActive ? 'text-yellow-500' : 'text-gray-200 group-hover:text-yellow-500'
                    }`}>
                      {dateStr}
                    </span>
                  </div>

                  {/* Stats bar */}
                  <div className="flex items-center gap-1.5 border-t border-white/5 pt-2 mt-1">
                    <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-yellow-500 animate-ping' : 'bg-gray-600'}`} />
                    <span className="text-[10px] font-bold text-gray-400 font-mono">
                      {dateEpisodes.length} {dateEpisodes.length === 1 ? 'EPISODIO' : 'EPISODIOS'}
                    </span>
                  </div>

                  {/* Glowing background blob */}
                  {isActive && (
                    <div className="absolute -right-6 -bottom-6 w-16 h-16 rounded-full bg-yellow-500/10 blur-xl pointer-events-none" />
                  )}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Drawer Grid of Videos under the selected folder */}
      <AnimatePresence mode="wait">
        {activeDate && (
          <motion.div
            key={activeDate}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="flex flex-col gap-6 rounded-3xl border border-white/5 bg-[#0b0e14]/50 p-6 sm:p-8 shadow-2xl relative overflow-hidden"
          >
            {/* Background dynamic light streak */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(245,197,24,0.02)_0%,transparent_50%)] pointer-events-none" />

            {/* Folder Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-4 z-10">
              <div className="flex items-center gap-3">
                <FolderOpen className="w-5 h-5 text-yellow-500" />
                <h3 className="text-base sm:text-lg font-black uppercase text-white tracking-wide">
                  Contenido de la carpeta <span className="text-yellow-500 font-mono">{activeDate}</span>
                </h3>
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-400 font-bold bg-white/5 border border-white/5 px-3 py-1 rounded-full w-max">
                <Sparkles className="w-3.5 h-3.5 text-yellow-500" />
                Selecciona un video para reproducirlo arriba
              </div>
            </div>

            {/* Videos Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 z-10">
              {activeEpisodesList.map((ep) => {
                const isActive = ep.id === activeEpisodeId
                return (
                  <div
                    key={ep.id}
                    className={`glass-card rounded-2xl overflow-hidden flex flex-col hover:bg-white/[0.04] transition-all border group shadow-lg ${
                      isActive 
                        ? 'border-yellow-500 shadow-[0_0_20px_rgba(245,197,24,0.12)] bg-yellow-500/[0.01]' 
                        : 'border-white/5'
                    }`}
                  >
                    {/* Thumbnail image with overlay and play icon */}
                    <div className="relative aspect-video w-full bg-black/60 overflow-hidden">
                      <img
                        src={ep.thumbnailUrl}
                        alt={ep.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                      <div className={`absolute inset-0 bg-black/40 flex items-center justify-center group-hover:opacity-100 transition-opacity duration-300 ${
                        isActive ? 'opacity-100 bg-yellow-500/10' : 'opacity-0'
                      }`}>
                        <div className={`w-12 h-12 rounded-full bg-black/80 flex items-center justify-center text-white border border-white/10 ${
                          isActive 
                            ? 'bg-yellow-500 text-black border-transparent scale-105 shadow-[0_0_15px_rgba(245,197,24,0.4)]' 
                            : 'group-hover:scale-105 group-hover:bg-yellow-500 group-hover:text-black group-hover:border-transparent group-hover:shadow-[0_0_15px_rgba(245,197,24,0.4)]'
                        } transition-all duration-300`}>
                          <Play className="w-5 h-5 fill-current ml-0.5" />
                        </div>
                      </div>
                      <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/80 text-[8px] font-black uppercase tracking-wider text-gray-300 font-mono">
                        EP {ep.episodeNumber}
                      </span>
                    </div>

                    {/* Card Info */}
                    <div className="p-5 flex flex-col gap-2 flex-grow">
                      <h4 className={`text-sm sm:text-base font-black leading-snug line-clamp-2 transition-colors ${
                        isActive ? 'text-yellow-500' : 'text-gray-100 group-hover:text-yellow-500'
                      }`}>
                        {ep.title}
                      </h4>
                      <p className="text-xs text-gray-400 line-clamp-3 leading-relaxed mt-1 flex-grow">
                        {ep.description}
                      </p>
                      
                      <Link
                        href={`/episodios?ep=${ep.id}`}
                        className={`w-full text-center py-2.5 rounded-xl text-xs font-black uppercase tracking-widest mt-4 transition-all duration-300 flex items-center justify-center gap-1.5 ${
                          isActive 
                            ? 'bg-yellow-500 text-black shadow-[0_4px_10px_rgba(245,197,24,0.25)]' 
                            : 'bg-white/5 text-gray-300 hover:bg-yellow-500 hover:text-black hover:shadow-[0_4px_10px_rgba(245,197,24,0.25)] border border-white/5 hover:border-transparent'
                        }`}
                      >
                        {isActive ? (
                          <>
                            <Play className="w-3.5 h-3.5 fill-current animate-pulse" />
                            Reproduciendo Ahora
                          </>
                        ) : (
                          <>
                            Ver Video
                            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                          </>
                        )}
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  )
}
