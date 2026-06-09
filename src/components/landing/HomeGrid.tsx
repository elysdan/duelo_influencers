'use client'

import React, { useState } from 'react'
import VideoPlayer from '@/components/landing/VideoPlayer'
import Link from 'next/link'
import { Flame } from 'lucide-react'

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

interface BlogPostItem {
  id: string
  title: string
  slug: string
  imageUrl: string
  author: string
  publishedAt: Date
  caption: string | null
  content: string
  category: string
  readTime: string
  createdAt: Date
}

interface HomeGridProps {
  news: NewsItem[]
  players: PlayerItem[]
  blogPosts: BlogPostItem[]
  user: {
    name?: string | null
    email?: string | null
    image?: string | null
    id?: string | null
  } | null | undefined
}

export default function HomeGrid({ news, players, blogPosts = [], user }: HomeGridProps) {
  const videoSource = '/videos/COLETILLA DUELO DE INFLUENCER WEB 20SEG-DEF.mp4'
  const [isLivePlaying, setIsLivePlaying] = React.useState(false)

  // ==========================================
  // CONFIGURACIÓN DE YOUTUBE EN VIVO
  // ==========================================
  // Puedes pegar aquí el ID del video (ej. '5qap5aO4i9A') 
  // o el enlace completo de la transmisión en vivo de YouTube:
  // Ejemplos válidos:
  // - '5qap5aO4i9A'
  // - 'https://www.youtube.com/watch?v=5qap5aO4i9A'
  // - 'https://www.youtube.com/live/5qap5aO4i9A?feature=share'
  // - 'https://youtu.be/5qap5aO4i9A'
  const YOUTUBE_LIVE_URL_OR_ID = '5qap5aO4i9A'

  const getYouTubeEmbedUrl = (input: string) => {
    if (!input) return ''
    if (input.includes('youtube.com/embed/')) {
      return `${input}${input.includes('?') ? '&' : '?'}autoplay=1&mute=1`
    }

    let videoId = input.trim()
    try {
      if (videoId.includes('http://') || videoId.includes('https://')) {
        const url = new URL(videoId)
        if (url.hostname.includes('youtu.be')) {
          videoId = url.pathname.slice(1)
        } else if (url.pathname.startsWith('/live/')) {
          videoId = url.pathname.split('/')[2]
        } else {
          videoId = url.searchParams.get('v') || url.pathname.split('/').pop() || videoId
        }
      }
    } catch (e) {
    }

    if (videoId.includes('?')) videoId = videoId.split('?')[0]
    if (videoId.includes('&')) videoId = videoId.split('&')[0]

    return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1`
  }

  return (
    <div className="flex flex-col gap-8 w-full max-w-[95%] mx-auto px-4 sm:px-6 lg:px-8 pt-6">

      {/* 1. Large Immersive Video Player (always 100% width on top) */}
      <div className="w-full">
        <VideoPlayer src={videoSource} />
      </div>

      {/* 2. Side-by-Side Content Grid (Left: 2 Vertical Blog Posts, Right: Live Stream & Stadium Trophy Banner) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full text-left mt-4">

        {/* Left Column: Vertical Stack of 2 Blog Articles (lg:col-span-7) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="flex items-center gap-3 border-b border-white/5 pb-3">
            <Flame className="w-5 h-5 text-yellow-500 animate-pulse" />
            <h2 className="text-base font-black uppercase tracking-wider text-white">Noticias del Blog</h2>
          </div>

          {blogPosts.length === 0 ? (
            <div className="glass-card rounded-3xl p-12 text-center border-dashed border-2 border-white/10 opacity-70">
              <p className="text-xs text-gray-400">Aún no hay noticias cargadas en el blog.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-8">
              {blogPosts.slice(0, 2).map((post) => {
                const isNew = new Date().getTime() - new Date(post.createdAt).getTime() < 1000 * 60 * 60 * 24 * 3

                return (
                  <Link
                    key={post.id}
                    href={`/comunidad/${post.slug}`}
                    className="group flex flex-col gap-5 bg-[#0b0e14]/20 border border-white/5 rounded-3xl p-5 hover:bg-[#0b0e14]/40 hover:border-yellow-500/20 transition-all duration-300 shadow-lg cursor-pointer"
                  >
                    {/* Aspect ratio video layout container showing full styled thumbnail */}
                    <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black/40 border border-white/5">
                      <img
                        src={post.imageUrl}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500 block"
                        loading="lazy"
                      />

                      {/* Category Pill Tag */}
                      <span className="absolute top-4 left-4 px-3 py-1 rounded bg-black/85 text-[9px] font-black uppercase tracking-widest text-gray-200 border border-white/10 select-none font-mono">
                        {post.category}
                      </span>

                      {/* NUEVO Badge Overlay */}
                      {isNew && (
                        <span className="absolute bottom-4 right-4 px-3 py-1 rounded bg-red-600 text-[9px] font-black uppercase tracking-wider text-white shadow-md animate-pulse select-none font-bold">
                          NUEVO
                        </span>
                      )}
                    </div>

                    {/* Post Info text stacked vertically below */}
                    <div className="flex flex-col gap-2">
                      <h3 className="text-lg sm:text-xl font-black leading-snug text-gray-100 group-hover:text-yellow-500 transition-colors uppercase tracking-wide">
                        {post.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-400 leading-relaxed line-clamp-3">
                        {post.caption || post.content}
                      </p>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>

        {/* Right Column: Video Live Stream & Stadium Trophy Banner (lg:col-span-5) */}
        <div className="lg:col-span-7 flex flex-col gap-6 lg:pt-0 pt-6">

          {/* Top Widget: Live Presenter Card with Betting Call to Action */}
          <div className="flex flex-col gap-4">
            {/* Live Streaming Frame container */}
            <div
              onClick={() => setIsLivePlaying(true)}
              className="relative w-full aspect-video rounded-3xl overflow-hidden bg-black/60 border border-white/5 shadow-2xl group cursor-pointer keep-text-white"
            >
              {isLivePlaying ? (
                <iframe
                  src={getYouTubeEmbedUrl(YOUTUBE_LIVE_URL_OR_ID)}
                  title="YouTube Live Stream"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="w-full h-full border-0 block"
                />
              ) : (
                <>
                  <img
                    src="/video_live_stream.png"
                    alt="Video Live"
                    className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500 block"
                  />

                  {/* Blur Glowing Live Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/35 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.1)_0%,rgba(0,0,0,0.5)_100%)]">
                    <div className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-black/75 backdrop-blur-md border border-white/10 shadow-[0_0_30px_rgba(255,255,255,0.08)]">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                      <span className="text-base sm:text-lg font-black uppercase tracking-widest text-white select-none">
                        VIDEO LIVE
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Bottom Widget: Stadium World Cup Trophy Banner with Whatsapp Action */}
          <div className="relative w-full aspect-[4/3] sm:aspect-video lg:aspect-[4/3] xl:aspect-video rounded-3xl overflow-hidden bg-black/60 border border-white/5 shadow-2xl group mt-2 keep-text-white">
            <img
              src="/stadium_trophy.png"
              alt="Estadio Monumental y Copa del Mundo"
              className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500 block"
            />

            {/* Smooth dark gradient shadow */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />

            {/* WhatsApp Floating Pill Button */}
            <a
              href="https://wa.me/1234567890"
              target="_blank"
              rel="noreferrer"
              className="absolute bottom-4 right-4 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1a1b20]/95 border border-white/10 hover:bg-[#25D366] hover:text-white transition-all text-xs font-bold text-gray-200 shadow-xl group/wa hover:scale-[1.02]"
            >
              <svg className="w-4 h-4 fill-[#25D366] group-hover/wa:fill-white transition-colors" viewBox="0 0 24 24">
                <path d="M12.012 2c-5.506 0-9.989 4.478-9.99 9.984a9.96 9.96 0 0 0 1.335 4.963L2 22l5.233-1.372a9.912 9.912 0 0 0 4.773 1.216h.004c5.505 0 9.99-4.478 9.99-9.984 0-2.667-1.037-5.176-2.922-7.062A9.92 9.92 0 0 0 12.012 2zm5.835 14.165c-.244.688-1.226 1.254-1.685 1.298-.444.043-.992.057-2.31-.475a10.923 10.923 0 0 1-4.709-4.144c-.932-1.214-1.463-2.62-1.463-4.086 0-1.748.917-2.586 1.248-2.923.332-.337.734-.421.979-.421.245 0 .49.006.703.016.223.01.52.007.796.67.287.69.979 2.386 1.062 2.557.084.17.142.368.029.593-.113.226-.17.368-.337.565-.168.197-.354.437-.506.587-.168.167-.344.348-.148.687.197.337.876 1.44 1.878 2.33 1.292 1.15 2.378 1.505 2.716 1.674.337.168.535.14.733-.084.198-.225.845-.986 1.07-1.325.226-.338.452-.282.76-.169.309.113 1.954.922 2.293 1.09.338.169.564.254.647.395.085.14.085.816-.16 1.504z" />
              </svg>
              <span>Whatsapp</span>
            </a>
          </div>

        </div>

      </div>

    </div>
  )
}

