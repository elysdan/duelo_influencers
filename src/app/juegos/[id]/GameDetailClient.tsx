'use client'

import React, { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { HelpCircle, Edit2, X, Check, Upload, Loader2, Trash2 } from 'lucide-react'
import { updateGame, deleteGame } from '@/app/admin/juegos/actions'
import { useToast } from '@/components/ui/ToastProvider'

interface Game {
  id: string
  title: string
  imageUrl: string | null
  hasImage: boolean
  description: string | null
  createdAt: Date
}

interface GameDetailClientProps {
  game: Game
  isAdmin: boolean
}

export default function GameDetailClient({ game, isAdmin }: GameDetailClientProps) {
  const router = useRouter()
  const { toast } = useToast()

  const [isEditing, setIsEditing] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  // Delete action states
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isDeletePending, setIsDeletePending] = useState(false)

  // File upload preview state
  const [fileName, setFileName] = useState<string | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(game.imageUrl)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFileName(file.name)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    } else {
      setFileName(null)
    }
  }

  const handleDelete = async () => {
    setIsDeletePending(true)
    setError(null)

    const result = await deleteGame(game.id)
    setIsDeletePending(false)
    setShowDeleteConfirm(false)

    if (result.error) {
      setError(result.error)
      toast(result.error, 'error')
    } else {
      toast('¡Juego eliminado exitosamente!', 'success')
      router.push('/juegos')
      router.refresh()
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)

    const form = e.currentTarget
    const formData = new FormData(form)
    const title = formData.get('title') as string
    const description = formData.get('description') as string | null
    const imageFile = formData.get('imageFile') as File | null

    startTransition(async () => {
      const result = await updateGame(game.id, title, description, imageFile)
      if (result.error) {
        setError(result.error)
        toast(result.error, 'error')
      } else {
        toast('¡Juego actualizado exitosamente!', 'success')
        setIsEditing(false)
        setFileName(null)
        router.refresh()
      }
    })
  }

  const defaultRulesText = "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since 1966, when designers at Letraset and James Mosley, the librarian at St Bride Printing Library, took a 1914 Cicero translation and scrambled it to make dummy text for Letraset's Body Type sheets."
  const rulesText = game.description && game.description.trim().length > 0 ? game.description : defaultRulesText

  return (
    <main className="flex-grow pt-32 pb-24 relative z-10">

      {/* Centered Title Logo */}
      <div className="w-full flex justify-center mb-10 px-4">
        <img
          src="/titulo_juegos.png"
          alt="Juegos"
          className="h-16 sm:h-20 md:h-24 lg:h-28 object-contain block drop-shadow-md"
        />
      </div>

      {/* Admin Actions Bar */}
      {isAdmin && (
        <div className="w-full max-w-5xl mx-auto px-6 sm:px-12 md:px-16 flex justify-end mb-6">
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-black font-black text-xs uppercase tracking-widest rounded-xl transition-all cursor-pointer shadow-sm hover:scale-[1.02]"
            >
              <Edit2 className="w-3.5 h-3.5" />
              Editar Juego
            </button>
          ) : (
            <button
              onClick={() => {
                setIsEditing(false)
                setError(null)
                setImagePreview(game.imageUrl)
                setFileName(null)
              }}
              className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-950 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all cursor-pointer shadow-sm"
              disabled={isPending}
            >
              <X className="w-3.5 h-3.5" />
              Cancelar Edición
            </button>
          )}
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="w-full max-w-5xl mx-auto px-6 sm:px-12 md:px-16 mb-6">
          <div className="p-4 bg-red-100 border border-red-300 text-red-800 text-sm rounded-xl">
            {error}
          </div>
        </div>
      )}

      {!isEditing ? (
        /* ====== VIEW MODE ====== */
        <div className="w-full max-w-5xl mx-auto px-6 sm:px-12 md:px-16 grid grid-cols-1 md:grid-cols-12 gap-12 items-start">

          {/* Left Column: Game poster (borderless structure) */}
          <div className="col-span-12 md:col-span-5 flex flex-col items-center gap-4">

            {/* Cover Image */}
            <div className="relative w-full max-w-[380px] aspect-[5/6] rounded-2xl overflow-hidden bg-zinc-100 flex items-center justify-center shadow-lg">
              {game.hasImage && game.imageUrl ? (
                <img
                  src={game.imageUrl}
                  alt={game.title}
                  className="w-full h-full object-cover block select-none pointer-events-none"
                />
              ) : (
                <HelpCircle className="w-16 h-16 text-zinc-300 animate-pulse" />
              )}
            </div>

            {/* Title under cover image */}
            <h3 className="text-lg sm:text-xl font-black text-center text-black uppercase tracking-wider leading-snug font-sans">
              {game.title}
            </h3>

          </div>

          {/* Right Column: Rules and description text */}
          <div className="col-span-12 md:col-span-7 flex flex-col gap-6 text-left">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-black uppercase tracking-wider select-none font-sans">
              REGLAS
            </h2>
            <p className="text-base sm:text-lg text-zinc-800 leading-relaxed font-sans">
              {rulesText}
            </p>
          </div>

        </div>
      ) : (
        /* ====== EDIT MODE ====== */
        <form onSubmit={handleSubmit} className="w-full max-w-5xl mx-auto px-6 sm:px-12 md:px-16 grid grid-cols-1 md:grid-cols-12 gap-12 items-start">

          {/* Left Column: Game poster Edit (borderless structure) */}
          <div className="col-span-12 md:col-span-5 flex flex-col items-center gap-4">

            {/* Cover Image inside card with file selection overlay */}
            <div className="relative w-full max-w-[320px] aspect-[5/6] rounded-2xl overflow-hidden bg-zinc-100 flex items-center justify-center shadow-lg group">
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Vista Previa"
                  className="w-full h-full object-cover block select-none pointer-events-none"
                />
              ) : (
                <HelpCircle className="w-16 h-16 text-zinc-300" />
              )}

              {/* File input overlay */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 text-white p-4 text-center cursor-pointer rounded-2xl">
                <Upload className="w-6 h-6 text-yellow-500" />
                <span className="text-xs font-bold uppercase tracking-widest">Cambiar Imagen</span>
                <span className="text-[10px] text-zinc-300 truncate max-w-full px-2">
                  {fileName || 'Seleccionar archivo'}
                </span>
              </div>
              <input
                type="file"
                id="imageFile"
                name="imageFile"
                accept="image/*"
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
                disabled={isPending}
              />
            </div>

            {/* Status/Format under cover image */}
            <div className="text-[10px] font-bold text-center text-zinc-500 uppercase tracking-wider truncate max-w-[320px] px-2 select-none">
              {fileName ? `Archivo: ${fileName}` : 'Formatos: PNG, JPG, WEBP'}
            </div>

          </div>

          {/* Right Column: Edit inputs */}
          <div className="col-span-12 md:col-span-7 flex flex-col gap-5">
            <h2 className="font-sans text-2xl font-black uppercase tracking-wider text-[#1a1a1a] border-b pb-2 mb-2">
              Editar Datos del Juego
            </h2>

            {/* Title input */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="title" className="text-xs font-black uppercase tracking-widest text-zinc-600">
                Título del Juego
              </label>
              <input
                type="text"
                id="title"
                name="title"
                defaultValue={game.title}
                required
                className="w-full px-4 py-3 bg-white border border-zinc-300 rounded-xl focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 focus:outline-none text-[#1a1a1a] font-medium transition-colors"
                disabled={isPending}
              />
            </div>

            {/* Description textarea */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="description" className="text-xs font-black uppercase tracking-widest text-zinc-600">
                Reglas / Descripción del Juego
              </label>
              <textarea
                id="description"
                name="description"
                rows={6}
                defaultValue={game.description || ''}
                placeholder="Escribe las reglas de este juego..."
                className="w-full px-4 py-3 bg-white border border-zinc-300 rounded-xl focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 focus:outline-none text-[#1a1a1a] font-medium transition-colors resize-none font-sans"
                disabled={isPending}
              />
            </div>

            {/* Actions Buttons */}
            <div className="flex gap-3 justify-end mt-4 items-center">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all cursor-pointer shadow-md mr-auto disabled:opacity-50"
                disabled={isPending}
              >
                <Trash2 className="w-3.5 h-3.5" />
                Eliminar Juego
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsEditing(false)
                  setError(null)
                  setImagePreview(game.imageUrl)
                  setFileName(null)
                }}
                className="px-6 py-3 bg-zinc-300 hover:bg-zinc-400 text-zinc-800 font-black text-xs uppercase tracking-widest rounded-xl transition-all cursor-pointer disabled:opacity-50"
                disabled={isPending}
              >
                Cancelar
              </button>

              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-black font-black text-xs uppercase tracking-widest rounded-xl transition-all cursor-pointer shadow-md hover:scale-[1.01] disabled:opacity-50"
                disabled={isPending}
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    Guardar Cambios
                  </>
                )}
              </button>
            </div>

          </div>

        </form>
      )}

      {/* Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-white border border-zinc-200 rounded-3xl p-8 max-w-md w-full shadow-2xl text-center flex flex-col gap-6 animate-scale-up">
            <h3 className="font-sans font-black text-2xl text-red-600 uppercase tracking-wide">
              ¿Eliminar Juego?
            </h3>
            <p className="text-zinc-600 text-sm leading-relaxed">
              ¿Estás seguro de que deseas eliminar el juego <strong>{game.title}</strong>? Esta acción es permanente y borrará este juego de la base de datos.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-6 py-3 bg-zinc-200 hover:bg-zinc-300 text-zinc-800 font-black text-xs uppercase tracking-widest rounded-xl transition-all cursor-pointer"
                disabled={isDeletePending}
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all cursor-pointer shadow-md disabled:opacity-50"
                disabled={isDeletePending}
              >
                {isDeletePending ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Eliminando...
                  </>
                ) : (
                  "Sí, eliminar"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </main>
  )
}
