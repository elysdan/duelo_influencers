'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { HelpCircle, Search } from 'lucide-react'

interface Game {
  id: string
  title: string
  imageUrl: string | null
  hasImage: boolean
  description: string | null
  createdAt: Date
}

interface JuegosListProps {
  initialGames: Game[]
  isAdmin: boolean
}

export default function JuegosList({ initialGames, isAdmin }: JuegosListProps) {
  const [searchTerm, setSearchTerm] = useState('')

  // Filter games based on search term
  const filteredGames = initialGames.filter((game) =>
    game.title.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="w-full flex flex-col gap-8 items-center">
      {/* Search and Administration Header Row */}
      <div className="w-full max-w-5xl mx-auto flex flex-col sm:flex-row gap-4 justify-between items-center w-full px-1">
        {/* Admin Link Button */}
        {isAdmin ? (
          <Link
            href="/admin/juegos"
            className="px-6 py-2.5 bg-yellow-500 hover:bg-yellow-400 text-black font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-md hover:scale-[1.02] flex items-center gap-2 cursor-pointer font-sans"
          >
            Administrar Juegos
          </Link>
        ) : (
          <div className="hidden sm:block" />
        )}

        {/* Search Input aligned to the right */}
        <div className="relative w-full sm:max-w-xs">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="w-4 h-4 text-zinc-400" />
          </span>
          <input
            type="text"
            placeholder="Buscar juego por nombre..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white text-black placeholder-zinc-500 border border-zinc-200/80 rounded-xl focus:outline-none focus:ring-1 focus:ring-yellow-500 focus:border-yellow-500 text-sm transition-all shadow-sm font-sans"
          />
        </div>
      </div>

      {/* Grid of Dynamic Games */}
      {filteredGames.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 md:gap-10 w-full max-w-5xl mx-auto mt-4">
          {filteredGames.map((game) => (
            <Link
              key={game.id}
              href={`/juegos/${game.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col gap-3 group cursor-pointer"
            >
              {/* Image card container (Square aspect ratio, edge-to-edge) */}
              <div className="relative w-full aspect-square rounded-2xl sm:rounded-3xl overflow-hidden border border-zinc-200/80 bg-white hover:border-yellow-500/50 hover:shadow-lg transition-all duration-300 flex items-center justify-center">
                {game.hasImage && game.imageUrl ? (
                  <img
                    src={game.imageUrl}
                    alt={game.title}
                    className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500 block select-none pointer-events-none"
                  />
                ) : (
                  <div className="w-full h-full bg-zinc-100 flex flex-col items-center justify-center p-6 border border-zinc-100 relative">
                    <HelpCircle className="w-12 h-12 text-zinc-400 group-hover:text-yellow-600 transition-colors duration-300" />
                    <span className="absolute bottom-4 text-[9px] font-black uppercase tracking-widest text-zinc-400 font-mono select-none">
                      PRÓXIMAMENTE
                    </span>
                  </div>
                )}
              </div>

              {/* Title */}
              <span className="text-sm sm:text-base font-black text-center text-black group-hover:text-yellow-600 transition-colors uppercase tracking-wider leading-snug mt-1">
                {game.title}
              </span>
            </Link>
          ))}
        </div>
      ) : (
        <div className="w-full text-center py-16">
          <p className="text-zinc-400 font-semibold text-sm sm:text-base font-sans">
            No se encontraron juegos que coincidan con "{searchTerm}"
          </p>
        </div>
      )}
    </div>
  )
}
