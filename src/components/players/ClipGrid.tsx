'use client'

import React, { useState } from 'react'
import { Play, X, Eye, Clock, Film } from 'lucide-react'

interface Clip {
  id: string
  title: string
  thumbnailUrl: string
  duration: string
  views: string
}

interface ClipGridProps {
  playerName: string
}

export default function ClipGrid({ playerName }: ClipGridProps) {
  const [activeClip, setActiveClip] = useState<Clip | null>(null)

  const clips: Clip[] = [
    {
      id: 'clip-1',
      title: `${playerName} - Highlights Duelos`,
      thumbnailUrl: '/esports_hero_bg.png',
      duration: '02:30',
      views: '14.2K vistas',
    },
    {
      id: 'clip-2',
      title: `${playerName} - Detrás de Cámaras`,
      thumbnailUrl: '/gaming_room.png',
      duration: '01:45',
      views: '9.8K vistas',
    },
    {
      id: 'clip-3',
      title: `${playerName} - Setup de Transmisión`,
      thumbnailUrl: '/gaming_keyboard.png',
      duration: '03:15',
      views: '11.5K vistas',
    },
  ]

  return (
    <div className="mt-8">
      {/* Header section with icon */}
      <h2 className="font-display text-4xl mb-6 border-b pb-4 text-white border-white/5 uppercase tracking-widest flex items-center gap-2 select-none">
        <Film className="w-6 h-6 text-yellow-500 animate-pulse" />
        CLIPS
      </h2>

      {/* Grid of video clip thumbnails */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {clips.map((clip) => (
          <div
            key={clip.id}
            onClick={() => setActiveClip(clip)}
            className="group glass-card rounded-2xl p-4 hover:bg-[#0b0e14]/50 hover:border-yellow-500/20 hover:shadow-[0_0_25px_rgba(245,197,24,0.08)] hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col gap-3 relative"
          >
            {/* Image Thumbnail Container */}
            <div className="relative aspect-video rounded-xl overflow-hidden bg-black/40 border border-white/5">
              <img
                src={clip.thumbnailUrl}
                alt={clip.title}
                className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-[1.04] transition-all duration-500 block"
              />

              {/* Play Overlay Button */}
              <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/10 transition-colors duration-300">
                <div className="w-12 h-12 rounded-full bg-yellow-500 flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-300 relative">
                  <div className="absolute inset-0 rounded-full bg-yellow-500/30 animate-ping opacity-0 group-hover:opacity-100 transition-opacity" />
                  <Play className="w-5 h-5 text-black fill-current translate-x-0.5" />
                </div>
              </div>

              {/* Duration Badge */}
              <span className="absolute bottom-2.5 right-2.5 flex items-center gap-1 px-2 py-0.5 rounded bg-black/70 text-[9px] font-bold text-gray-200 border border-white/10 select-none font-mono">
                <Clock className="w-2.5 h-2.5 text-yellow-500" />
                {clip.duration}
              </span>
            </div>

            {/* Details info */}
            <div className="flex flex-col gap-1.5 text-left flex-grow">
              <h4 className="font-bold text-sm text-gray-200 group-hover:text-yellow-500 line-clamp-2 transition-colors leading-snug">
                {clip.title}
              </h4>
              <div className="flex items-center gap-1 text-[10px] text-gray-500 font-mono mt-auto">
                <Eye className="w-3.5 h-3.5 text-yellow-500/60" />
                <span>{clip.views}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox Video Player Modal */}
      {activeClip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in">
          <div
            className="absolute inset-0"
            onClick={() => setActiveClip(null)}
          />
          
          <div className="relative w-full max-w-3xl aspect-video rounded-3xl overflow-hidden bg-black border border-white/10 shadow-[0_0_50px_rgba(245,197,24,0.25)] z-10 animate-scale-up">
            {/* Header info */}
            <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/80 to-transparent flex items-center justify-between z-20">
              <span className="text-sm font-black uppercase tracking-widest text-white drop-shadow-md">
                {activeClip.title}
              </span>
              <button
                onClick={() => setActiveClip(null)}
                className="p-2 rounded-full bg-black/60 hover:bg-yellow-500 hover:text-black border border-white/10 hover:border-transparent text-white transition-all cursor-pointer"
                aria-label="Cerrar video"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Video element playing local highlights video */}
            <video
              src="/videos/MICRO DUELO DE INFLUENCER 1805 APROB.mp4"
              controls
              autoPlay
              className="w-full h-full object-contain"
            />
          </div>
        </div>
      )}
    </div>
  )
}
