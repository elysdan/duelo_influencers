import Link from 'next/link'
import { Shield } from 'lucide-react'

export default function Footer() {
  return (
    <footer
      style={{
        borderTop: '1px solid var(--border)',
        background: 'var(--bg-card)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="relative w-8 h-8 flex items-center justify-center">
                <img 
                  src="/logo.png" 
                  alt="Micasino TV Show Logo" 
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="font-display text-xl tracking-widest uppercase" style={{ color: 'var(--text-primary)' }}>
                Micasino <span style={{ color: 'var(--yellow)' }}>TV Show</span>
              </span>
            </div>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              La plataforma oficial de los micro duelos de influencers.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-semibold mb-4 text-sm uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
              Secciones
            </h3>
            <ul className="space-y-2">
              {[
                { href: '/noticias', label: 'Noticias del Show' },
                { href: '/jugadores', label: 'Influencers' },
                { href: '/calendario', label: 'Próximos Duelos' },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm transition-colors hover:text-white"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Colors */}
          <div>
            <h3 className="font-semibold mb-4 text-sm uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
              Paleta Oficial
            </h3>
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full" style={{ background: '#0b0e14', border: '1px solid var(--border-strong)' }} title="Dark Base" />
              <div className="w-8 h-8 rounded-full" style={{ background: 'var(--yellow)' }} title="Casino Gold" />
              <div className="w-8 h-8 rounded-full" style={{ background: '#A0AAB8' }} title="Steel Gray" />
            </div>
          </div>
        </div>

        <div
          className="mt-8 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4"
          style={{ borderTop: '1px solid var(--border)' }}
        >
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            © 2026 Micasino TV Show. Todos los derechos reservados.
          </p>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Hecho con 💛 y 🎰 para la comunidad
          </p>
        </div>
      </div>
    </footer>
  )
}
