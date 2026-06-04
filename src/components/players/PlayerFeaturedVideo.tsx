'use client'

import React, { useState, useTransition, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Upload, Trash2, Loader2, PlayCircle } from 'lucide-react'
import { deleteInfluencerVideo } from '@/app/admin/influencers/actions'
import { useToast } from '@/components/ui/ToastProvider'

interface PlayerFeaturedVideoProps {
  playerId: string
  videoUrl: string | null
  isAdmin: boolean
}

export default function PlayerFeaturedVideo({ playerId, videoUrl, isAdmin }: PlayerFeaturedVideoProps) {
  const router = useRouter()
  const { toast } = useToast()
  
  const [isPending, startTransition] = useTransition()
  const [isUploading, setIsUploading] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    const formData = new FormData()
    formData.append('playerId', playerId)
    formData.append('file', file)

    try {
      const response = await fetch('/api/admin/influencers/video/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok || data.error) {
        toast(data.error || 'Error al subir el video', 'error')
      } else {
        toast('¡Video de presentación subido exitosamente!', 'success')
        router.refresh()
      }
    } catch (err) {
      console.error('Error uploading video:', err)
      toast('Hubo un error de conexión al subir el video', 'error')
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleDeleteVideo = async () => {
    startTransition(async () => {
      const result = await deleteInfluencerVideo(playerId)
      setShowDeleteConfirm(false)

      if (result.error) {
        toast(result.error, 'error')
      } else {
        toast('¡Video eliminado exitosamente!', 'success')
        router.refresh()
      }
    })
  }

  // If no video exists and user is not an admin, hide the section entirely
  if (!videoUrl && !isAdmin) {
    return null
  }

  return (
    <div className="w-full mt-4 animate-fade-in relative">
      
      {/* Video Container (View Mode) */}
      {videoUrl ? (
        <div className="relative w-full aspect-video rounded-3xl overflow-hidden bg-zinc-900 shadow-md border border-zinc-200/50 group">
          <video
            src={videoUrl}
            controls
            className="w-full h-full object-cover"
            preload="metadata"
          />

          {/* Admin controls overlay */}
          {isAdmin && (
            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading || isPending}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-500 hover:bg-yellow-600 text-black font-black text-xs uppercase tracking-widest rounded-xl shadow-md transition-all cursor-pointer hover:scale-[1.02] disabled:opacity-50"
              >
                <Upload className="w-3.5 h-3.5" />
                Cambiar Video
              </button>
              
              <button
                onClick={() => setShowDeleteConfirm(true)}
                disabled={isUploading || isPending}
                className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-md transition-all cursor-pointer hover:scale-[1.05] disabled:opacity-50"
                title="Eliminar Video"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Upload progress overlay inside video wrapper */}
          {isUploading && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center gap-3 z-30 text-white">
              <Loader2 className="w-10 h-10 animate-spin text-yellow-500" />
              <span className="text-sm font-bold uppercase tracking-wider">Subiendo video...</span>
            </div>
          )}
        </div>
      ) : (
        /* Creator/Upload dropzone (Admins only) */
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="w-full aspect-video rounded-3xl border-2 border-dashed border-zinc-300 hover:border-yellow-500/50 bg-white hover:bg-zinc-50/50 transition-all p-8 flex flex-col items-center justify-center cursor-pointer relative shadow-sm group min-h-[300px]"
        >
          <div className="p-4 rounded-full bg-zinc-100 group-hover:bg-yellow-50 transition-colors mb-4 border border-zinc-200/50">
            <Upload className="w-8 h-8 text-zinc-400 group-hover:text-yellow-600 transition-colors" />
          </div>
          <span className="text-sm font-black uppercase tracking-wider text-zinc-700 group-hover:text-black transition-colors">
            Subir Video de Presentación
          </span>
          <span className="text-xs text-zinc-500 mt-1 text-center max-w-md">
            Arrastra o selecciona un archivo de video (MP4, WebM o MOV). El video se ubicará bajo el perfil del influencer.
          </span>

          {isUploading && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center gap-3 rounded-3xl z-10">
              <Loader2 className="w-10 h-10 animate-spin text-yellow-500" />
              <span className="text-sm font-bold text-zinc-700 uppercase tracking-wider">Subiendo video...</span>
            </div>
          )}
        </div>
      )}

      {/* Hidden file input for uploads */}
      <input
        type="file"
        ref={fileInputRef}
        accept="video/*"
        onChange={handleVideoUpload}
        className="hidden"
        disabled={isUploading || isPending}
      />

      {/* Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-white border border-zinc-200 rounded-3xl p-8 max-w-md w-full shadow-2xl text-center flex flex-col gap-6 animate-scale-up text-zinc-800">
            <h3 className="font-sans font-black text-2xl text-red-600 uppercase tracking-wide">
              ¿Eliminar Video?
            </h3>
            <p className="text-zinc-600 text-sm leading-relaxed">
              ¿Estás seguro de que deseas eliminar el video de presentación de este influencer? Esta acción es permanente y quitará el video del perfil público.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-6 py-3 bg-zinc-200 hover:bg-zinc-300 text-zinc-800 font-black text-xs uppercase tracking-widest rounded-xl transition-all cursor-pointer"
                disabled={isPending}
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteVideo}
                className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all cursor-pointer shadow-md disabled:opacity-50"
                disabled={isPending}
              >
                {isPending ? (
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
