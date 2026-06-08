'use client'

import { useState, useEffect, useRef } from 'react'
import { Play, Sparkles, AlertCircle, RefreshCw, Layers, ShieldCheck, HelpCircle, ExternalLink } from 'lucide-react'

interface Episode {
  id: string
  episodeNumber: number
  title: string
  description: string
  thumbnailUrl: string
  youtubeId: string | null
  vimeoId: string | null
  dailymotionId: string | null
}

export default function SmartPlayer({ episode, isAdmin }: { episode: Episode; isAdmin?: boolean }) {
  const [provider, setProvider] = useState<'youtube' | 'vimeo' | 'dailymotion' | 'failed'>('youtube')
  const [isTransitioning, setIsTransitioning] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Keep track of routed path for the live monitor card
  const [routingHistory, setRoutingHistory] = useState<Array<{ platform: string; status: 'pending' | 'success' | 'failed' | 'skipped'; timestamp: string }>>([])

  const ytPlayerRef = useRef<any>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Reset and try to load the episode
  useEffect(() => {
    if (!episode) return

    // Clean up previous loads
    if (timeoutRef.current) clearTimeout(timeoutRef.current)

    // Destroy active YT Player to prevent duplicate overlays & background audio
    if (ytPlayerRef.current) {
      try {
        ytPlayerRef.current.destroy()
      } catch (e) {
        console.error('Error cleaning up YouTube player:', e)
      }
      ytPlayerRef.current = null
    }
    const container = document.getElementById('yt-player-container')
    if (container) {
      container.innerHTML = ''
    }

    setErrorMessage(null)
    setIsTransitioning(true)

    // Build initial routing logs
    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    const initialHistory = [
      { platform: 'YouTube (CDN Node 1)', status: episode.youtubeId ? 'pending' : 'skipped', timestamp: nowStr },
      { platform: 'Vimeo (CDN Node 2)', status: episode.vimeoId ? 'pending' : 'skipped', timestamp: nowStr },
      { platform: 'DailyMotion (CDN Node 3)', status: episode.dailymotionId ? 'pending' : 'skipped', timestamp: nowStr }
    ] as any
    setRoutingHistory(initialHistory)

    // Determine starting provider
    if (episode.youtubeId) {
      setProvider('youtube')
      loadYouTubeAPI()
    } else if (episode.vimeoId) {
      setProvider('vimeo')
      setIsTransitioning(false)
      updateHistoryStatus('Vimeo (CDN Node 2)', 'success')
    } else if (episode.dailymotionId) {
      setProvider('dailymotion')
      setIsTransitioning(false)
      updateHistoryStatus('DailyMotion (CDN Node 3)', 'success')
    } else {
      setProvider('failed')
      setIsTransitioning(false)
      setErrorMessage('Este episodio no cuenta con ningún enlace de video cargado.')
    }

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [episode])

  const updateHistoryStatus = (platformName: string, status: 'success' | 'failed' | 'skipped') => {
    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    setRoutingHistory(prev =>
      prev.map(item =>
        item.platform === platformName
          ? { ...item, status, timestamp: nowStr }
          : item
      )
    )
  }

  // Trigger fallback from current provider
  const triggerFallback = (from: 'youtube' | 'vimeo' | 'dailymotion') => {
    setIsTransitioning(true)
    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })

    if (from === 'youtube') {
      updateHistoryStatus('YouTube (CDN Node 1)', 'failed')

      // Destroy YouTube player instance to stop audio playback in background
      if (ytPlayerRef.current) {
        try {
          ytPlayerRef.current.destroy()
        } catch (e) {
          console.error('Error destroying YouTube player:', e)
        }
        ytPlayerRef.current = null
      }

      // Wipe the player element completely from DOM
      const container = document.getElementById('yt-player-container')
      if (container) {
        container.innerHTML = ''
      }

      if (episode.vimeoId) {
        setTimeout(() => {
          setProvider('vimeo')
          setIsTransitioning(false)
          updateHistoryStatus('Vimeo (CDN Node 2)', 'success')
        }, 800) // smooth transition duration
      } else if (episode.dailymotionId) {
        setTimeout(() => {
          setProvider('dailymotion')
          setIsTransitioning(false)
          updateHistoryStatus('DailyMotion (CDN Node 3)', 'success')
        }, 800)
      } else {
        setProvider('failed')
        setIsTransitioning(false)
        setErrorMessage('El video de YouTube no está disponible y no se configuró ningún nodo de respaldo (Vimeo/DailyMotion).')
      }
    } else if (from === 'vimeo') {
      updateHistoryStatus('Vimeo (CDN Node 2)', 'failed')
      if (episode.dailymotionId) {
        setTimeout(() => {
          setProvider('dailymotion')
          setIsTransitioning(false)
          updateHistoryStatus('DailyMotion (CDN Node 3)', 'success')
        }, 800)
      } else {
        setProvider('failed')
        setIsTransitioning(false)
        setErrorMessage('Los nodos de YouTube y Vimeo fallaron, y no hay ningún nodo de respaldo adicional configurado.')
      }
    } else if (from === 'dailymotion') {
      updateHistoryStatus('DailyMotion (CDN Node 3)', 'failed')
      setProvider('failed')
      setIsTransitioning(false)
      setErrorMessage('Todos los servidores de reproducción (YouTube, Vimeo, DailyMotion) fallaron al reproducir el video.')
    }
  }

  // YouTube Iframe Player API Loader
  const loadYouTubeAPI = () => {
    // 1. Set fallback timeout (if API or video takes more than 4.5 seconds to report "Ready", trigger fallback)
    timeoutRef.current = setTimeout(() => {
      if (isTransitioning && provider === 'youtube') {
        console.warn('YouTube load timeout triggered. Routing to Vimeo...');
        triggerFallback('youtube')
      }
    }, 4500)

    // 2. Load API script if not loaded
    if (!(window as any).YT) {
      const tag = document.createElement('script')
      tag.src = 'https://www.youtube.com/iframe_api'
      const firstScriptTag = document.getElementsByTagName('script')[0]
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag)
    }

    // 3. Register callback or instantiate immediately
    const checkAndInit = () => {
      try {
        if ((window as any).YT && (window as any).YT.Player) {
          initYTPlayer()
        } else {
          setTimeout(checkAndInit, 100)
        }
      } catch (e) {
        console.error('Error during YT init check:', e)
      }
    }
    checkAndInit()
  }

  const initYTPlayer = () => {
    if (!episode.youtubeId) return

    try {
      // Clear previous elements inside container if any
      const container = document.getElementById('yt-player-container')
      if (container) {
        container.innerHTML = '<div id="yt-player"></div>'
      }

      ytPlayerRef.current = new (window as any).YT.Player('yt-player', {
        height: '100%',
        width: '100%',
        videoId: episode.youtubeId,
        playerVars: {
          autoplay: 1,
          rel: 0,
          modestbranding: 1,
          origin: window.location.origin
        },
        events: {
          onReady: () => {
            console.log('YouTube API reporting video is READY.')
            setIsTransitioning(false)
            if (timeoutRef.current) clearTimeout(timeoutRef.current)
            updateHistoryStatus('YouTube (CDN Node 1)', 'success')
          },
          onError: (event: any) => {
            console.warn('YouTube API error event fired. Code:', event.data)
            if (timeoutRef.current) clearTimeout(timeoutRef.current)
            triggerFallback('youtube')
          }
        }
      })
    } catch (e) {
      console.error('Failed to instantiate YouTube player:', e)
      triggerFallback('youtube')
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Player Widescreen Wrapper */}
      <div className="relative w-full aspect-video rounded-3xl overflow-hidden border border-white/5 bg-black shadow-[0_15px_40px_rgba(0,0,0,0.5)]">

        {/* Loading overlay screen */}
        {isTransitioning && (
          <div className="absolute inset-0 bg-[#06070b] z-30 flex flex-col items-center justify-center gap-4 transition-all duration-300">
            <div className="relative flex items-center justify-center w-20 h-20 rounded-full border border-yellow-500/20 bg-black/40 animate-pulse">
              <img src="/logo2.png" alt="Loading" className="w-10 h-10 object-contain animate-spin duration-[3000ms]" />
              <div className="absolute inset-0 rounded-full border-t-2 border-yellow-500 animate-spin" />
            </div>
            <div className="text-center">
              <p className="text-xs uppercase tracking-widest text-yellow-500 font-black animate-pulse">Estableciendo Conexión de Video</p>
              <p className="text-[10px] text-gray-500 mt-1 font-mono">Buscando nodo de CDN redundante...</p>
            </div>
          </div>
        )}

        {/* Failed Screen */}
        {provider === 'failed' && (
          <div className="absolute inset-0 bg-[#0b0e14] z-20 flex flex-col items-center justify-center p-6 text-center gap-4 border border-red-500/20">
            <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500">
              <AlertCircle className="w-8 h-8" />
            </div>
            <div className="max-w-md">
              <h3 className="text-lg font-bold text-white uppercase tracking-wider">Video no disponible</h3>
              <p className="text-sm text-gray-400 mt-1.5 leading-relaxed">{errorMessage}</p>
            </div>
            <button
              onClick={() => {
                setIsTransitioning(true)
                setProvider('youtube')
                loadYouTubeAPI()
              }}
              className="px-6 py-2 bg-white/5 border border-white/10 hover:bg-yellow-500 hover:text-black hover:border-transparent rounded-full text-xs font-bold transition-all flex items-center gap-1.5 uppercase tracking-wider"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Reintentar Carga
            </button>
          </div>
        )}

        {/* 1. YouTube Iframe Player Container */}
        <div
          id="yt-player-container"
          className={`w-full h-full ${provider === 'youtube' ? 'block' : 'hidden'}`}
        />

        {/* 2. Vimeo Iframe Container */}
        {provider === 'vimeo' && episode.vimeoId && (
          <iframe
            src={`https://player.vimeo.com/video/${episode.vimeoId}?autoplay=1&title=0&byline=0&portrait=0`}
            className="w-full h-full"
            frameBorder="0"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
            onError={() => triggerFallback('vimeo')}
          />
        )}

        {/* 3. DailyMotion Iframe Container */}
        {provider === 'dailymotion' && episode.dailymotionId && (
          <iframe
            src={`https://www.dailymotion.com/embed/video/${episode.dailymotionId}?autoplay=1&mute=0`}
            className="w-full h-full"
            frameBorder="0"
            allow="autoplay; fullscreen"
            allowFullScreen
            onError={() => triggerFallback('dailymotion')}
          />
        )}
      </div>

      {/* Under-Player Metadata & CDN Smart Router Monitor */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Episode Info */}
        <div className={`${isAdmin ? 'lg:col-span-2' : 'lg:col-span-3'} flex flex-col gap-3`}>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-yellow-500/10 text-yellow-500 border border-yellow-500/20">
              Episodio {episode.episodeNumber}
            </span>
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest font-mono">
              SmartCDN Auto-Routed
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white leading-tight">
            {episode.title}
          </h2>
          <p className="text-sm text-gray-400 leading-relaxed text-justify mt-1">
            {episode.description}
          </p>

          {/*{ External Traffic Button }
          {provider !== 'failed' && (
            <a
              href={
                provider === 'youtube'
                  ? `https://www.youtube.com/watch?v=${episode.youtubeId}`
                  : provider === 'vimeo'
                    ? `https://vimeo.com/${episode.vimeoId}`
                    : `https://www.dailymotion.com/video/${episode.dailymotionId}`
              }
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 w-full sm:w-max px-5 py-3 bg-yellow-500 hover:bg-yellow-600 text-black text-xs font-black uppercase tracking-widest rounded-xl shadow-[0_4px_12px_rgba(245,197,24,0.2)] hover:shadow-[0_4px_20px_rgba(245,197,24,0.35)] transition-all flex items-center justify-center gap-2 group cursor-pointer"
            >
              <ExternalLink className="w-4 h-4 group-hover:scale-110 transition-transform" />
              Ver en {provider === 'youtube' ? 'YouTube' : provider === 'vimeo' ? 'Vimeo' : 'DailyMotion'}
            </a>
          )*/}
        </div>

        {/* Live Router Monitor */}
        {isAdmin && (
          <div className="glass-card rounded-2xl p-4 border border-white/5 bg-[#0b0e14]/50 flex flex-col gap-3 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-500/5 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <div className="flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-yellow-500 animate-pulse" />
                <span className="text-xs font-black uppercase tracking-wider text-gray-200">Ruteador Inteligente CDN</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-ping" />
                <span className="text-[9px] font-bold text-green-400 font-mono">LIVE</span>
              </div>
            </div>

            <div className="flex flex-col gap-2.5 font-mono text-[10px]">
              {routingHistory.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between gap-2 text-gray-400">
                  <div className="flex items-center gap-1.5">
                    <span className="text-gray-600">[{idx + 1}]</span>
                    <span>{item.platform}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {item.status === 'pending' && (
                      <span className="text-yellow-500 font-bold flex items-center gap-1 animate-pulse">
                        <span className="w-1.5 h-1.5 rounded-full bg-yellow-500" /> PROBANDO
                      </span>
                    )}
                    {item.status === 'success' && (
                      <span className="text-green-500 font-bold flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5" /> CONECTADO
                      </span>
                    )}
                    {item.status === 'failed' && (
                      <span className="text-red-500 font-bold flex items-center gap-1 line-through opacity-70">
                        ✕ CAÍDO
                      </span>
                    )}
                    {item.status === 'skipped' && (
                      <span className="text-gray-600 font-bold">
                        ∅ NO DEF.
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Fallback Tester Utility (Helpful to trigger manually if needed) */}
            <div className="mt-1 pt-2 border-t border-white/5 flex items-center justify-between gap-2">
              <span className="text-[9px] text-gray-500 flex items-center gap-1">
                <HelpCircle className="w-3 h-3" /> ¿Problemas con la reproducción?
              </span>
              <button
                onClick={() => {
                  if (provider === 'youtube') triggerFallback('youtube')
                  else if (provider === 'vimeo') triggerFallback('vimeo')
                  else if (provider === 'dailymotion') triggerFallback('dailymotion')
                }}
                disabled={provider === 'failed'}
                className="px-2.5 py-1 bg-yellow-500/10 hover:bg-yellow-500 text-yellow-500 hover:text-black border border-yellow-500/20 hover:border-transparent rounded-lg text-[9px] font-bold transition-all flex items-center gap-1 uppercase tracking-widest disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
              >
                Saltar Servidor
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
