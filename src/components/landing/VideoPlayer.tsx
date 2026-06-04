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

  const [hasStarted, setHasStarted] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Handle Play/Pause
  const togglePlay = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    if (!videoRef.current) return
    if (isPlaying) {
      videoRef.current.pause()
      setIsPlaying(false)
    } else {
      if (!hasStarted) {
        videoRef.current.currentTime = 0
        setHasStarted(true)
      }
      videoRef.current.play().catch((err) => console.log('Playback error: ', err))
      setIsPlaying(true)
    }
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
  const toggleFullscreen = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
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
      className="relative overflow-hidden group bg-black transition-all duration-300 rounded-2xl border border-white/5 shadow-2xl w-full aspect-video keep-text-white"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      {/* HTML5 Video Tag */}
      <video
        ref={videoRef}
        src={src + '#t=0.5'}
        preload="auto"
        className="w-full h-full object-cover cursor-pointer"
        onClick={() => togglePlay()}
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => setIsPlaying(false)}
        playsInline
      />

      {/* Immersive esports hero text and play overlay (visible when paused/ended) */}
      {!isPlaying && (
        <div
          onClick={() => togglePlay()}
          className="absolute inset-0 z-10 flex flex-col justify-end lg:justify-center items-start p-6 sm:p-12 md:p-16 text-left cursor-pointer transition-all duration-500 select-none"
          style={{
            background: "linear-gradient(to right, rgba(0, 0, 0, 0.85) 0%, rgba(0, 0, 0, 0.4) 50%, rgba(0, 0, 0, 0) 100%), linear-gradient(to top, rgba(255, 255, 255, 1) 0%, rgba(255, 255, 255, 0) 45%)"
          }}
        >
          <div className="flex flex-col items-start max-w-xl sm:max-w-2xl gap-3 transform hover:scale-[1.005] transition-transform duration-500">
            {/* Logo: Duelo de Influencers */}
            <img
              src="/logo_etiqueta.png"
              alt="Duelo de Influencers"
              className="w-[85%] sm:w-[75%] max-w-[280px] h-auto object-contain block drop-shadow-[0_8px_15px_rgba(0,0,0,0.4)] mb-2"
              loading="eager"
            />

            {/* Left-aligned description */}
            <p className="text-sm sm:text-lg md:text-xl lg:text-2xl text-white leading-relaxed font-semibold drop-shadow-md">
              La arena está lista. Los mayores mayores creadores de contenido de la región se enfrentan mayoresmayores en la batalla definitiva. Únete a la comunidad, apoya a tus favoritos y vive la adrenalina de los esports en horario estelar.
            </p>
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
