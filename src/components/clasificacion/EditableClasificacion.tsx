'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Upload, Loader2 } from 'lucide-react'
import { useToast } from '@/components/ui/ToastProvider'

interface EditableClasificacionProps {
  isAdmin: boolean
  initialTablaDePaisesUrl: string
  initialTablaDeSemanaUrl: string
}

export default function EditableClasificacion({
  isAdmin,
  initialTablaDePaisesUrl,
  initialTablaDeSemanaUrl,
}: EditableClasificacionProps) {
  const router = useRouter()
  const { toast } = useToast()

  const [tablaDePaisesUrl, setTablaDePaisesUrl] = useState(initialTablaDePaisesUrl || '/TablaDePaises.png')
  const [tablaDeSemanaUrl, setTablaDeSemanaUrl] = useState(initialTablaDeSemanaUrl || '/TablaDeSemana.png')
  
  const [isUploadingPaises, setIsUploadingPaises] = useState(false)
  const [isUploadingSemana, setIsUploadingSemana] = useState(false)

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'paises' | 'semana') => {
    const file = e.target.files?.[0]
    if (!file) return

    const isPaises = type === 'paises'
    if (isPaises) setIsUploadingPaises(true)
    else setIsUploadingSemana(true)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', type)

      const res = await fetch('/api/admin/classification/upload', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.error || 'Error al subir la imagen')
      }

      const result = await res.json()
      
      if (isPaises) {
        setTablaDePaisesUrl(result.url)
        toast('¡Tabla de países actualizada exitosamente!', 'success')
      } else {
        setTablaDeSemanaUrl(result.url)
        toast('¡Tabla de la semana actualizada exitosamente!', 'success')
      }
      
      router.refresh()
    } catch (err: any) {
      toast(err.message || 'Error al subir la imagen', 'error')
    } finally {
      if (isPaises) setIsUploadingPaises(false)
      else setIsUploadingSemana(false)
    }
  }

  return (
    <div className="max-w-[95%] sm:max-w-[90%] xl:max-w-[1200px] mx-auto flex flex-col gap-8 items-center">
      
      {/* Title Image */}
      <div className="flex justify-center mb-6 select-none pointer-events-none">
        <img 
          src="/titulo_clasificacion.png" 
          alt="Clasificación" 
          className="w-full max-w-[280px] sm:max-w-[380px] md:max-w-[480px] h-auto object-contain block" 
        />
      </div>

      {/* Grid: Country Table (Left) and Ranking emblem (Right) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center w-full">
        
        {/* Left Column: Tabla de Paises */}
        <div className="md:col-span-8 w-full flex flex-col items-center">
          <div className="relative w-full rounded-3xl overflow-hidden border border-zinc-200 bg-white shadow-lg p-2 group transition-all duration-300 hover:shadow-xl">
            <img 
              src={tablaDePaisesUrl} 
              alt="Tabla General de Clasificación de Países" 
              className="w-full h-auto object-contain block"
              loading="eager"
            />
            
            {/* Admin Upload Overlay */}
            {isAdmin && (
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-3">
                {isUploadingPaises ? (
                  <div className="flex flex-col items-center gap-2 text-white">
                    <Loader2 className="w-8 h-8 animate-spin text-yellow-500" />
                    <span className="font-bold text-sm uppercase tracking-wider">Subiendo Tabla...</span>
                  </div>
                ) : (
                  <label className="flex flex-col items-center gap-2 px-6 py-4 bg-yellow-500 hover:bg-yellow-600 active:scale-95 text-black font-black text-xs uppercase tracking-widest rounded-xl transition-all cursor-pointer shadow-lg select-none">
                    <Upload className="w-5 h-5" />
                    <span>Cambiar Tabla de Países</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={(e) => handleUpload(e, 'paises')} 
                      className="hidden" 
                      disabled={isUploadingPaises}
                    />
                  </label>
                )}
              </div>
            )}
            
            {/* Spinner overlay for safety when not hovering */}
            {isAdmin && isUploadingPaises && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-20">
                <Loader2 className="w-8 h-8 animate-spin text-yellow-500" />
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Ranking Emblem */}
        <div className="md:col-span-4 w-full flex flex-col items-center gap-4 text-center md:pl-4">
          <h3 className="font-sans font-black text-xl sm:text-2xl text-zinc-800 tracking-wide uppercase select-none drop-shadow-sm">
            SE ACTUALIZA A DIARIO
          </h3>
          <div className="w-full max-w-[320px] transition-transform duration-500 hover:scale-105 pointer-events-none select-none">
            <img 
              src="/Ranking.png" 
              alt="Ranking" 
              className="w-full h-auto object-contain block" 
            />
          </div>
        </div>

      </div>

      {/* Regular Phase Header Section */}
      <div className="flex justify-center mt-12 mb-6 pointer-events-none select-none">
        <img 
          src="/FaseRegular.png" 
          alt="Fase Regular" 
          className="w-full max-w-[300px] sm:max-w-[450px] md:max-w-[600px] h-auto object-contain block" 
        />
      </div>

      {/* Bottom Section: Tabla de la Semana */}
      <div className="w-full max-w-full flex flex-col items-center">
        <div className="relative w-full rounded-3xl overflow-hidden border border-zinc-200 bg-white shadow-lg p-2 group transition-all duration-300 hover:shadow-xl">
          <img 
            src={tablaDeSemanaUrl} 
            alt="Tabla de la Semana" 
            className="w-full h-auto object-contain block"
            loading="lazy"
          />
          
          {/* Admin Upload Overlay */}
          {isAdmin && (
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-3">
              {isUploadingSemana ? (
                <div className="flex flex-col items-center gap-2 text-white">
                  <Loader2 className="w-8 h-8 animate-spin text-yellow-500" />
                  <span className="font-bold text-sm uppercase tracking-wider">Subiendo Tabla...</span>
                </div>
              ) : (
                <label className="flex flex-col items-center gap-2 px-6 py-4 bg-yellow-500 hover:bg-yellow-600 active:scale-95 text-black font-black text-xs uppercase tracking-widest rounded-xl transition-all cursor-pointer shadow-lg select-none">
                  <Upload className="w-5 h-5" />
                  <span>Cambiar Tabla de la Semana</span>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={(e) => handleUpload(e, 'semana')} 
                    className="hidden" 
                    disabled={isUploadingSemana}
                  />
                </label>
              )}
            </div>
          )}
          
          {/* Spinner overlay for safety when not hovering */}
          {isAdmin && isUploadingSemana && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-20">
              <Loader2 className="w-8 h-8 animate-spin text-yellow-500" />
            </div>
          )}
        </div>
      </div>

    </div>
  )
}
