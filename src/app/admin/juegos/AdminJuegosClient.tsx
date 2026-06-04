'use client'

import React, { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Sparkles, Upload, Loader2, CheckCircle2, AlertCircle, Trash2 } from 'lucide-react'
import { createGame, deleteGame } from './actions'
import { useToast } from '@/components/ui/ToastProvider'

interface Game {
  id: string
  title: string
  imageUrl: string | null
  hasImage: boolean
  description: string | null
  createdAt: Date
}

interface AdminJuegosClientProps {
  initialGames: Game[]
}

export default function AdminJuegosClient({ initialGames }: AdminJuegosClientProps) {
  const router = useRouter()
  const { toast } = useToast()
  
  const [isPending, startTransition] = useTransition()
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  
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
    const title = formData.get('title') as string
    const description = formData.get('description') as string | null
    const imageFile = formData.get('imageFile') as File | null

    startTransition(async () => {
      const result = await createGame(title, description, imageFile)
      if (result.error) {
        setError(result.error)
        toast(result.error, 'error')
      } else {
        setSuccess('¡Juego creado exitosamente!')
        toast('Juego creado exitosamente', 'success')
        form.reset()
        setFileName(null)
        router.refresh()
      }
    })
  }

  const handleDelete = async (gameId: string, gameTitle: string) => {
    if (!confirm(`¿Estás seguro de que deseas eliminar el juego "${gameTitle}"?`)) {
      return
    }

    setIsDeleting(gameId)
    const result = await deleteGame(gameId)
    setIsDeleting(null)

    if (result.error) {
      toast(result.error, 'error')
    } else {
      toast('Juego eliminado exitosamente', 'success')
      router.refresh()
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 relative z-10 text-white animate-fade-in">
      {/* Back button */}
      <Link
        href="/juegos"
        className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors mb-8 group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Volver a Juegos
      </Link>

      <div className="max-w-xl mx-auto">
        
        {/* Form to Create Game */}
        <div className="glass-card p-8 rounded-3xl border border-white/5 shadow-2xl relative overflow-hidden bg-[#0b0e14]/40 w-full">
          {/* Glow effect */}
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-yellow-500/10 rounded-full blur-[80px] pointer-events-none" />

          <div className="flex items-center gap-3 border-b border-white/10 pb-5 mb-6">
            <Sparkles className="w-6 h-6 text-yellow-500 animate-pulse" />
            <h1 className="font-display text-2xl tracking-wider text-white uppercase">
              Agregar Juego
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
            {/* Title */}
            <div className="flex flex-col gap-2">
              <label htmlFor="title" className="text-xs font-bold uppercase tracking-widest text-gray-400">
                Título del Juego
              </label>
              <input
                type="text"
                id="title"
                name="title"
                required
                placeholder="Ej. Penales Extremas, Ruleta Rusa"
                className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:border-yellow-500/50 focus:outline-none text-white transition-colors"
                disabled={isPending}
              />
            </div>

            {/* Reglas / Descripción */}
            <div className="flex flex-col gap-2">
              <label htmlFor="description" className="text-xs font-bold uppercase tracking-widest text-gray-400">
                Reglas / Descripción del Juego
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                placeholder="Escribe las reglas de este juego..."
                className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:border-yellow-500/50 focus:outline-none text-white transition-colors resize-none font-sans"
                disabled={isPending}
              />
            </div>

            {/* Subir Imagen (Opcional) */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold uppercase tracking-widest text-gray-400">
                Imagen de Portada (Aspecto 3:4 o Vertical)
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
                <p className="text-sm font-medium text-gray-300 text-center">
                  {fileName ? fileName : 'Selecciona una imagen'}
                </p>
                <p className="text-xs text-gray-500 mt-1">PNG, JPG o WEBP (Dejar vacío para "Próximamente")</p>
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
                  Guardando Juego...
                </>
              ) : (
                "Agregar Juego"
              )}
            </button>
          </form>
        </div>

      </div>
    </div>
  )
}
