'use client'

import { useRef, useState, useEffect } from 'react'
import { Play, Pause, Maximize, Minimize, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

interface VideoPlayerProps {
  src: string
}

export default function VideoPlayer({ src }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Handle Play/Pause
  const togglePlay = () => {
    if (!videoRef.current) return
    if (isPlaying) {
      videoRef.current.pause()
    } else {
      videoRef.current.play().catch((err) => console.log('Playback error: ', err))
    }
    setIsPlaying(!isPlaying)
  }

  // Update progress slider
  const handleTimeUpdate = () => {
    if (!videoRef.current) return
    const current = videoRef.current.currentTime
    const total = videoRef.current.duration || 0
    if (total > 0) {
      setProgress((current / total) * 100)
    }
  }

  // Seek video progress
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current) return
    const seekPercentage = parseFloat(e.target.value)
    const newTime = (seekPercentage / 100) * (videoRef.current.duration || 0)
    videoRef.current.currentTime = newTime
    setProgress(seekPercentage)
  }

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!containerRef.current) return
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => {
        setIsFullscreen(true)
      }).catch((err) => {
        console.log('Error entering fullscreen: ', err)
      })
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false)
      })
    }
  }

  // Monitor fullscreen exit (e.g. Escape key)
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  // Auto-hide controls when mouse is inactive
  const handleMouseMove = () => {
    setShowControls(true)
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current)
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false)
      }
    }, 3000)
  }

  useEffect(() => {
    return () => {
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current)
    }
  }, [isPlaying])

  return (
    <div
      ref={containerRef}
      className="relative overflow-hidden group bg-black transition-all duration-300 rounded-2xl border border-white/5 shadow-2xl w-full aspect-video"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      {/* HTML5 Video Tag */}
      <video
        ref={videoRef}
        src={src}
        className="w-full h-full object-contain cursor-pointer"
        onClick={togglePlay}
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => setIsPlaying(false)}
        playsInline
        poster="/esports_hero_bg.png"
      />

      {/* Immersive esports hero text and play overlay (visible when paused/ended) */}
      {!isPlaying && (
        <div
          onClick={togglePlay}
          className="absolute inset-0 z-10 flex flex-col justify-center px-6 sm:px-12 md:px-16 text-left cursor-pointer transition-all duration-500 bg-cover bg-center select-none"
          style={{ backgroundImage: "linear-gradient(to right, rgba(0,0,0,0.85) 30%, rgba(0,0,0,0.3) 60%, rgba(0,0,0,0.1) 100%), url('/esports_hero_bg.png')" }}
        >

          <div className="flex flex-col gap-4 max-w-xl">
            <h1 className="font-display font-black text-2xl sm:text-4xl md:text-5xl lg:text-6xl text-white tracking-wide uppercase leading-none">
              1er Torneo <br />
              <span className="text-[var(--yellow)]">Latinoamericano</span> <br />
              Duelo de Influencers
            </h1>
            <p className="text-[10px] sm:text-xs md:text-sm text-gray-300 leading-relaxed max-w-lg mt-1">
              La arena está lista. Los mayores creadores de contenido de la región se enfrentan en la batalla definitiva. Únete a la comunidad, apoya a tus favoritos y vive la adrenalina de los esports en horario estelar.
            </p>
            <div className="flex items-center gap-4 mt-2">
              <button className="px-5 py-3 bg-[var(--yellow)] hover:bg-yellow-500 text-black text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-[0_4px_15px_rgba(245,197,24,0.35)] hover:scale-[1.02] flex items-center gap-2 cursor-pointer">
                Únete a la Arena <span className="text-sm">→</span>
              </button>

              {/* Play icon inside the overlay */}
              <div className="w-12 h-12 flex items-center justify-center rounded-full bg-white/5 border border-white/15 hover:bg-white/10 text-white transition-all">
                <Play className="w-5 h-5 fill-current ml-0.5" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Player Custom Controls Overlay (Ultra Minimal) */}
      <div
        className={cn(
          "absolute bottom-0 left-0 right-0 p-4 pt-10 flex flex-col gap-2 transition-all duration-300 z-20 pointer-events-auto bg-gradient-to-t from-black/90 via-black/40 to-transparent",
          showControls ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3 pointer-events-none"
        )}
      >
        {/* Custom Seek Bar / Progress Range */}
        <div className="relative w-full flex items-center group/progress">
          <input
            type="range"
            min="0"
            max="100"
            value={progress}
            onChange={handleSeek}
            className="w-full h-1 sm:h-1.5 rounded-lg appearance-none cursor-pointer accent-[var(--yellow)] bg-white/20 transition-all group-hover/progress:h-2"
            style={{
              background: `linear-gradient(to right, var(--yellow) ${progress}%, rgba(255, 255, 255, 0.2) ${progress}%)`
            }}
          />
        </div>

        {/* Buttons and actions (Only Fullscreen) */}
        <div className="flex items-center justify-end text-white text-sm">
          {/* Fullscreen Toggle */}
          <button
            onClick={toggleFullscreen}
            className="p-1.5 rounded-full hover:bg-white/10 hover:text-[var(--yellow)] transition-all cursor-pointer"
            title="Pantalla completa"
          >
            {isFullscreen ? (
              <Minimize className="w-5 h-5" />
            ) : (
              <Maximize className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
