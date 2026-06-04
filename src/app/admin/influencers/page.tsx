'use client'

import React, { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Sparkles, Upload, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import { createInfluencer } from './actions'

const POSITION_OPTIONS = [
  { value: 'MED', label: 'Live Show Host (Recomendado)' },
  { value: 'ENT', label: 'TV Show Host' },
  { value: 'POR', label: 'Slots Creator' },
  { value: 'DEF', label: 'Roulette Creator' },
  { value: 'DEL', label: 'VIP Player' },
]

const COUNTRIES = [
  { value: 'ARGENTINA', label: 'Argentina 🇦🇷' },
  { value: 'CHILE', label: 'Chile 🇨🇱' },
  { value: 'COLOMBIA', label: 'Colombia 🇨🇴' },
  { value: 'COSTA RICA', label: 'Costa Rica 🇨🇷' },
  { value: 'ECUADOR', label: 'Ecuador 🇪🇨' },
  { value: 'GUATEMALA', label: 'Guatemala 🇬🇹' },
  { value: 'HONDURAS', label: 'Honduras 🇭🇳' },
  { value: 'MEXICO', label: 'México 🇲🇽' },
  { value: 'PERU', label: 'Perú 🇵🇪' },
  { value: 'VENEZUELA', label: 'Venezuela 🇻🇪' },
]

export default function AdminInfluencersPage() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFileName(file.name)
    } else {
      setFileName(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    const form = e.currentTarget
    const formData = new FormData(form)

    startTransition(async () => {
      const result = await createInfluencer(null, formData)
      if (result.error) {
        setError(result.error)
      } else {
        setSuccess(result.success || '¡Influencer creado exitosamente!')
        form.reset()
        setFileName(null)
        // Redirect to /influencers after a brief delay
        setTimeout(() => {
          router.push('/influencers')
          router.refresh()
        }, 1500)
      }
    })
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 relative z-10">
      {/* Back button */}
      <Link
        href="/influencers"
        className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors mb-8 group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Volver a Influencers
      </Link>

      <div className="glass-card p-8 rounded-3xl border border-white/5 shadow-2xl relative overflow-hidden bg-[#0b0e14]/40">
        {/* Glow effect */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-yellow-500/10 rounded-full blur-[80px] pointer-events-none" />

        <div className="flex items-center gap-3 border-b border-white/10 pb-5 mb-6">
          <Sparkles className="w-6 h-6 text-yellow-500 animate-pulse" />
          <h1 className="font-display text-3xl sm:text-4xl tracking-wider text-white uppercase">
            Crear Nuevo Influencer
          </h1>
        </div>

        {/* Status Alerts */}
        {error && (
          <div className="flex items-start gap-3 p-4 rounded-xl bg-red-950/40 border border-red-500/30 text-red-200 text-sm mb-6 animate-fade-in">
            <AlertCircle className="w-5 h-5 shrink-0 text-red-500" />
            <p>{error}</p>
          </div>
        )}

        {success && (
          <div className="flex items-start gap-3 p-4 rounded-xl bg-green-950/40 border border-green-500/30 text-green-200 text-sm mb-6 animate-fade-in">
            <CheckCircle2 className="w-5 h-5 shrink-0 text-green-500" />
            <p>{success}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* Nombre */}
          <div className="flex flex-col gap-2">
            <label htmlFor="name" className="text-xs font-bold uppercase tracking-widest text-gray-400">
              Nombre Completo
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              placeholder="Ej. Ibai Llanos, AuronPlay"
              className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:border-yellow-500/50 focus:outline-none text-white transition-colors"
              disabled={isPending}
            />
          </div>

          {/* Red Social */}
          <div className="flex flex-col gap-2">
            <label htmlFor="socialNetwork" className="text-xs font-bold uppercase tracking-widest text-gray-400">
              Red Social Principal
            </label>
            <input
              type="text"
              id="socialNetwork"
              name="socialNetwork"
              required
              placeholder="Ej. Instagram: @ibai, TikTok: @auronplay, YouTube"
              className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:border-yellow-500/50 focus:outline-none text-white transition-colors"
              disabled={isPending}
            />
          </div>

          {/* País */}
          <div className="flex flex-col gap-2">
            <label htmlFor="country" className="text-xs font-bold uppercase tracking-widest text-gray-400">
              País
            </label>
            <select
              id="country"
              name="country"
              required
              className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:border-yellow-500/50 focus:outline-none text-white transition-colors"
              disabled={isPending}
            >
              <option value="" disabled selected className="bg-zinc-900 text-gray-400">Selecciona un país</option>
              {COUNTRIES.map((c) => (
                <option key={c.value} value={c.value} className="bg-zinc-900 text-white">
                  {c.label}
                </option>
              ))}
            </select>
          </div>



          {/* Biografía */}
          <div className="flex flex-col gap-2">
            <label htmlFor="bio" className="text-xs font-bold uppercase tracking-widest text-gray-400">
              Biografía / Descripción (Opcional)
            </label>
            <textarea
              id="bio"
              name="bio"
              rows={4}
              placeholder="Escribe una breve descripción o biografía del influencer..."
              className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:border-yellow-500/50 focus:outline-none text-white transition-colors resize-none"
              disabled={isPending}
            />
          </div>

          {/* Subir Imagen */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold uppercase tracking-widest text-gray-400">
              Imagen del Influencer (Fondo Transparente Recomendado)
            </label>
            <div className="relative border border-dashed border-white/10 rounded-xl hover:border-yellow-500/30 transition-colors p-6 flex flex-col items-center justify-center bg-black/25">
              <input
                type="file"
                id="imageFile"
                name="imageFile"
                accept="image/*"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={isPending}
              />
              <Upload className="w-8 h-8 text-gray-400 mb-2 group-hover:text-white transition-colors" />
              <p className="text-sm font-medium text-gray-300">
                {fileName ? fileName : 'Selecciona o arrastra una imagen'}
              </p>
              <p className="text-xs text-gray-500 mt-1">PNG, JPG, WEBP o SVG (Máx. 5MB)</p>
            </div>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={isPending}
            className="w-full mt-4 py-4 bg-yellow-500 hover:bg-yellow-400 text-black font-black text-sm uppercase tracking-widest rounded-xl transition-all shadow-[0_4px_15px_rgba(245,197,24,0.3)] disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.01] flex items-center justify-center gap-2 cursor-pointer"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Creando Influencer...
              </>
            ) : (
              <>
                Crear Influencer
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
