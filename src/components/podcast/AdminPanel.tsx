'use client'

import { useState, useRef, useTransition } from 'react'
import { PlusCircle, Upload, CheckCircle, AlertCircle, Sparkles, UserCheck, Play, Terminal } from 'lucide-react'
import { addPodcastEpisode, seedPodcastEpisodes } from '@/app/episodios/actions'

export default function AdminPanel({ 
  isDev,
  isRealAdmin 
}: { 
  isDev: boolean
  isRealAdmin: boolean 
}) {
  const [isOpen, setIsOpen] = useState(false)

  const [isPending, startTransition] = useTransition()
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null)
  
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const formRef = useRef<HTMLFormElement>(null)

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

  const handleSeed = () => {
    if (!window.confirm('¿Seguro que quieres precargar los episodios de muestra de Ibai, Coscu y Rubius?')) return

    startTransition(async () => {
      setMessage(null)
      const res = await seedPodcastEpisodes()
      if (res.success) {
        setMessage({ type: 'success', text: res.success })
      } else if (res.info) {
        setMessage({ type: 'success', text: res.info })
      } else if (res.error) {
        setMessage({ type: 'error', text: res.error })
      }
    })
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    // Add simulation flag
    formData.append('isSimulatedAdmin', 'false')

    startTransition(async () => {
      setMessage(null)
      const result = await addPodcastEpisode(formData)
      if (result.success) {
        setMessage({ type: 'success', text: result.success })
        setThumbnailPreview(null)
        formRef.current?.reset()
      } else if (result.error) {
        setMessage({ type: 'error', text: result.error })
      }
    })
  }

  if (!isRealAdmin) {
    return null
  }

  return (
    <div className="flex flex-col gap-4 mb-8">
      {/* Accordion Admin Form Panel */}
      <div className="glass-card rounded-3xl border border-white/5 overflow-hidden shadow-2xl">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-6 py-4 flex items-center justify-between bg-white/[0.02] hover:bg-white/[0.04] transition-colors cursor-pointer border-b border-white/5"
        >
          <div className="flex items-center gap-2.5">
            <PlusCircle className="w-5 h-5 text-yellow-500" />
            <span className="text-sm sm:text-base font-black uppercase tracking-wider text-white">Consola de Carga de Episodios</span>
          </div>
          <span className="text-[10px] uppercase font-bold tracking-widest text-gray-400 px-3 py-1 rounded-lg border border-white/5 bg-white/5">
            {isOpen ? 'Cerrar' : 'Abrir'}
          </span>
        </button>

        {isOpen && (
          <div className="p-6 sm:p-8 bg-[#0b0e14]/30">
            <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
              
              {message && (
                <div className={`p-4 rounded-xl flex items-center gap-3 border ${message.type === 'success' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                  {message.type === 'success' ? <CheckCircle className="w-5 h-5 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 flex-shrink-0" />}
                  <p className="text-xs font-bold font-mono">{message.text}</p>
                </div>
              )}

              {/* Grid Inputs */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Episode Number */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-black uppercase tracking-wider text-gray-400">N° Episodio</label>
                  <input
                    name="episodeNumber"
                    type="number"
                    required
                    min="1"
                    placeholder="Ej: 4"
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-all font-mono"
                  />
                </div>

                {/* Title */}
                <div className="md:col-span-2 flex flex-col gap-2">
                  <label className="text-xs font-black uppercase tracking-wider text-gray-400">Título del Episodio</label>
                  <input
                    name="title"
                    type="text"
                    required
                    placeholder="Ej: 🎰 Ibai y Rubius: La revancha definitiva en vivo"
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-all"
                  />
                </div>

              </div>

              {/* Description */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-black uppercase tracking-wider text-gray-400">Descripción del Show</label>
                <textarea
                  name="description"
                  required
                  rows={3}
                  placeholder="Detalles sobre las pruebas, los influencers invitados, sorpresas y lo que se discutió..."
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 resize-none transition-all leading-relaxed"
                />
              </div>

              {/* Video Platforms Links */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-white/5">
                
                {/* YouTube Link */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-black uppercase tracking-wider text-gray-400">YouTube [Opción 1]</label>
                    <span className="text-[9px] font-black text-yellow-500 tracking-wider">PRIORITARIO</span>
                  </div>
                  <input
                    name="youtubeUrl"
                    type="text"
                    placeholder="ID o enlace de YouTube"
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-all font-mono"
                  />
                </div>

                {/* Vimeo Link */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-black uppercase tracking-wider text-gray-400">Vimeo [Opción 2]</label>
                    <span className="text-[9px] font-black text-gray-500 tracking-wider">RESPALDO A</span>
                  </div>
                  <input
                    name="vimeoUrl"
                    type="text"
                    placeholder="ID o enlace de Vimeo"
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-all font-mono"
                  />
                </div>

                {/* DailyMotion Link */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-black uppercase tracking-wider text-gray-400">DailyMotion [Opción 3]</label>
                    <span className="text-[9px] font-black text-gray-500 tracking-wider">RESPALDO B</span>
                  </div>
                  <input
                    name="dailymotionUrl"
                    type="text"
                    placeholder="ID o enlace de DailyMotion"
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-all font-mono"
                  />
                </div>

              </div>

              {/* Thumbnail upload */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-white/5 items-center">
                
                {/* File Upload Selector */}
                <div className="md:col-span-2 flex flex-col gap-2">
                  <label className="text-xs font-black uppercase tracking-wider text-gray-400">Miniatura del Episodio</label>
                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-5 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-bold text-white transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <Upload className="w-4 h-4 text-yellow-500 animate-pulse" />
                      Subir Imagen Local
                    </button>
                    <span className="text-xs text-gray-500">O ingresa un enlace web de imagen a la derecha</span>
                    
                    <input
                      ref={fileInputRef}
                      type="file"
                      name="thumbnailFile"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </div>
                </div>

                {/* Image Web Link Fallback */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-black uppercase tracking-wider text-gray-400">O Enlace de Miniatura (URL)</label>
                  <input
                    name="thumbnailUrl"
                    type="text"
                    placeholder="https://ejemplo.com/imagen.jpg"
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-all"
                  />
                </div>

              </div>

              {/* Thumbnail Preview Area */}
              {thumbnailPreview && (
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-gray-500">Previsualización de Miniatura:</span>
                  <div className="relative w-44 aspect-video rounded-xl overflow-hidden border border-white/10">
                    <img src={thumbnailPreview} alt="Previsualización" className="w-full h-full object-cover" />
                  </div>
                </div>
              )}

              {/* Submit button */}
              <div className="pt-4 border-t border-white/5 flex justify-end">
                <button
                  type="submit"
                  disabled={isPending}
                  className="w-full sm:w-auto px-8 py-3.5 bg-yellow-500 text-black font-black uppercase tracking-wider text-xs rounded-xl shadow-[0_4px_15px_rgba(245,197,24,0.2)] hover:shadow-[0_4px_25px_rgba(245,197,24,0.35)] hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none cursor-pointer flex items-center justify-center gap-2"
                >
                  {isPending ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      Guardando Episodio...
                    </>
                  ) : (
                    <>
                      <PlusCircle className="w-4 h-4" /> Publicar Episodio en el Show
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>
        )}
      </div>
    </div>
  )
}
