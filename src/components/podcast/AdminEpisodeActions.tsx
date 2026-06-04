'use client'

import { useState, useRef, useTransition } from 'react'
import { Edit2, Trash2, Upload, CheckCircle, AlertCircle, RefreshCw, X, ShieldAlert } from 'lucide-react'
import { editPodcastEpisode, deletePodcastEpisode } from '@/app/episodios/actions'

interface Episode {
  id: string
  episodeNumber: number
  title: string
  description: string
  shortDescription: string
  category: string
  thumbnailUrl: string
  youtubeId: string | null
  vimeoId: string | null
  dailymotionId: string | null
}

export default function AdminEpisodeActions({
  episode,
  isRealAdmin,
}: {
  episode: Episode
  isRealAdmin: boolean
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null)
  
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  if (!isRealAdmin) {
    return null
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      const reader = new FileReader()
      reader.onload = (event) => {
        setThumbnailPreview(event.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleEditSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    formData.append('id', episode.id)

    startTransition(async () => {
      setMessage(null)
      const res = await editPodcastEpisode(formData)
      if (res.success) {
        setMessage({ type: 'success', text: res.success })
        setIsEditing(false)
        setThumbnailPreview(null)
        
        // Reload to refresh the video player and fields on server/client
        window.location.reload()
      } else if (res.error) {
        setMessage({ type: 'error', text: res.error })
      }
    })
  }

  const handleDelete = () => {
    startTransition(async () => {
      setMessage(null)
      const res = await deletePodcastEpisode(episode.id)
      if (res.success) {
        setMessage({ type: 'success', text: res.success })
        setTimeout(() => {
          window.location.href = '/episodios'
        }, 1200)
      } else if (res.error) {
        setMessage({ type: 'error', text: res.error })
        setIsConfirmingDelete(false)
      }
    })
  }

  return (
    <div className="flex flex-col gap-4 w-full bg-[#0b0e14]/40 border border-white/5 rounded-3xl p-5 sm:p-6 mb-4 text-left relative overflow-hidden shadow-xl">
      <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 rounded-full blur-2xl pointer-events-none" />

      {/* Admin Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <ShieldAlert className="w-5 h-5 text-yellow-500 shrink-0" />
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-white">Consola de Moderación de Episodio</h4>
            <p className="text-[10px] text-gray-400">Panel administrativo exclusivo para editar o dar de baja este video.</p>
          </div>
        </div>

        {/* Buttons Controls */}
        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <button
            onClick={() => {
              setIsEditing(!isEditing)
              setIsConfirmingDelete(false)
              setMessage(null)
            }}
            className={`px-3 py-1.5 rounded-lg text-[9px] font-black transition-all uppercase tracking-wider cursor-pointer border flex items-center gap-1.5 ${isEditing ? 'bg-white/10 text-white border-white/15' : 'bg-yellow-500 hover:bg-yellow-600 text-black border-transparent shadow-[0_2px_8px_rgba(245,197,24,0.15)]'}`}
          >
            {isEditing ? <X className="w-3 h-3" /> : <Edit2 className="w-3 h-3" />}
            {isEditing ? 'Cancelar Edición' : 'Editar Episodio'}
          </button>

          {!isConfirmingDelete ? (
            <button
              onClick={() => {
                setIsConfirmingDelete(true)
                setIsEditing(false)
                setMessage(null)
              }}
              className="px-3 py-1.5 bg-red-600/10 border border-red-500/20 hover:bg-red-600 hover:text-white hover:border-transparent text-red-400 text-[9px] font-black rounded-lg transition-all flex items-center gap-1.5 uppercase tracking-wider cursor-pointer"
            >
              <Trash2 className="w-3 h-3" />
              Eliminar Episodio
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-bold text-red-400 uppercase font-mono animate-pulse shrink-0">¿Estás absolutamente seguro?</span>
              <button
                onClick={handleDelete}
                disabled={isPending}
                className="px-3 py-1.5 bg-red-600 text-white hover:bg-red-700 text-[9px] font-black rounded-lg transition-all uppercase tracking-wider cursor-pointer flex items-center gap-1"
              >
                {isPending ? <RefreshCw className="w-3 h-3 animate-spin" /> : null}
                Confirmar Borrado
              </button>
              <button
                onClick={() => setIsConfirmingDelete(false)}
                className="px-2.5 py-1.5 bg-white/5 border border-white/10 hover:bg-white/10 text-gray-300 text-[9px] font-black rounded-lg transition-all uppercase tracking-wider cursor-pointer"
              >
                Atrás
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Message Banner */}
      {message && (
        <div className={`mt-3 p-3.5 rounded-xl border flex items-center gap-2.5 text-xs font-bold font-mono ${message.type === 'success' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
          {message.type === 'success' ? <CheckCircle className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Form editing section */}
      {isEditing && (
        <form onSubmit={handleEditSubmit} className="mt-5 space-y-6 pt-5 border-t border-white/5 animate-fadeIn">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Episode Number */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black uppercase tracking-wider text-gray-400">N° Episodio</label>
              <input
                name="episodeNumber"
                type="number"
                required
                min="1"
                defaultValue={episode.episodeNumber}
                placeholder="Ej: 4"
                className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-yellow-500 transition-all font-mono"
              />
            </div>

            {/* Title */}
            <div className="md:col-span-2 flex flex-col gap-2">
              <label className="text-[10px] font-black uppercase tracking-wider text-gray-400">Título del Episodio</label>
              <input
                name="title"
                type="text"
                required
                defaultValue={episode.title}
                placeholder="Ej: 🎰 Ibai y Rubius: La revancha definitiva en vivo"
                className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-yellow-500 transition-all"
              />
            </div>

          </div>

          {/* Category & Short Description */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Category Tag */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black uppercase tracking-wider text-gray-400">Categoría / Etiqueta</label>
              <input
                name="category"
                type="text"
                required
                defaultValue={episode.category}
                placeholder="Ej: ENTREVISTA"
                className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-yellow-500 transition-all font-mono"
              />
            </div>

            {/* Short Description */}
            <div className="md:col-span-2 flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-black uppercase tracking-wider text-gray-400">Descripción Corta (Miniatura)</label>
                <span className="text-[9px] text-gray-500 font-mono">Máx. 120 caracteres</span>
              </div>
              <input
                name="shortDescription"
                type="text"
                required
                maxLength={120}
                defaultValue={episode.shortDescription}
                placeholder="Descripción breve para la miniatura..."
                className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-yellow-500 transition-all"
              />
            </div>

          </div>

          {/* Description */}
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black uppercase tracking-wider text-gray-400">Descripción del Show</label>
            <textarea
              name="description"
              required
              rows={3}
              defaultValue={episode.description}
              placeholder="Detalles sobre las pruebas, los invitados..."
              className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-yellow-500 resize-none transition-all leading-relaxed"
            />
          </div>

          {/* Video Platforms Links */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-white/5">
            
            {/* YouTube Link */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black uppercase tracking-wider text-gray-400">YouTube [Opción 1]</label>
              <input
                name="youtubeUrl"
                type="text"
                defaultValue={episode.youtubeId || ''}
                placeholder="ID o enlace de YouTube"
                className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-yellow-500 transition-all font-mono"
              />
            </div>

            {/* Vimeo Link */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black uppercase tracking-wider text-gray-400">Vimeo [Opción 2]</label>
              <input
                name="vimeoUrl"
                type="text"
                defaultValue={episode.vimeoId || ''}
                placeholder="ID o enlace de Vimeo"
                className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-yellow-500 transition-all font-mono"
              />
            </div>

            {/* DailyMotion Link */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black uppercase tracking-wider text-gray-400">DailyMotion [Opción 3]</label>
              <input
                name="dailymotionUrl"
                type="text"
                defaultValue={episode.dailymotionId || ''}
                placeholder="ID o enlace de DailyMotion"
                className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-yellow-500 transition-all font-mono"
              />
            </div>

          </div>

          {/* Thumbnail upload */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-white/5 items-center">
            
            {/* File Upload Selector */}
            <div className="md:col-span-2 flex flex-col gap-2">
              <label className="text-[10px] font-black uppercase tracking-wider text-gray-400">Miniatura del Episodio</label>
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold text-white transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5 text-yellow-500" />
                  Subir Nueva Imagen
                </button>
                <span className="text-[10px] text-gray-500">O ingresa un enlace web de imagen a la derecha</span>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  name="thumbnailFile"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                {thumbnailPreview && <span className="text-[9px] text-green-400 font-bold font-mono">¡Cargada!</span>}
              </div>
            </div>

            {/* Image Web Link Fallback */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black uppercase tracking-wider text-gray-400">O Enlace de Miniatura (URL)</label>
              <input
                name="thumbnailUrl"
                type="text"
                placeholder="https://ejemplo.com/imagen.jpg"
                defaultValue={thumbnailPreview ? '' : episode.thumbnailUrl}
                className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-yellow-500 transition-all"
              />
            </div>

          </div>

          {/* Thumbnail Preview Area */}
          {thumbnailPreview && (
            <div className="flex flex-col gap-2">
              <span className="text-[9px] font-black uppercase tracking-wider text-gray-500">Previsualización de Miniatura:</span>
              <div className="relative w-44 aspect-video rounded-xl overflow-hidden border border-white/10">
                <img src={thumbnailPreview} alt="Previsualización" className="w-full h-full object-cover" />
              </div>
            </div>
          )}

          {/* Save Button */}
          <div className="pt-4 border-t border-white/5 flex justify-end">
            <button
              type="submit"
              disabled={isPending}
              className="w-full sm:w-auto px-6 py-2.5 bg-yellow-500 hover:bg-yellow-600 text-black font-black uppercase tracking-wider text-[10px] rounded-lg shadow-[0_2px_8px_rgba(245,197,24,0.2)] transition-all cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              {isPending ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  Guardando Cambios...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" /> Guardar y Aplicar Cambios
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
