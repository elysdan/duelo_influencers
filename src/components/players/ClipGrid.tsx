'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Play, X, Plus, Trash2, Loader2, Upload } from 'lucide-react'
import { useToast } from '@/components/ui/ToastProvider'
import { addClipToInfluencer, deleteClipFromInfluencer } from '@/app/admin/influencers/actions'

interface Clip {
  id: string
  title: string
  thumbnailUrl: string
}

const isVideo = (url: string) => {
  if (!url) return false
  const cleanUrl = url.split('?')[0].split('#')[0]
  const ext = cleanUrl.split('.').pop()?.toLowerCase() || ''
  return ['mp4', 'webm', 'ogg', 'mov', 'quicktime'].includes(ext) || url.startsWith('data:video/')
}

const isGif = (url: string) => {
  if (!url) return false
  const cleanUrl = url.split('?')[0].split('#')[0]
  const ext = cleanUrl.split('.').pop()?.toLowerCase() || ''
  return ext === 'gif' || url.startsWith('data:image/gif')
}

interface ClipGridProps {
  playerName: string
  playerId: string
  isAdmin: boolean
  initialClips: Clip[]
}

export default function ClipGrid({ playerName, playerId, isAdmin, initialClips }: ClipGridProps) {
  const router = useRouter()
  const { toast } = useToast()
  
  // Selected clip for video player modal
  const [playingClip, setPlayingClip] = useState<Clip | null>(null)

  const clips = initialClips || []

  if (clips.length === 0 && !isAdmin) {
    return null
  }

  // Add clip modal state
  const [showAddModal, setShowAddModal] = useState(false)
  const [newClipTitle, setNewClipTitle] = useState('')
  const [newClipFile, setNewClipFile] = useState<File | null>(null)
  const [newClipPreview, setNewClipPreview] = useState<string | null>(null)
  const [isAdding, setIsAdding] = useState(false)

  // Delete clip confirmation state
  const [clipToDelete, setClipToDelete] = useState<Clip | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleCloseAddModal = () => {
    if (isAdding) return
    setShowAddModal(false)
    setNewClipTitle('')
    setNewClipFile(null)
    if (newClipPreview && newClipPreview.startsWith('blob:')) {
      URL.revokeObjectURL(newClipPreview)
    }
    setNewClipPreview(null)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setNewClipFile(file)
      if (newClipPreview && newClipPreview.startsWith('blob:')) {
        URL.revokeObjectURL(newClipPreview)
      }
      const previewUrl = URL.createObjectURL(file)
      setNewClipPreview(previewUrl)
    }
  }

  const handleAddClip = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newClipTitle.trim()) {
      toast('El título del clip es obligatorio', 'error')
      return
    }

    setIsAdding(true)

    try {
      const formData = new FormData()
      formData.append('playerId', playerId)
      formData.append('title', newClipTitle)
      if (newClipFile) {
        formData.append('file', newClipFile)
      }

      const res = await fetch('/api/admin/clips/upload', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.error || 'Error al subir el clip')
      }

      const result = await res.json()
      setIsAdding(false)

      if (result.error) {
        toast(result.error, 'error')
      } else {
        toast('¡Clip agregado exitosamente!', 'success')
        handleCloseAddModal()
        router.refresh()
      }
    } catch (err: any) {
      setIsAdding(false)
      toast(err.message || 'Error al guardar el clip', 'error')
    }
  }

  const handleDeleteClip = async () => {
    if (!clipToDelete) return

    setIsDeleting(true)
    const result = await deleteClipFromInfluencer(playerId, clipToDelete.id)
    setIsDeleting(false)
    setClipToDelete(null)

    if (result.error) {
      toast(result.error, 'error')
    } else {
      toast('¡Clip eliminado exitosamente!', 'success')
      router.refresh()
    }
  }

  return (
    <div className="mt-8">
      {/* Header section matching mockup styling */}
      <h2 className="font-sans font-black text-2xl mb-6 text-[#1a1a1a] uppercase tracking-tight select-none">
        CLIPS DESTACADOS
      </h2>

      {/* Grid of video clip thumbnails */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {clips.map((clip) => (
          <div
            key={clip.id}
            className="relative overflow-hidden rounded-2xl cursor-pointer group shadow-sm bg-neutral-200 aspect-[3/4] transition-transform duration-300 hover:scale-[1.01]"
          >
            {/* Thumbnail Image or Video */}
            {isVideo(clip.thumbnailUrl) ? (
              <video
                src={clip.thumbnailUrl}
                muted
                loop
                playsInline
                autoPlay
                onClick={() => setPlayingClip(clip)}
                className="w-full h-full object-cover block"
              />
            ) : (
              <img
                src={clip.thumbnailUrl}
                alt={clip.title}
                onClick={() => setPlayingClip(clip)}
                className="w-full h-full object-cover block"
              />
            )}

            {/* Play Overlay on Hover */}
            <div 
              onClick={() => setPlayingClip(clip)}
              className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
            >
              <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center shadow-md">
                <Play className="w-5 h-5 text-black fill-current translate-x-0.5" />
              </div>
            </div>

            {/* Admin Delete Action Button */}
            {isAdmin && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setClipToDelete(clip)
                }}
                className="absolute top-3 right-3 p-2 bg-red-600/90 text-white rounded-xl hover:bg-red-700 hover:scale-105 active:scale-95 transition-all shadow-md cursor-pointer z-10"
                title="Eliminar Clip"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}

        {/* Add Clip Empty Card for Admin */}
        {isAdmin && (
          <button
            onClick={() => setShowAddModal(true)}
            className="border-2 border-dashed border-zinc-400 hover:border-yellow-500 rounded-2xl flex flex-col items-center justify-center text-zinc-500 hover:text-yellow-600 transition-all duration-300 cursor-pointer gap-2 bg-white/50 aspect-[3/4] hover:scale-[1.01] shadow-sm"
          >
            <div className="w-12 h-12 rounded-full bg-zinc-200 flex items-center justify-center">
              <Plus className="w-6 h-6" />
            </div>
            <span className="font-bold text-sm uppercase tracking-wide">Agregar Clip</span>
          </button>
        )}
      </div>

      {/* Lightbox Video Player Modal */}
      {playingClip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div
            className="absolute inset-0"
            onClick={() => setPlayingClip(null)}
          />

          <div className="relative w-full max-w-3xl aspect-video rounded-2xl overflow-hidden bg-black border border-white/10 shadow-2xl z-10 animate-scale-up">
            {/* Header info */}
            <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/80 to-transparent flex items-center justify-between z-20">
              <span className="text-sm font-bold uppercase tracking-widest text-white drop-shadow-md">
                {playingClip.title}
              </span>
              <button
                onClick={() => setPlayingClip(null)}
                className="p-2 rounded-full bg-black/60 hover:bg-yellow-500 hover:text-black border border-white/10 hover:border-transparent text-white transition-all cursor-pointer"
                aria-label="Cerrar video"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Render video player, GIF image, or fallback coletilla video */}
            {isVideo(playingClip.thumbnailUrl) ? (
              <video
                src={playingClip.thumbnailUrl}
                controls
                autoPlay
                className="w-full h-full object-contain"
              />
            ) : isGif(playingClip.thumbnailUrl) ? (
              <div className="w-full h-full flex items-center justify-center bg-zinc-950">
                <img
                  src={playingClip.thumbnailUrl}
                  alt={playingClip.title}
                  className="w-full h-full object-contain"
                />
              </div>
            ) : (
              <video
                src="/videos/COLETILLA DUELO DE INFLUENCER WEB 20SEG-DEF.mp4"
                controls
                autoPlay
                className="w-full h-full object-contain"
              />
            )}
          </div>
        </div>
      )}

      {/* Add Clip Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div
            className="absolute inset-0"
            onClick={handleCloseAddModal}
          />
          <div className="bg-white border border-zinc-200 rounded-3xl p-8 max-w-md w-full shadow-2xl relative z-10 animate-scale-up">
            <h3 className="font-sans font-black text-2xl text-[#1a1a1a] uppercase tracking-wide mb-6">
              Agregar Clip Destacado
            </h3>

            <form onSubmit={handleAddClip} className="flex flex-col gap-5">
              {/* Clip Title */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-black uppercase tracking-widest text-zinc-600">
                  Título del Clip
                </label>
                <input
                  type="text"
                  value={newClipTitle}
                  onChange={(e) => setNewClipTitle(e.target.value)}
                  placeholder="Ej: James Rodríguez - Gol del Torneo"
                  required
                  disabled={isAdding}
                  className="w-full px-4 py-3 bg-white border border-zinc-300 rounded-xl focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 focus:outline-none text-[#1a1a1a] font-medium transition-colors"
                />
              </div>

              {/* Clip Thumbnail File */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-black uppercase tracking-widest text-zinc-600">
                  Video o GIF (Formato Vertical)
                </label>
                <div className="border-2 border-dashed border-zinc-300 rounded-xl p-4 text-center relative hover:border-yellow-500 transition-colors bg-zinc-50 cursor-pointer min-h-[160px] flex flex-col items-center justify-center">
                  {newClipPreview ? (
                    <div className="relative w-full h-[120px] rounded-lg overflow-hidden">
                      {newClipFile?.type.startsWith('video/') ? (
                        <video
                          src={newClipPreview}
                          muted
                          loop
                          playsInline
                          autoPlay
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <img
                          src={newClipPreview}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-zinc-500">
                      <Upload className="w-8 h-8 text-zinc-400" />
                      <span className="text-xs font-bold uppercase tracking-wider">Subir Video o GIF</span>
                      <span className="text-[10px] text-zinc-400">Recomendado: 3:4 o vertical</span>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="video/*,image/gif,image/png,image/jpeg,image/webp"
                    onChange={handleFileChange}
                    disabled={isAdding}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={handleCloseAddModal}
                  disabled={isAdding}
                  className="px-6 py-3 bg-zinc-200 hover:bg-zinc-300 text-zinc-800 font-black text-xs uppercase tracking-widest rounded-xl transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isAdding}
                  className="flex items-center gap-2 px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-black font-black text-xs uppercase tracking-widest rounded-xl transition-all cursor-pointer shadow-md"
                >
                  {isAdding ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    "Agregar Clip"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {clipToDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-white border border-zinc-200 rounded-3xl p-8 max-w-md w-full shadow-2xl text-center flex flex-col gap-6 animate-scale-up">
            <h3 className="font-sans font-black text-2xl text-red-600 uppercase tracking-wide">
              ¿Eliminar Clip?
            </h3>
            <p className="text-zinc-600 text-sm leading-relaxed">
              ¿Estás seguro de que deseas eliminar el clip <strong>{clipToDelete.title}</strong>? Esta acción es permanente.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setClipToDelete(null)}
                className="px-6 py-3 bg-zinc-200 hover:bg-zinc-300 text-zinc-800 font-black text-xs uppercase tracking-widest rounded-xl transition-all cursor-pointer"
                disabled={isDeleting}
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteClip}
                className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all cursor-pointer shadow-md"
                disabled={isDeleting}
              >
                {isDeleting ? (
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
    </div>
  )
}
