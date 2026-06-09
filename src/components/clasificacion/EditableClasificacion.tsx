'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Upload, Loader2 } from 'lucide-react'
import { useToast } from '@/components/ui/ToastProvider'

interface EditableClasificacionProps {
  isAdmin: boolean
  initialTablaDePaisesUrl: string
  initialTablaDeSemanaUrl: string
  initialSettings: Record<string, string>
}

const WEEKS = [1, 2, 3, 4, 5, 6, 7, 8]
const DAYS = ['L', 'M', 'X', 'J', 'V', 'S']

export default function EditableClasificacion({
  isAdmin,
  initialTablaDePaisesUrl,
  initialTablaDeSemanaUrl,
  initialSettings,
}: EditableClasificacionProps) {
  const router = useRouter()
  const { toast } = useToast()

  const [selectedWeek, setSelectedWeek] = useState(1)
  const [selectedDay, setSelectedDay] = useState('L')
  const [tablaDePaisesUrl, setTablaDePaisesUrl] = useState(initialTablaDePaisesUrl || '/TablaDePaises.png')
  const [tablaDeSemanaUrl, setTablaDeSemanaUrl] = useState(initialTablaDeSemanaUrl || '/TablaDeSemana.png')
  const [settings, setSettings] = useState<Record<string, string>>(initialSettings || {})
  
  const [isUploadingPaises, setIsUploadingPaises] = useState(false)
  const [isUploadingSemana, setIsUploadingSemana] = useState(false)

  const handleUpload = async (
    e: React.ChangeEvent<HTMLInputElement>, 
    type: 'paises' | 'semana',
    week?: number,
    day?: string
  ) => {
    const file = e.target.files?.[0]
    if (!file) return

    const isPaises = type === 'paises'
    const isTopSection = isPaises || (week !== undefined && day !== undefined)
    
    if (isTopSection) setIsUploadingPaises(true)
    else setIsUploadingSemana(true)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', type)
      if (week !== undefined) formData.append('week', week.toString())
      if (day !== undefined) formData.append('day', day)

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
      } else if (week !== undefined && day !== undefined) {
        const key = `tabla_semana_${week}_dia_${day}_url`
        setSettings((prev) => ({
          ...prev,
          [key]: result.url,
        }))
        toast(`¡Tabla de la Semana ${week} - Día ${day} actualizada exitosamente!`, 'success')
      } else {
        setTablaDeSemanaUrl(result.url)
        toast('¡Tabla de la semana actualizada exitosamente!', 'success')
      }
      
      router.refresh()
    } catch (err: any) {
      toast(err.message || 'Error al subir la imagen', 'error')
    } finally {
      if (isTopSection) setIsUploadingPaises(false)
      else setIsUploadingSemana(false)
    }
  }

  return (
    <div className="max-w-[95%] sm:max-w-[90%] xl:max-w-[1200px] mx-auto flex flex-col gap-8 items-center keep-text-white">
      
      {/* Title Image */}
      <div className="flex justify-center mb-10 select-none pointer-events-none">
        <img 
          src="/titulo_clasificacion.png" 
          alt="Clasificación" 
          className="w-full max-w-[280px] sm:max-w-[380px] md:max-w-[480px] h-auto object-contain block" 
        />
      </div>

      {/* Week Navigation */}
      <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2 mb-2 w-full">
        {WEEKS.map((week) => (
          <button
            key={week}
            type="button"
            onClick={() => setSelectedWeek(week)}
            className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded font-sans font-semibold text-xs sm:text-sm transition-all duration-150 cursor-pointer ${
              selectedWeek === week
                ? 'bg-zinc-900 text-white shadow-md border border-zinc-700'
                : 'bg-zinc-200 text-zinc-800 hover:bg-zinc-300'
            }`}
          >
            Semana {week}
          </button>
        ))}
      </div>

      {/* Day Navigation */}
      <div className="flex justify-center gap-2 mb-6 w-full">
        {DAYS.map((day) => (
          <button
            key={day}
            type="button"
            onClick={() => setSelectedDay(day)}
            className={`w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded font-sans font-black text-lg sm:text-xl transition-all duration-150 cursor-pointer ${
              selectedDay === day
                ? 'bg-zinc-900 text-white shadow-md border border-zinc-700'
                : 'bg-zinc-200 text-zinc-800 hover:bg-zinc-300'
            }`}
          >
            {day}
          </button>
        ))}
      </div>

      {/* Grid: Country Table (Left) and Ranking emblem (Right) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center w-full">
        
        {/* Left Column: Tabla de Paises */}
        <div className="md:col-span-8 w-full flex flex-col items-center">
          <div className="relative w-full rounded-3xl overflow-hidden border border-zinc-200 bg-white shadow-lg p-2 group transition-all duration-300 hover:shadow-xl">
            <img 
              src={settings[`tabla_semana_${selectedWeek}_dia_${selectedDay}_url`] || settings['tabla_de_paises_url'] || '/TablaDePaises.png'} 
              alt="Tabla de Clasificación" 
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
                  <div className="flex flex-col gap-2">
                    <label className="flex flex-col items-center gap-2 px-6 py-3 bg-yellow-500 hover:bg-yellow-600 active:scale-95 text-black font-black text-xs uppercase tracking-widest rounded-xl transition-all cursor-pointer shadow-lg select-none">
                      <Upload className="w-5 h-5" />
                      <span>Cambiar Tabla (Sem {selectedWeek} - Día {selectedDay})</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={(e) => handleUpload(e, 'semana', selectedWeek, selectedDay)} 
                        className="hidden" 
                        disabled={isUploadingPaises}
                      />
                    </label>
                    <label className="flex flex-col items-center gap-1 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 active:scale-95 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-lg select-none">
                      <span>Cambiar Tabla General</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={(e) => handleUpload(e, 'paises')} 
                        className="hidden" 
                        disabled={isUploadingPaises}
                      />
                    </label>
                  </div>
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
