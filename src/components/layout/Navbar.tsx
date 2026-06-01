'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { Menu, X, Shield } from 'lucide-react'
import { cn } from '@/lib/utils'
import { signOutAction } from '@/app/actions'

const NAV_LINKS = [
  { href: '/', label: 'Inicio' },
  { href: '/podcast', label: 'Episodios' },
  { href: '/blog', label: 'Blog' },
  { href: '/clasificacion', label: 'Clasificación' },
  { href: '/jugadores', label: 'Influencers' },
  { href: '/juegos', label: 'Juegos' },
]

export default function Navbar({ userName }: { userName?: string | null }) {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div
        style={{
          background: 'rgba(7,9,15,0.85)',
          borderBottom: '1px solid var(--glass-border)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
        }}
      >
        <div className="max-w-[95%] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center transition-transform hover:scale-[1.03] active:scale-[0.98] py-1 shrink-0" aria-label="Micasino TV Show - Inicio">
              <img
                src="/logo2.png"
                alt="Micasino TV Show Logo"
                className="h-10 md:h-12 w-auto object-contain block"
              />
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-1">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                    pathname === link.href
                      ? 'text-white'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  )}
                  style={
                    pathname === link.href
                      ? { background: 'var(--glass)', color: 'var(--yellow)' }
                      : {}
                  }
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Auth buttons */}
            <div className="hidden md:flex items-center gap-3">
              {userName ? (
                <div className="flex items-center gap-3">
                  <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    Hola, <strong style={{ color: 'var(--yellow)' }}>{userName.split(' ')[0]}</strong>
                  </span>
                  <Link
                    href="/perfil"
                    className="text-sm px-4 py-2 rounded-lg transition-all duration-200 hover:text-white"
                    style={{ color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
                  >
                    Perfil
                  </Link>
                  <form action={signOutAction}>
                    <button
                      type="submit"
                      className="text-sm px-4 py-2 rounded-lg transition-all duration-200 cursor-pointer hover:bg-white/5 hover:text-white"
                      style={{
                        color: 'var(--text-muted)',
                        border: '1px solid var(--border)',
                      }}
                    >
                      Salir
                    </button>
                  </form>
                </div>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="text-sm px-4 py-2 rounded-lg transition-all duration-200 hover:text-white"
                    style={{ color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
                  >
                    Iniciar sesión
                  </Link>
                  <Link
                    href="/register"
                    className="text-sm px-4 py-2 rounded-lg font-semibold transition-all duration-200 hover:opacity-90"
                    style={{
                      background: 'var(--yellow)',
                      color: '#000',
                    }}
                  >
                    Registrarse
                  </Link>
                </>
              )}
            </div>

            {/* Mobile menu toggle */}
            <button
              className="md:hidden p-2 rounded-lg transition-colors"
              style={{ color: 'var(--text-secondary)' }}
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div
            className="md:hidden px-4 pb-4 flex flex-col gap-2"
            style={{ borderTop: '1px solid var(--border)' }}
          >
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="px-4 py-3 rounded-lg text-sm font-medium transition-colors"
                style={{
                  color: pathname === link.href ? 'var(--yellow)' : 'var(--text-secondary)',
                  background: pathname === link.href ? 'var(--glass)' : 'transparent',
                }}
              >
                {link.label}
              </Link>
            ))}
            <div className="flex gap-2 pt-2">
              {userName ? (
                <>
                  <Link
                    href="/perfil"
                    onClick={() => setMenuOpen(false)}
                    className="flex-1 text-center text-sm px-4 py-2 rounded-lg font-semibold"
                    style={{ background: 'var(--yellow)', color: '#000' }}
                  >
                    Mi Perfil
                  </Link>
                  <form action={signOutAction} className="flex-1 flex">
                    <button
                      type="submit"
                      className="w-full text-center text-sm px-4 py-2 rounded-lg cursor-pointer hover:bg-white/5 transition-colors"
                      style={{ border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                    >
                      Salir
                    </button>
                  </form>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => setMenuOpen(false)}
                    className="flex-1 text-center text-sm px-4 py-2 rounded-lg"
                    style={{ border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                  >
                    Iniciar sesión
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMenuOpen(false)}
                    className="flex-1 text-center text-sm px-4 py-2 rounded-lg font-semibold"
                    style={{ background: 'var(--yellow)', color: '#000' }}
                  >
                    Registrarse
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
