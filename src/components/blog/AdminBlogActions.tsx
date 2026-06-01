'use client'

import { useState, useRef, useTransition } from 'react'
import { Edit2, Trash2, Upload, CheckCircle, AlertCircle, RefreshCw, X, ShieldAlert } from 'lucide-react'
import { editBlogPost, deleteBlogPost } from '@/app/blog/actions'

interface BlogPost {
  id: string
  title: string
  slug: string
  imageUrl: string
  author: string
  publishedAt: Date
  caption: string | null
  content: string
  additionalImages: unknown
  category: string
  readTime: string
}

export default function AdminBlogActions({
  post,
  isDev,
  isRealAdmin,
}: {
  post: BlogPost
  isDev: boolean
  isRealAdmin: boolean
}) {
  const [isSimulated, setIsSimulated] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null)
  
  const [mainPreview, setMainPreview] = useState<string | null>(null)
  const [additionalPreviews, setAdditionalPreviews] = useState<string[]>([])
  
  const mainInputRef = useRef<HTMLInputElement>(null)
  const additionalInputRef = useRef<HTMLInputElement>(null)

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

  const handleEditSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    formData.append('id', post.id)
    formData.append('isSimulatedAdmin', isSimulated ? 'true' : 'false')

    startTransition(async () => {
      setMessage(null)
      const res = await editBlogPost(formData)
      if (res.success) {
        setMessage({ type: 'success', text: res.success })
        setIsEditing(false)
        setMainPreview(null)
        setAdditionalPreviews([])
        
        // Redirect to new slug page if slug changed to prevent 404
        if (res.newSlug && res.newSlug !== post.slug) {
          window.location.href = `/blog/${res.newSlug}`
        } else {
          // reload the page to refresh server components
          window.location.reload()
        }
      } else if (res.error) {
        setMessage({ type: 'error', text: res.error })
      }
    })
  }

  const handleDelete = () => {
    startTransition(async () => {
      setMessage(null)
      const res = await deleteBlogPost(post.id, isSimulated)
      if (res.success) {
        setMessage({ type: 'success', text: res.success })
        setTimeout(() => {
          window.location.href = '/blog'
        }, 1200)
      } else if (res.error) {
        setMessage({ type: 'error', text: res.error })
        setIsConfirmingDelete(false)
      }
    })
  }

  const canAccess = isRealAdmin || (isSimulated && isDev)

  return (
    <div className="flex flex-col gap-4 w-full bg-[#0b0e14]/40 border border-white/5 rounded-3xl p-5 sm:p-6 mb-2 text-left relative overflow-hidden shadow-xl">
      <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 rounded-full blur-2xl pointer-events-none" />

      {/* Admin Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <ShieldAlert className="w-5 h-5 text-yellow-500 shrink-0" />
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-white">Consola de Moderación</h4>
            <p className="text-[10px] text-gray-400">Panel administrativo exclusivo para editar o dar de baja este artículo.</p>
          </div>
        </div>

        {/* Buttons Controls */}
        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          {isDev && (
            <button
              onClick={() => {
                setIsSimulated(!isSimulated)
                setMessage(null)
              }}
              className={`px-3 py-1.5 rounded-lg text-[9px] font-black transition-all uppercase tracking-wider cursor-pointer border ${isSimulated ? 'bg-yellow-500 text-black border-transparent shadow-md' : 'bg-black/40 text-gray-500 border-white/10 hover:text-white'}`}
            >
              {isSimulated ? 'Admin Simulado' : 'Simular Admin'}
            </button>
          )}

          {canAccess && (
            <>
              <button
                onClick={() => {
                  setIsEditing(!isEditing)
                  setIsConfirmingDelete(false)
                  setMessage(null)
                }}
                className={`px-3 py-1.5 rounded-lg text-[9px] font-black transition-all uppercase tracking-wider cursor-pointer border flex items-center gap-1.5 ${isEditing ? 'bg-white/10 text-white border-white/15' : 'bg-yellow-500 hover:bg-yellow-600 text-black border-transparent shadow-[0_2px_8px_rgba(245,197,24,0.15)]'}`}
              >
                {isEditing ? <X className="w-3 h-3" /> : <Edit2 className="w-3 h-3" />}
                {isEditing ? 'Cancelar Edición' : 'Editar Artículo'}
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
                  Eliminar Artículo
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
            </>
          )}
        </div>
      </div>

      {/* Access Denied Warning */}
      {!canAccess && (
        <div className="mt-3 p-3.5 rounded-xl bg-red-500/5 border border-red-500/15 text-[10px] text-gray-400 leading-relaxed font-mono flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
          <span>Acceso Restringido. Utiliza la simulación superior o inicia sesión como administrador para habilitar las acciones.</span>
        </div>
      )}

      {/* Message Banner */}
      {message && (
        <div className={`mt-3 p-3.5 rounded-xl border flex items-center gap-2.5 text-xs font-bold font-mono ${message.type === 'success' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
          {message.type === 'success' ? <CheckCircle className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Form editing section */}
      {isEditing && canAccess && (
        <form onSubmit={handleEditSubmit} className="mt-5 space-y-4 pt-5 border-t border-white/5 animate-fadeIn">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Title */}
            <div className="md:col-span-2 flex flex-col gap-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-gray-400">Título del Artículo</label>
              <input
                name="title"
                type="text"
                required
                defaultValue={post.title}
                className="w-full bg-black/40 border border-white/10 rounded-xl p-2.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-yellow-500 transition-all font-sans font-medium"
              />
            </div>

            {/* Author */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-gray-400">Autor</label>
              <input
                name="author"
                type="text"
                defaultValue={post.author}
                className="w-full bg-black/40 border border-white/10 rounded-xl p-2.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-yellow-500 transition-all font-sans font-medium"
              />
            </div>
          </div>

          {/* Category and ReadTime Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-gray-400">Categoría / Etiqueta</label>
              <input
                name="category"
                type="text"
                defaultValue={post.category || 'ENTREVISTA'}
                className="w-full bg-black/40 border border-white/10 rounded-xl p-2.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-yellow-500 transition-all font-sans font-medium"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-gray-400">Tiempo de Lectura</label>
              <input
                name="readTime"
                type="text"
                defaultValue={post.readTime || '3 min'}
                className="w-full bg-black/40 border border-white/10 rounded-xl p-2.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-yellow-500 transition-all font-sans font-medium"
              />
            </div>
          </div>

          {/* Caption */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black uppercase tracking-wider text-gray-400">Subtítulo / Copete (Caption)</label>
            <input
              name="caption"
              type="text"
              defaultValue={post.caption || ''}
              className="w-full bg-black/40 border border-white/10 rounded-xl p-2.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-yellow-500 transition-all font-sans font-medium"
            />
          </div>

          {/* Content */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black uppercase tracking-wider text-gray-400">Texto del Artículo</label>
            <textarea
              name="content"
              required
              rows={8}
              defaultValue={post.content}
              className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-yellow-500 resize-none transition-all leading-relaxed font-sans font-medium"
            />
          </div>

          {/* Image Uploader */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-3 border-t border-white/5">
            {/* Main Image */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black uppercase tracking-wider text-gray-400">Imagen Principal (Fondo)</label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => mainInputRef.current?.click()}
                  className="px-3.5 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-[10px] font-bold text-white transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Upload className="w-3 h-3 text-yellow-500" />
                  Cambiar Fondo
                </button>
                <input
                  ref={mainInputRef}
                  type="file"
                  name="mainImageFile"
                  accept="image/*"
                  onChange={handleMainFileChange}
                  className="hidden"
                />
                {mainPreview && <span className="text-[9px] text-green-400 font-bold font-mono">¡Cargada!</span>}
              </div>
              
              {/* Image Input Url Fallback */}
              <input
                name="imageUrl"
                type="text"
                placeholder="O ingresa un enlace URL de imagen..."
                defaultValue={mainPreview ? '' : post.imageUrl}
                className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-[10px] text-white placeholder-gray-700 focus:outline-none focus:border-yellow-500 transition-all mt-1"
              />

              {mainPreview && (
                <div className="relative w-28 aspect-video rounded-lg overflow-hidden border border-white/10 mt-1">
                  <img src={mainPreview} alt="Main preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>

            {/* Additional Images (Gallery) */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black uppercase tracking-wider text-gray-400">Galería de Imágenes Adicionales</label>
              
              {/* Keep previous gallery checkbox */}
              <label className="inline-flex items-center gap-2 cursor-pointer select-none mb-1 text-gray-400 hover:text-white transition-colors">
                <input
                  type="checkbox"
                  name="keepPreviousGallery"
                  value="true"
                  defaultChecked
                  className="rounded bg-black/40 border-white/10 text-yellow-500 focus:ring-0 cursor-pointer"
                />
                <span className="text-[9px] font-bold uppercase tracking-wider font-mono">Mantener las imágenes actuales</span>
              </label>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => additionalInputRef.current?.click()}
                  className="px-3.5 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-[10px] font-bold text-white transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Upload className="w-3 h-3 text-yellow-500" />
                  Subir Más Fotos
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
                  <span className="text-[9px] text-green-400 font-bold font-mono">
                    ¡{additionalPreviews.length} cargadas!
                  </span>
                )}
              </div>
              
              <input
                name="additionalImagesUrl"
                type="text"
                placeholder="O ingresa enlaces URL separados por comas..."
                className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-[10px] text-white placeholder-gray-700 focus:outline-none focus:border-yellow-500 transition-all mt-1"
              />

              {additionalPreviews.length > 0 && (
                <div className="flex gap-1.5 flex-wrap mt-1">
                  {additionalPreviews.map((prev, idx) => (
                    <div key={idx} className="relative w-10 h-7 rounded overflow-hidden border border-white/10">
                      <img src={prev} alt="Additional preview" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Save Button */}
          <div className="pt-3 border-t border-white/5 flex justify-end">
            <button
              type="submit"
              disabled={isPending}
              className="w-full sm:w-auto px-6 py-2.5 bg-yellow-500 hover:bg-yellow-600 text-black font-black uppercase tracking-wider text-[10px] rounded-lg shadow-[0_2px_8px_rgba(245,197,24,0.2)] transition-all cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              {isPending ? (
                <>
                  <span className="w-3 h-3 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  Guardando Cambios...
                </>
              ) : (
                <>
                  <CheckCircle className="w-3.5 h-3.5" /> Guardar y Aplicar Cambios
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
