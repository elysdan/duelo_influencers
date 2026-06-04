'use client'

import { useState, useRef, useTransition } from 'react'
import { PlusCircle, Upload, CheckCircle, AlertCircle, Sparkles, UserCheck, Terminal, Image as ImageIcon } from 'lucide-react'
import { addBlogPost, seedBlogPosts } from '@/app/blog/actions'

export default function AdminBlogConsole({ 
  isDev,
  isRealAdmin 
}: { 
  isDev: boolean
  isRealAdmin: boolean 
}) {
  const [isOpen, setIsOpen] = useState(false)

  const [isPending, startTransition] = useTransition()
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null)
  
  const [mainPreview, setMainPreview] = useState<string | null>(null)
  const [additionalPreviews, setAdditionalPreviews] = useState<string[]>([])
  
  const mainInputRef = useRef<HTMLInputElement>(null)
  const additionalInputRef = useRef<HTMLInputElement>(null)
  const formRef = useRef<HTMLFormElement>(null)

  const handleMainFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      const reader = new FileReader()
      reader.onload = (event) => {
        setMainPreview(event.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleAdditionalFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files)
      const previews: string[] = []
      
      files.forEach((file) => {
        const reader = new FileReader()
        reader.onload = (event) => {
          if (event.target?.result) {
            previews.push(event.target.result as string)
            if (previews.length === files.length) {
              setAdditionalPreviews(previews)
            }
          }
        }
        reader.readAsDataURL(file)
      })
    }
  }

  const handleSeed = () => {
    if (!window.confirm('¿Seguro que quieres precargar los 3 artículos de blog de muestra de Ibai, fallos de eliminación y las penitencias?')) return

    startTransition(async () => {
      setMessage(null)
      const res = await seedBlogPosts()
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
    startTransition(async () => {
      setMessage(null)
      const result = await addBlogPost(formData)
      if (result.success) {
        setMessage({ type: 'success', text: result.success })
        setMainPreview(null)
        setAdditionalPreviews([])
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
      {/* Accordion Console */}
      <div className="glass-card rounded-3xl border border-white/5 overflow-hidden shadow-2xl">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-6 py-4 flex items-center justify-between bg-white/[0.02] hover:bg-white/[0.04] transition-colors cursor-pointer border-b border-white/5"
        >
          <div className="flex items-center gap-2.5">
            <PlusCircle className="w-5 h-5 text-yellow-500" />
            <span className="text-sm sm:text-base font-black uppercase tracking-wider text-white">Consola de Creación de Artículos</span>
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

              {/* Form fields */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Title */}
                <div className="md:col-span-2 flex flex-col gap-2">
                  <label className="text-xs font-black uppercase tracking-wider text-gray-400">Título del Artículo</label>
                  <input
                    name="title"
                    type="text"
                    required
                    placeholder="Ej: Hablando con 'El Rey': Sus secretos revelados"
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-all"
                  />
                </div>

                {/* Author */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-black uppercase tracking-wider text-gray-400">Autor</label>
                  <input
                    name="author"
                    type="text"
                    placeholder="Ej: Staff Técnico Micasino"
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-all"
                  />
                </div>

              </div>

              {/* Category and ReadTime row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Category */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-black uppercase tracking-wider text-gray-400">Categoría / Etiqueta</label>
                  <input
                    name="category"
                    type="text"
                    placeholder="Ej: ENTREVISTA, EPISODIO 03, COMUNIDAD"
                    defaultValue="ENTREVISTA"
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-all"
                  />
                </div>

                {/* Read Time */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-black uppercase tracking-wider text-gray-400">Tiempo de Lectura</label>
                  <input
                    name="readTime"
                    type="text"
                    placeholder="Ej: 3 min, 5 min"
                    defaultValue="3 min"
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-all"
                  />
                </div>
              </div>

              {/* Caption / Subtitle */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-black uppercase tracking-wider text-gray-400">Subtítulo / Copete (Caption)</label>
                <input
                  name="caption"
                  type="text"
                  placeholder="Resumen corto o bajada de título que aparece abajo de la imagen principal..."
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-all"
                />
              </div>

              {/* Content Textarea */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-black uppercase tracking-wider text-gray-400">Texto Completo del Artículo</label>
                <textarea
                  name="content"
                  required
                  rows={6}
                  placeholder="Escribe el cuerpo del artículo. Puedes usar saltos de línea para separar párrafos..."
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 resize-none transition-all leading-relaxed"
                />
              </div>

              {/* Image Uploads */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-white/5">
                
                {/* Main Image Selector */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-black uppercase tracking-wider text-gray-400">Imagen Principal (Fondo)</label>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => mainInputRef.current?.click()}
                      className="px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold text-white transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5 text-yellow-500" />
                      Cargar Imagen Principal
                    </button>
                    <input
                      ref={mainInputRef}
                      type="file"
                      name="mainImageFile"
                      accept="image/*"
                      onChange={handleMainFileChange}
                      className="hidden"
                    />
                    {mainPreview && <span className="text-[10px] text-green-400 font-bold font-mono">¡Cargada!</span>}
                  </div>
                  {mainPreview && (
                    <div className="relative w-36 aspect-video rounded-xl overflow-hidden border border-white/10 mt-2">
                      <img src={mainPreview} alt="Main preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>

                {/* Additional Images Selector */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-black uppercase tracking-wider text-gray-400">Imágenes Adicionales (Galería)</label>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => additionalInputRef.current?.click()}
                      className="px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold text-white transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <ImageIcon className="w-3.5 h-3.5 text-yellow-500" />
                      Subir Varias Imágenes
                    </button>
                    <input
                      ref={additionalInputRef}
                      type="file"
                      name="additionalImageFiles"
                      accept="image/*"
                      multiple
                      onChange={handleAdditionalFilesChange}
                      className="hidden"
                    />
                    {additionalPreviews.length > 0 && (
                      <span className="text-[10px] text-green-400 font-bold font-mono">
                        ¡{additionalPreviews.length} imágenes!
                      </span>
                    )}
                  </div>
                  {additionalPreviews.length > 0 && (
                    <div className="flex gap-2 flex-wrap mt-2">
                      {additionalPreviews.map((prev, idx) => (
                        <div key={idx} className="relative w-14 h-10 rounded-lg overflow-hidden border border-white/10">
                          <img src={prev} alt="Additional preview" className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>

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
                      Publicando Artículo...
                    </>
                  ) : (
                    <>
                      <PlusCircle className="w-4 h-4" /> Publicar Artículo en el Blog
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
