import Link from 'next/link'
import { Flame } from 'lucide-react'
import type { players } from '@/db/schema'
import type { InferSelectModel } from 'drizzle-orm'

type Player = InferSelectModel<typeof players>

const POSITION_LABELS: Record<string, string> = {
  POR: 'Portero',
  DEF: 'Defensa',
  MED: 'Centrocampista',
  DEL: 'Delantero',
  ENT: 'Entrenador',
}

const POSITION_COLORS: Record<string, string> = {
  POR: 'var(--yellow)',
  DEF: '#60a5fa',
  MED: '#a78bfa',
  DEL: 'var(--red-light)',
  ENT: '#a3a3a3',
}

function PlayerCard({ player }: { player: Player }) {
  return (
    <Link
      href={`/influencers/${player.id}`}
      className="glass-card group flex flex-col items-center text-center p-6 transition-all hover:-translate-y-2 hover:border-opacity-50 rounded-2xl relative overflow-hidden"
      style={{ minWidth: '180px' }}
      aria-label={`Ver ficha de ${player.name}`}
    >
      {/* Glow fondo */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background: 'radial-gradient(ellipse at center, var(--yellow-glow) 0%, transparent 70%)',
        }}
      />

      {/* Foto / Avatar placeholder */}
      <div
        className="relative w-20 h-20 rounded-full mb-4 flex items-center justify-center text-3xl overflow-hidden"
        style={{ background: 'var(--bg-elevated)', border: '2px solid var(--border)' }}
      >
        {player.imageUrl ? (
          <img src={player.imageUrl} alt={player.name} className="w-full h-full object-cover" />
        ) : (
          <span>⚽</span>
        )}

        {/* Número de camiseta */}
        {player.number && (
          <div
            className="absolute bottom-0 right-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
            style={{ background: 'var(--yellow)', color: '#000' }}
          >
            {player.number}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="relative z-10">
        <span
          className="text-xs font-semibold uppercase tracking-wider mb-1 block"
          style={{ color: POSITION_COLORS[player.position] || 'var(--text-muted)' }}
        >
          {POSITION_LABELS[player.position]}
        </span>
        <h3 className="font-semibold text-sm leading-tight mb-3 group-hover:text-white transition-colors" style={{ color: 'var(--text-primary)' }}>
          {player.name}
        </h3>
        <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>{player.club}</p>

        {/* Hype counter */}
        <div
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
          style={{
            background: 'rgba(245,197,24,0.1)',
            border: '1px solid rgba(245,197,24,0.2)',
            color: 'var(--yellow)',
          }}
        >
          <Flame className="w-3.5 h-3.5" />
          {(player.hypeCount ?? 0).toLocaleString()} hype
        </div>
      </div>
    </Link>
  )
}

export default function PlayersCarousel({ players }: { players: Player[] }) {
  return (
    <section className="py-24 px-4" style={{ background: 'var(--bg-base)' }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-end justify-between mb-12">
          <div>
            <p className="text-xs uppercase tracking-widest mb-2 font-semibold" style={{ color: 'var(--blue-light)' }}>
              🔥 Los más queridos
            </p>
            <h2 className="font-display text-5xl sm:text-6xl tracking-wider" style={{ color: 'var(--text-primary)' }}>
              JUGADORES
            </h2>
          </div>
          <Link
            href="/influencers"
            className="hidden sm:flex items-center gap-2 text-sm font-medium hover:opacity-80 transition-opacity"
            style={{ color: 'var(--blue-light)' }}
          >
            Ver todos →
          </Link>
        </div>

        {/* Players grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {players.map((player) => (
            <PlayerCard key={player.id} player={player} />
          ))}
        </div>

        {players.length === 0 && (
          <div className="glass-card p-16 text-center rounded-2xl" style={{ border: '1px dashed var(--border)' }}>
            <p className="text-4xl mb-4">👥</p>
            <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>
              Cargando jugadores...
            </p>
          </div>
        )}
      </div>
    </section>
  )
}
