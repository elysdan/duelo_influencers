'use client'

import { useEffect, useState } from 'react'
import { getCountdown } from '@/lib/utils'
import { FIRST_MATCH_DATE } from '@/lib/calendar-data'

function CountdownBox({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div
        className="glass-card w-16 h-16 sm:w-28 sm:h-28 flex items-center justify-center mb-2 rounded-2xl"
        style={{ border: '1px solid var(--glass-border)' }}
      >
        <span
          className="font-mono-stats text-2xl sm:text-5xl font-bold tabular-nums"
          style={{ color: 'var(--yellow)' }}
        >
          {String(value).padStart(2, '0')}
        </span>
      </div>
      <span className="text-xs sm:text-sm uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
        {label}
      </span>
    </div>
  )
}

export default function HeroSection() {
  const [mounted, setMounted] = useState(false)
  const [countdown, setCountdown] = useState(getCountdown(FIRST_MATCH_DATE))

  useEffect(() => {
    setMounted(true)
    const interval = setInterval(() => {
      setCountdown(getCountdown(FIRST_MATCH_DATE))
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <section
      className="relative min-h-screen flex flex-col items-center justify-center text-center overflow-hidden"
      style={{ paddingTop: '64px' }}
    >
      {/* Fondo con gradiente tricolor animado */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background: `
            radial-gradient(ellipse 80% 60% at 50% -10%, rgba(0,56,168,0.35) 0%, transparent 60%),
            radial-gradient(ellipse 60% 40% at 10% 80%, rgba(245,197,24,0.15) 0%, transparent 50%),
            radial-gradient(ellipse 60% 40% at 90% 80%, rgba(206,17,38,0.15) 0%, transparent 50%),
            var(--bg-base)
          `,
        }}
      />

      {/* Líneas decorativas */}
      <div
        className="absolute inset-0 z-0 opacity-5"
        style={{
          backgroundImage: `
            linear-gradient(var(--border) 1px, transparent 1px),
            linear-gradient(90deg, var(--border) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Barra tricolor superior */}
      <div
        className="absolute top-16 left-0 right-0 h-1 z-10"
        style={{
          background: 'linear-gradient(90deg, var(--yellow) 33.3%, var(--blue) 33.3% 66.6%, var(--red) 66.6%)',
        }}
      />

      {/* Contenido */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6">
        {/* Badge */}
        <div
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-widest mb-8"
          style={{
            background: 'var(--glass)',
            border: '1px solid var(--glass-border)',
            color: 'var(--yellow)',
          }}
        >
          <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: 'var(--yellow)' }} />
          Mundial FIFA 2026
        </div>

        {/* Título principal */}
        <h1
          className="font-display text-6xl sm:text-8xl md:text-[10rem] leading-none tracking-wider mb-4"
          style={{ color: 'var(--text-primary)' }}
        >
          COLOMBIA
        </h1>
        <div className="relative inline-block mb-6">
          <div
            className="absolute inset-0 font-display text-3xl sm:text-6xl md:text-8xl tracking-widest blur-3xl opacity-60"
            style={{
              background: 'linear-gradient(90deg, var(--yellow), var(--blue-light), var(--red-light))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
            aria-hidden="true"
          >
            AL MUNDIAL
          </div>
          <div
            className="relative font-display text-3xl sm:text-6xl md:text-8xl tracking-widest"
            style={{
              background: 'linear-gradient(90deg, var(--yellow), var(--blue-light), var(--red-light))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            AL MUNDIAL
          </div>
        </div>

        <p className="text-base sm:text-lg mb-12 max-w-xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
          Primer partido: <strong style={{ color: 'var(--text-primary)' }}>🇨🇴 Colombia vs Uzbekistán uz</strong>
          <br />
          <span style={{ color: 'var(--text-muted)' }}>17 de junio de 2026 — Mexico City Stadium, Ciudad de México</span>
        </p>

        {/* Cuenta regresiva */}
        {!countdown.isOver ? (
          <div>
            <p className="text-xs uppercase tracking-widest mb-6" style={{ color: 'var(--text-muted)' }}>
              Faltan para el primer partido
            </p>
            <div className="flex items-start justify-center gap-2 sm:gap-6 opacity-0 transition-opacity duration-1000" style={{ opacity: mounted ? 1 : 0 }}>
              <CountdownBox value={mounted ? countdown.days : 0} label="Días" />
              <span className="font-mono-stats text-2xl sm:text-5xl font-bold pt-3 sm:pt-5" style={{ color: 'var(--text-muted)' }}>:</span>
              <CountdownBox value={mounted ? countdown.hours : 0} label="Horas" />
              <span className="font-mono-stats text-2xl sm:text-5xl font-bold pt-3 sm:pt-5" style={{ color: 'var(--text-muted)' }}>:</span>
              <CountdownBox value={mounted ? countdown.minutes : 0} label="Min" />
              <span className="font-mono-stats text-2xl sm:text-5xl font-bold pt-3 sm:pt-5" style={{ color: 'var(--text-muted)' }}>:</span>
              <CountdownBox value={mounted ? countdown.seconds : 0} label="Seg" />
            </div>
          </div>
        ) : (
          <div className="font-display text-4xl tracking-widest" style={{ color: 'var(--yellow)' }}>
            ¡EL MUNDIAL COMENZÓ!
          </div>
        )}

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-12">
          <a
            href="/influencers"
            className="px-8 py-4 rounded-xl font-semibold text-sm transition-all duration-200 hover:opacity-90 hover:scale-105"
            style={{ background: 'var(--yellow)', color: '#000' }}
          >
            Ver los Jugadores
          </a>
          <a
            href="/calendario"
            className="px-8 py-4 rounded-xl font-semibold text-sm transition-all duration-200 hover:scale-105"
            style={{
              background: 'var(--glass)',
              border: '1px solid var(--glass-border)',
              color: 'var(--text-primary)',
            }}
          >
            Ver el Calendario
          </a>
        </div>
      </div>

      {/* Flecha scroll */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-bounce">
        <div className="w-6 h-10 rounded-full border-2 flex items-start justify-center pt-2" style={{ borderColor: 'var(--border)' }}>
          <div className="w-1 h-3 rounded-full" style={{ background: 'var(--text-muted)' }} />
        </div>
      </div>
    </section>
  )
}
