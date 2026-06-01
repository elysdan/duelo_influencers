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
  const videoSource = '/videos/MICRO DUELO DE INFLUENCER 1805 APROB.mp4'

  return (
    <div className="flex flex-col gap-8 w-full max-w-[95%] mx-auto px-4 sm:px-6 lg:px-8 pt-6">
      
      {/* 1. Large Immersive Video Player (always 100% width on top) */}
      <div className="w-full">
        <VideoPlayer src={videoSource} />
      </div>

      {/* 2. Blog Grid occupying full width (95% of layout) */}
      <div className="flex flex-col gap-6 w-full text-left">
        
        <div className="flex items-center gap-3 border-b border-white/5 pb-3">
          <Flame className="w-5 h-5 text-yellow-500 animate-pulse" />
          <h2 className="text-base font-black uppercase tracking-wider text-white">Noticias del Blog</h2>
        </div>

        {blogPosts.length === 0 ? (
          <div className="glass-card rounded-3xl p-12 text-center border-dashed border-2 border-white/10 opacity-70">
            <p className="text-xs text-gray-400">Aún no hay noticias cargadas en el blog.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogPosts.map((post) => {
              const isNew = new Date().getTime() - new Date(post.createdAt).getTime() < 1000 * 60 * 60 * 24 * 3
              const formattedDate = new Date(post.publishedAt).toLocaleDateString('es-ES', {
                day: '2-digit',
                month: 'short',
              })

              return (
                <Link 
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className="group flex flex-col justify-between h-full bg-[#0b0e14]/20 border border-white/5 rounded-3xl p-5 hover:bg-[#0b0e14]/40 hover:border-yellow-500/20 transition-all duration-300 shadow-lg cursor-pointer"
                >
                  <div className="flex flex-col gap-4">
                    {/* Symmetrical Aspect Ratio Image Container */}
                    <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black/40 border border-white/5">
                      <img 
                        src={post.imageUrl} 
                        alt={post.title} 
                        className="w-full h-full object-cover group-hover:scale-[1.05] transition-transform duration-500 block"
                        loading="lazy"
                      />
                      
                      {/* Category Pill Tag */}
                      <span className="absolute top-3 left-3 px-3 py-1 rounded bg-black/70 text-[9px] font-black uppercase tracking-widest text-gray-200 border border-white/10 select-none font-mono">
                        {post.category}
                      </span>

                      {/* NUEVO Badge Overlay */}
                      {isNew && (
                        <span className="absolute bottom-3 right-3 px-3 py-1 rounded bg-red-600 text-[9px] font-black uppercase tracking-wider text-white shadow-md animate-pulse select-none">
                          NUEVO
                        </span>
                      )}
                    </div>

                    {/* Post Info */}
                    <div className="flex flex-col gap-2">
                      <h3 className="text-base font-black leading-snug text-gray-100 group-hover:text-yellow-500 transition-colors line-clamp-2">
                        {post.title}
                      </h3>
                      <p className="text-xs text-gray-400 leading-relaxed line-clamp-3">
                        {post.caption || post.content}
                      </p>
                    </div>
                  </div>

                  {/* Clean Aligned Card Footer */}
                  <div className="flex flex-col gap-3 mt-4 pt-4 border-t border-white/5">
                    <div className="flex items-center justify-between text-[10px] font-bold text-gray-500 font-mono uppercase">
                      <span>Por: {post.author.split(' ')[0]}</span>
                      <span>{formattedDate}</span>
                    </div>
                    <div className="w-full text-center py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-white/5 text-gray-300 group-hover:bg-yellow-500 group-hover:text-black group-hover:shadow-[0_4px_10px_rgba(245,197,24,0.2)] border border-white/5 group-hover:border-transparent transition-all duration-300">
                      Leer Artículo
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}

      </div>

    </div>
  )
}

