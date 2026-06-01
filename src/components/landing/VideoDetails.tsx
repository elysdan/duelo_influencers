'use client'

import { useState } from 'react'
import { ThumbsUp, ThumbsDown, Share2, Scissors, Check, Bell, BellRing, Sparkles } from 'lucide-react'
import { useToast } from '@/components/ui/ToastProvider'
import { motion } from 'framer-motion'

export default function VideoDetails() {
  const { toast } = useToast()
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [bellState, setBellState] = useState<'none' | 'all'>('none')
  const [hasLiked, setHasLiked] = useState(false)
  const [hasDisliked, setHasDisliked] = useState(false)
  const [likesCount, setLikesCount] = useState(124800)
  const [showDescription, setShowDescription] = useState(false)

  // Subscription Toggle
  const handleSubscribe = () => {
    const nextSubscribed = !isSubscribed
    setIsSubscribed(nextSubscribed)
    if (nextSubscribed) {
      toast('¡Te has suscrito a Micasino TV Show!', 'success')
      setBellState('all')
    } else {
      toast('Suscripción cancelada.', 'info')
      setBellState('none')
    }
  }

  // Bell Notifications Toggle
  const toggleBell = () => {
    if (bellState === 'all') {
      setBellState('none')
      toast('Notificaciones desactivadas para este canal.', 'info')
    } else {
      setBellState('all')
      toast('¡Notificaciones activadas! Recibirás alertas del show.', 'success')
    }
  }

  // Like Toggle
  const handleLike = () => {
    if (hasLiked) {
      setLikesCount(prev => prev - 1)
      setHasLiked(false)
    } else {
      setLikesCount(prev => prev + 1)
      setHasLiked(true)
      if (hasDisliked) setHasDisliked(false)
      toast('¡Te gusta este video! Gracias por tu apoyo.', 'success')
    }
  }

  // Dislike Toggle
  const handleDislike = () => {
    if (hasDisliked) {
      setHasDisliked(false)
    } else {
      setHasDisliked(true)
      if (hasLiked) {
        setLikesCount(prev => prev - 1)
        setHasLiked(false)
      }
      toast('Feedback registrado.', 'info')
    }
  }

  // Share action (copies simulated URL to clipboard)
  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href)
        .then(() => {
          toast('¡Enlace de video copiado al portapapeles! Compártelo en tus redes.', 'success')
        })
        .catch(() => {
          toast('No se pudo copiar el enlace automáticamente.', 'error')
        })
    }
  }


  // Format Like number
  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K'
    }
    return num.toString()
  }

  return (
    <div className="flex flex-col gap-4 text-white">
      {/* Title */}
      <h1 className="text-xl sm:text-2xl font-bold tracking-tight leading-snug">
        🔥 MICRO DUELO DE INFLUENCERS - Gran Estreno | Micasino TV Show
      </h1>

      {/* Info Row: Creator details & Action buttons */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-2">
        {/* Creator Channel details */}
        <div className="flex items-center justify-between sm:justify-start gap-4">
          <div className="flex items-center gap-3">
            {/* Channel Avatar */}
            <div className="relative">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center font-bold text-black text-sm shadow-[0_0_15px_rgba(245,197,24,0.3)] bg-gradient-to-tr from-yellow-500 via-amber-400 to-yellow-300">
                🎰
              </div>
              <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-[#06070b]" title="En Vivo" />
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-1">
                <span className="flex items-center justify-center w-3.5 h-3.5 rounded-full bg-[var(--yellow)] text-black text-[9px] font-black" title="Canal Oficial">
                  ✓
                </span>
              </div>
              <span className="text-[11px] text-gray-400">1.2M suscriptores</span>
            </div>
          </div>

          {/* Subscription Button Group */}
          <div className="flex items-center gap-2 ml-4">
            <button
              onClick={handleSubscribe}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer ${isSubscribed
                  ? 'bg-white/10 text-white hover:bg-white/15'
                  : 'bg-white text-black hover:bg-white/90 shadow-[0_0_10px_rgba(255,255,255,0.15)]'
                }`}
            >
              {isSubscribed ? 'Suscrito' : 'Suscribirse'}
            </button>

            {isSubscribed && (
              <button
                onClick={toggleBell}
                className="p-2 rounded-full bg-white/10 hover:bg-white/15 text-white transition-colors cursor-pointer"
                title="Configuración de notificaciones"
              >
                {bellState === 'all' ? (
                  <BellRing className="w-4 h-4 text-[var(--yellow)] animate-bounce" />
                ) : (
                  <Bell className="w-4 h-4 text-gray-300" />
                )}
              </button>
            )}
          </div>
        </div>

        {/* Video Interaction Buttons */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          {/* Like / Dislike Split Button */}
          <div className="flex items-center rounded-full bg-white/10 border border-white/5 p-0.5">
            <button
              onClick={handleLike}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-l-full text-xs font-semibold hover:bg-white/5 transition-all cursor-pointer ${hasLiked ? 'text-[var(--yellow)] bg-white/5' : 'text-white'
                }`}
            >
              <ThumbsUp className={`w-3.5 h-3.5 ${hasLiked ? 'fill-current' : ''}`} />
              <span>{formatNumber(likesCount)}</span>
            </button>
            <div className="w-[1px] h-4 bg-white/20" />
            <button
              onClick={handleDislike}
              className={`px-3 py-1.5 rounded-r-full text-xs hover:bg-white/5 transition-all cursor-pointer ${hasDisliked ? 'text-red-400 bg-white/5' : 'text-white'
                }`}
              aria-label="No me gusta"
            >
              <ThumbsDown className={`w-3.5 h-3.5 ${hasDisliked ? 'fill-current' : ''}`} />
            </button>
          </div>

          {/* Share Button */}
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/10 border border-white/5 hover:bg-white/15 text-xs font-semibold transition-all cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Compartir</span>
          </button>


        </div>
      </div>

      {/* Description Box */}
      <div className="rounded-xl bg-white/5 border border-white/5 p-3.5 sm:p-4 text-xs sm:text-sm text-gray-300 leading-relaxed relative overflow-hidden transition-all duration-300">
        <div className="absolute top-0 left-0 w-1.5 h-full bg-[var(--yellow)]" />

        {/* Stats line */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-bold text-white mb-2">
          <span>1,240,512 vistas</span>
          <span className="w-1 h-1 rounded-full bg-gray-500" />
          <span>Estrenado el 25 may 2026</span>
          <span className="w-1 h-1 rounded-full bg-gray-500" />
          <span className="text-[var(--yellow)] flex items-center gap-0.5">
            <Sparkles className="w-3.5 h-3.5 fill-current animate-pulse" />
            #1 En tendencias de Gaming
          </span>
        </div>

        {/* Content text */}
        <div className="space-y-2">
          <p>
            ¡Bienvenidos al espectacular Gran Estreno de <strong>Micasino TV Show</strong>! 🎰✨
            Disfruta del emocionante micro duelo de influencers en vivo que pondrá a prueba su suerte, estrategia e ingenio en los juegos más picantes del casino.
          </p>

          {showDescription && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.2 }}
              className="space-y-3 pt-2 border-t border-white/5 mt-3"
            >
              <p>
                En esta primera edición de gala, las estrellas de las redes sociales se enfrentan cara a cara en tiempo real. ¿Quién se llevará la victoria a casa y quién tendrá que pagar la penitencia más divertida?
              </p>
              <div>
                <strong className="text-white">Redes del Show:</strong>
                <ul className="list-disc list-inside mt-1 text-gray-400 space-y-1 pl-1">
                  <li>Instagram: @MicasinoTV</li>
                  <li>TikTok: @MicasinoTVShow</li>
                  <li>Twitter: #MicasinoTVShow</li>
                </ul>
              </div>
              <p className="text-gray-400 text-xs">
                © 2026 Micasino Inc. Apto para mayores de 18 años. Juega con responsabilidad y diviértete al máximo con los micro duelos más virales de la red.
              </p>
            </motion.div>
          )}

          {/* Hashtags */}
          <div className="flex flex-wrap gap-2 pt-2 text-[var(--yellow)] font-semibold">
            <span>#Micasino</span>
            <span>#TVShow</span>
            <span>#MicroDuelo</span>
            <span>#Influencers</span>
            <span>#CasinoGaming</span>
          </div>

          {/* Toggle button */}
          <button
            onClick={() => setShowDescription(!showDescription)}
            className="mt-3 block text-white font-bold hover:text-[var(--yellow)] transition-colors cursor-pointer focus:outline-none"
          >
            {showDescription ? 'Mostrar menos' : '...más'}
          </button>
        </div>
      </div>
    </div>
  )
}
