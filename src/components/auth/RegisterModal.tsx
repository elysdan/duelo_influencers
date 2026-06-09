'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { Mail, User, Lock, X, Eye, EyeOff, Loader2, Check, Phone, Contact } from 'lucide-react'
import { useToast } from '@/components/ui/ToastProvider'
import { signIn } from 'next-auth/react'

function RegisterModalContent() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  const isRegisterOpen = searchParams.get('register') === 'true'
  const isLoginOpen = searchParams.get('login') === 'true'

  // View state can be 'register' | 'login' | 'success' | null
  const [localView, setLocalView] = useState<'register' | 'login' | 'success' | null>(null)

  // Sync state with URL params
  useEffect(() => {
    if (isRegisterOpen) {
      setLocalView('register')
    } else if (isLoginOpen) {
      setLocalView('login')
    } else {
      setLocalView(null)
    }
  }, [isRegisterOpen, isLoginOpen])

  // --- Registration Form State ---
  const [registerForm, setRegisterForm] = useState({ fullName: '', email: '', phone: '', username: '', password: '' })
  const [registerAcceptedTerms, setRegisterAcceptedTerms] = useState(false)
  const [registerLoading, setRegisterLoading] = useState(false)
  const [registerError, setRegisterError] = useState('')
  const [showRegisterPass, setShowRegisterPass] = useState(false)

  // --- Login Form State ---
  const [loginForm, setLoginForm] = useState({ usernameOrEmail: '', password: '' })
  const [loginLoading, setLoginLoading] = useState(false)
  const [loginError, setLoginError] = useState('')
  const [showLoginPass, setShowLoginPass] = useState(false)

  // Reset registration form when view switches
  useEffect(() => {
    if (localView === 'register') {
      setRegisterForm({ fullName: '', email: '', phone: '', username: '', password: '' })
      setRegisterAcceptedTerms(false)
      setRegisterError('')
      setShowRegisterPass(false)
    }
  }, [localView])

  // Reset login form when view switches
  useEffect(() => {
    if (localView === 'login') {
      setLoginForm({ usernameOrEmail: '', password: '' })
      setLoginError('')
      setShowLoginPass(false)
    }
  }, [localView])

  if (!localView) return null

  const handleClose = () => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete('register')
    params.delete('login')
    const query = params.toString()
    router.push(`${pathname}${query ? `?${query}` : ''}`)
  }

  const handleGoToLogin = (e?: React.MouseEvent) => {
    e?.preventDefault()
    const params = new URLSearchParams(searchParams.toString())
    params.delete('register')
    params.set('login', 'true')
    const query = params.toString()
    router.push(`${pathname}${query ? `?${query}` : ''}`)
  }

  const handleGoToRegister = (e?: React.MouseEvent) => {
    e?.preventDefault()
    const params = new URLSearchParams(searchParams.toString())
    params.delete('login')
    params.set('register', 'true')
    const query = params.toString()
    router.push(`${pathname}${query ? `?${query}` : ''}`)
  }

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setRegisterError('')

    // Client-side validations
    // 0.5 Name and Last Name format
    if (!registerForm.fullName || registerForm.fullName.trim().length < 3) {
      setRegisterError('Por favor, ingresa tu Nombre y Apellido.')
      return
    }

    // 1. Email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(registerForm.email)) {
      setRegisterError('Por favor, ingresa un correo electrónico válido.')
      return
    }

    // 1.5 Phone format validation
    const phoneRegex = /^[+0-9\s-]{7,15}$/
    if (!phoneRegex.test(registerForm.phone)) {
      setRegisterError('Por favor, ingresa un número de teléfono válido (entre 7 y 15 dígitos).')
      return
    }

    // 2. Username: "Sólo letras y números sin espacios (4-12 caracteres)"
    const usernameRegex = /^[a-zA-Z0-9]{4,12}$/
    if (!usernameRegexRegex.test(registerForm.username)) {
      setRegisterError('El alias de usuario debe contener sólo letras y números, sin espacios (4 a 12 caracteres).')
      return
    }

    // 3. Password: "Mínimo 8 caracteres, 1 letra y 1 número"
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/
    if (!passwordRegex.test(registerForm.password)) {
      setRegisterError('La contraseña debe tener un mínimo de 8 caracteres, incluyendo al menos 1 letra y 1 número.')
      return
    }

    // 4. Terms and conditions
    if (!registerAcceptedTerms) {
      setRegisterError('Debes aceptar los Términos y Condiciones para continuar.')
      return
    }

    setRegisterLoading(true)

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: registerForm.fullName,
          name: registerForm.username,
          email: registerForm.email,
          password: registerForm.password,
          phone: registerForm.phone,
        }),
      })

      const data = await res.json()
      setRegisterLoading(false)

      if (!res.ok) {
        setRegisterError(data.error || 'Error al registrarse')
        return
      }

      toast('¡Cuenta creada exitosamente!', 'success')
      // Switch view to success screen (Image 1)
      setLocalView('success')
    } catch (err) {
      setRegisterLoading(false)
      setRegisterError('Ocurrió un error. Por favor intenta de nuevo.')
    }
  }

  // To avoid lint error: fix spelling of usernameRegexRegex
  const usernameRegexRegex = /^[a-zA-Z0-9]{4,12}$/

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError('')
    setLoginLoading(true)

    try {
      const result = await signIn('credentials', {
        email: loginForm.usernameOrEmail,
        password: loginForm.password,
        redirect: false,
      })

      setLoginLoading(false)

      if (result?.error) {
        setLoginError('Usuario, email o contraseña incorrectos')
        return
      }

      toast('¡Sesión iniciada correctamente!', 'success')
      handleClose()
      router.refresh()
    } catch (err) {
      setLoginLoading(false)
      setLoginError('Ocurrió un error. Por favor intenta de nuevo.')
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs transition-opacity duration-300">
      {/* Modal Dialog */}
      <div className="bg-[#f3f4f6] text-[#111827] border border-zinc-200/80 rounded-2xl w-full max-w-[420px] shadow-2xl flex flex-col overflow-hidden animate-scale-up">

        {/* --- VIEW: SUCCESS REGISTER (Image 1) --- */}
        {localView === 'success' && (
          <>
            {/* Header Close button */}
            <div className="relative px-6 py-5 flex items-center justify-end select-none">
              <button
                type="button"
                onClick={handleClose}
                className="absolute right-4 top-4 text-zinc-600 hover:text-zinc-900 transition-colors cursor-pointer"
                aria-label="Cerrar modal"
              >
                <X className="w-6 h-6 stroke-[1.5]" />
              </button>
            </div>

            {/* Success Content */}
            <div className="px-6 pb-8 pt-2 sm:px-8 sm:pb-10 flex flex-col items-center text-center">
              {/* Green circle with check icon */}
              <div className="w-16 h-16 bg-[#42ab49] rounded-full flex items-center justify-center mb-6 shadow-md select-none">
                <Check className="w-9 h-9 text-zinc-900 stroke-[3.5]" />
              </div>

              {/* Title */}
              <h2 className="text-2xl font-bold text-zinc-900 mb-2 select-none">
                ¡Listo!
              </h2>

              {/* Subtitle */}
              <p className="text-sm font-semibold text-zinc-500 mb-8 max-w-[320px] select-none leading-relaxed">
                Ya puedes ingresar a tu cuenta
              </p>

              {/* Acceder Button */}
              <button
                type="button"
                onClick={() => handleGoToLogin()}
                className="w-full py-3.5 bg-[#f5c518] hover:bg-[#d5ab12] active:scale-[0.99] text-zinc-950 font-bold text-base rounded-xl transition-all cursor-pointer shadow-md flex items-center justify-center"
              >
                Acceder
              </button>
            </div>
          </>
        )}

        {/* --- VIEW: REGISTER --- */}
        {localView === 'register' && (
          <>
            {/* Header Section with cream gradient */}
            <div
              className="relative px-6 py-6 flex items-center justify-center select-none"
              style={{
                background: 'linear-gradient(to bottom, rgba(245, 197, 24, 0.12) 0%, rgba(255, 255, 255, 0) 100%)'
              }}
            >
              <h2 className="text-2xl font-bold text-zinc-900 text-center">
                Registro
              </h2>
              <button
                type="button"
                onClick={handleClose}
                className="absolute right-4 top-4 text-zinc-600 hover:text-zinc-900 transition-colors cursor-pointer"
                aria-label="Cerrar modal"
              >
                <X className="w-6 h-6 stroke-[1.5]" />
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleRegisterSubmit} className="px-6 pb-6 pt-4 flex flex-col gap-4">
              {/* Nombre y Apellido */}
              <div className="flex flex-col gap-1 text-left">
                <label htmlFor="modal-fullname" className="text-sm font-semibold text-zinc-900">
                  Nombre y Apellido
                </label>
                <div className="relative">
                  <Contact className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                  <input
                    type="text"
                    id="modal-fullname"
                    required
                    value={registerForm.fullName}
                    onChange={(e) => setRegisterForm({ ...registerForm, fullName: e.target.value })}
                    placeholder="ejemplo: Maria Rodri"
                    className="w-full pl-11 pr-4 py-3 !bg-[#e5e7eb] !border-transparent rounded-lg text-sm text-[#111827] placeholder-zinc-400 outline-none focus:!bg-[#dcdce2] transition-all font-medium"
                  />
                </div>
              </div>

              {/* Correo electrónico */}
              <div className="flex flex-col gap-1 text-left">
                <label htmlFor="modal-email" className="text-sm font-semibold text-zinc-900">
                  Correo electrónico
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                  <input
                    type="email"
                    id="modal-email"
                    required
                    value={registerForm.email}
                    onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                    placeholder="ejemplo@mail.com"
                    className="w-full pl-11 pr-4 py-3 !bg-[#e5e7eb] !border-transparent rounded-lg text-sm text-[#111827] placeholder-zinc-400 outline-none focus:!bg-[#dcdce2] transition-all font-medium"
                  />
                </div>
              </div>

              {/* Teléfono */}
              <div className="flex flex-col gap-1 text-left">
                <label htmlFor="modal-phone" className="text-sm font-semibold text-zinc-900">
                  Teléfono
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                  <input
                    type="tel"
                    id="modal-phone"
                    required
                    value={registerForm.phone}
                    onChange={(e) => setRegisterForm({ ...registerForm, phone: e.target.value })}
                    placeholder="+5832874232"
                    className="w-full pl-11 pr-4 py-3 !bg-[#e5e7eb] !border-transparent rounded-lg text-sm text-[#111827] placeholder-zinc-400 outline-none focus:!bg-[#dcdce2] transition-all font-medium"
                  />
                </div>
              </div>

              {/* Alias de usuario */}
              <div className="flex flex-col gap-1 text-left">
                <label htmlFor="modal-username" className="text-sm font-semibold text-zinc-900">
                  Alias de usuario
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                  <input
                    type="text"
                    id="modal-username"
                    required
                    value={registerForm.username}
                    onChange={(e) => setRegisterForm({ ...registerForm, username: e.target.value })}
                    placeholder="Usuario"
                    className="w-full pl-11 pr-4 py-3 !bg-[#e5e7eb] !border-transparent rounded-lg text-sm text-[#111827] placeholder-zinc-400 outline-none focus:!bg-[#dcdce2] transition-all font-medium"
                  />
                </div>
                <span className="text-xs text-zinc-500 select-none leading-normal">
                  Sólo letras y números sin espacios (4-12 caracteres)
                </span>
              </div>

              {/* Contraseña */}
              <div className="flex flex-col gap-1 text-left">
                <label htmlFor="modal-password" className="text-sm font-semibold text-zinc-900">
                  Contraseña
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                  <input
                    type={showRegisterPass ? 'text' : 'password'}
                    id="modal-password"
                    required
                    value={registerForm.password}
                    onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                    placeholder="Ingresa tu contraseña"
                    className="w-full pl-11 pr-11 py-3 !bg-[#e5e7eb] !border-transparent rounded-lg text-sm text-[#111827] placeholder-zinc-400 outline-none focus:!bg-[#dcdce2] transition-all font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegisterPass(!showRegisterPass)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-zinc-500 hover:text-zinc-800 transition-colors cursor-pointer"
                  >
                    {showRegisterPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <span className="text-xs text-zinc-500 select-none leading-normal">
                  Mínimo 8 caracteres, 1 letra y 1 número
                </span>
              </div>

              {/* Checkbox: Términos y Condiciones */}
              <label className="flex items-start gap-2.5 cursor-pointer text-left select-none mt-1">
                <input
                  type="checkbox"
                  checked={registerAcceptedTerms}
                  onChange={(e) => setRegisterAcceptedTerms(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-2 border-zinc-650 text-yellow-500 focus:ring-yellow-500 cursor-pointer !bg-white"
                />
                <span className="text-xs sm:text-sm font-semibold text-zinc-800 leading-tight">
                  He leído y acepto los Términos y Condiciones
                </span>
              </label>

              {/* Error Message */}
              {registerError && (
                <p className="text-xs sm:text-sm text-red-600 bg-red-50 border border-red-200 p-2.5 rounded-lg text-left select-none animate-shake">
                  {registerError}
                </p>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={registerLoading}
                className="w-full py-3.5 bg-[#f5c518] hover:bg-[#d5ab12] active:scale-[0.99] text-zinc-950 font-bold text-base rounded-xl transition-all cursor-pointer shadow-md disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
              >
                {registerLoading && <Loader2 className="w-5 h-5 animate-spin" />}
                {registerLoading ? 'Continuando...' : 'Continuar'}
              </button>

              {/* Footer Link */}
              <p className="text-center text-sm font-semibold text-zinc-800 mt-2 select-none">
                ¿Tienes una cuenta?{' '}
                <button
                  type="button"
                  onClick={handleGoToLogin}
                  className="text-zinc-950 hover:text-black font-extrabold cursor-pointer hover:underline transition-colors ml-1"
                >
                  Acceder
                </button>
              </p>
            </form>
          </>
        )}

        {/* --- VIEW: LOGIN --- */}
        {localView === 'login' && (
          <>
            {/* Header Section with cream gradient */}
            <div
              className="relative px-6 py-6 flex items-center justify-center select-none"
              style={{
                background: 'linear-gradient(to bottom, rgba(245, 197, 24, 0.12) 0%, rgba(255, 255, 255, 0) 100%)'
              }}
            >
              <h2 className="text-2xl font-bold text-zinc-900 text-center">
                Acceder
              </h2>
              <button
                type="button"
                onClick={handleClose}
                className="absolute right-4 top-4 text-zinc-600 hover:text-zinc-900 transition-colors cursor-pointer"
                aria-label="Cerrar modal"
              >
                <X className="w-6 h-6 stroke-[1.5]" />
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleLoginSubmit} className="px-6 pb-6 pt-4 flex flex-col gap-4">
              {/* Usuario o email */}
              <div className="flex flex-col gap-1 text-left">
                <label htmlFor="login-username-email" className="text-sm font-semibold text-zinc-900">
                  Usuario o email
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                  <input
                    type="text"
                    id="login-username-email"
                    required
                    value={loginForm.usernameOrEmail}
                    onChange={(e) => setLoginForm({ ...loginForm, usernameOrEmail: e.target.value })}
                    placeholder="Usuario"
                    className="w-full pl-11 pr-4 py-3 !bg-[#e5e7eb] !border-transparent rounded-lg text-sm text-[#111827] placeholder-zinc-400 outline-none focus:!bg-[#dcdce2] transition-all font-medium"
                  />
                </div>
              </div>

              {/* Contraseña */}
              <div className="flex flex-col gap-1 text-left">
                <label htmlFor="login-password" className="text-sm font-semibold text-zinc-900">
                  Contraseña
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                  <input
                    type={showLoginPass ? 'text' : 'password'}
                    id="login-password"
                    required
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                    placeholder="Ingresa tu contraseña"
                    className="w-full pl-11 pr-11 py-3 !bg-[#e5e7eb] !border-transparent rounded-lg text-sm text-[#111827] placeholder-zinc-400 outline-none focus:!bg-[#dcdce2] transition-all font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPass(!showLoginPass)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-zinc-500 hover:text-zinc-800 transition-colors cursor-pointer"
                  >
                    {showLoginPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {loginError && (
                <p className="text-xs sm:text-sm text-red-600 bg-red-50 border border-red-200 p-2.5 rounded-lg text-left select-none animate-shake">
                  {loginError}
                </p>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loginLoading}
                className="w-full py-3.5 bg-[#f5c518] hover:bg-[#d5ab12] active:scale-[0.99] text-zinc-950 font-bold text-base rounded-xl transition-all cursor-pointer shadow-md disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
              >
                {loginLoading && <Loader2 className="w-5 h-5 animate-spin" />}
                {loginLoading ? 'Continuando...' : 'Continuar'}
              </button>

              {/* Footer Link */}
              <p className="text-center text-sm font-semibold text-zinc-800 mt-2 select-none">
                ¿No tienes una cuenta?{' '}
                <button
                  type="button"
                  onClick={handleGoToRegister}
                  className="text-zinc-950 hover:text-black font-extrabold cursor-pointer hover:underline transition-colors ml-1"
                >
                  Regístrate
                </button>
              </p>
            </form>
          </>
        )}

      </div>
    </div>
  )
}

export default function RegisterModal() {
  return (
    <Suspense fallback={null}>
      <RegisterModalContent />
    </Suspense>
  )
}
