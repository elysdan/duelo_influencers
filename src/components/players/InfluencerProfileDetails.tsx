'use client'

import React, { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { updateInfluencer, deleteInfluencer } from '@/app/admin/influencers/actions'
import { useToast } from '@/components/ui/ToastProvider'
import { Flame, Edit2, X, Check, Upload, Loader2, Trash2 } from 'lucide-react'

interface Player {
  id: string
  name: string
  position: string
  club: string
  number: number | null
  imageUrl: string | null
  bio: string | null
  age: number | null
  gender: string | null
  country: string | null
  hypeCount: number
  hasHyped: boolean
  instagramUrl?: string | null
  youtubeUrl?: string | null
}

interface InfluencerProfileDetailsProps {
  player: Player
  isAdmin: boolean
}

const POSITION_OPTIONS = [
  { value: 'MED', label: 'Live Show Host (Recomendado)' },
  { value: 'ENT', label: 'TV Show Host' },
  { value: 'POR', label: 'Slots Creator' },
  { value: 'DEF', label: 'Roulette Creator' },
  { value: 'DEL', label: 'VIP Player' },
]

const COUNTRIES = [
  { value: 'ARGENTINA', label: 'Argentina 🇦🇷' },
  { value: 'CHILE', label: 'Chile 🇨🇱' },
  { value: 'COLOMBIA', label: 'Colombia 🇨🇴' },
  { value: 'COSTA RICA', label: 'Costa Rica 🇨🇷' },
  { value: 'ECUADOR', label: 'Ecuador 🇪🇨' },
  { value: 'GUATEMALA', label: 'Guatemala 🇬🇹' },
  { value: 'HONDURAS', label: 'Honduras 🇭🇳' },
  { value: 'MEXICO', label: 'México 🇲🇽' },
  { value: 'PERU', label: 'Perú 🇵🇪' },
  { value: 'VENEZUELA', label: 'Venezuela 🇻🇪' },
]

function getPlatformName(url: string | null | undefined, fallback: string): string {
  if (!url) return fallback
  try {
    const trimmed = url.trim()
    const parsedUrl = trimmed.startsWith('http') ? trimmed : `https://${trimmed}`
    const domain = new URL(parsedUrl).hostname.replace('www.', '')
    if (domain.includes('instagram.com')) return 'Instagram'
    if (domain.includes('youtube.com') || domain.includes('youtu.be')) return 'YouTube'
    if (domain.includes('tiktok.com')) return 'TikTok'
    if (domain.includes('twitch.tv')) return 'Twitch'
    if (domain.includes('twitter.com') || domain.includes('x.com')) return 'Twitter / X'
    if (domain.includes('facebook.com')) return 'Facebook'
    if (domain.includes('kick.com')) return 'Kick'
    
    const parts = domain.split('.')
    return parts[0].charAt(0).toUpperCase() + parts[0].slice(1)
  } catch (e) {
    return fallback
  }
}

export default function InfluencerProfileDetails({ player, isAdmin }: InfluencerProfileDetailsProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isEditing, setIsEditing] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  // Delete action states
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isDeletePending, setIsDeletePending] = useState(false)

  const handleDelete = async () => {
    setIsDeletePending(true)
    setError(null)

    const result = await deleteInfluencer(player.id)
    setIsDeletePending(false)
    setShowDeleteConfirm(false)

    if (result.error) {
      setError(result.error)
      toast(result.error, 'error')
    } else {
      toast('¡Influencer eliminado exitosamente!', 'success')
      router.push('/influencers')
      router.refresh()
    }
  }

  // File upload preview state
  const [fileName, setFileName] = useState<string | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(player.imageUrl)

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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)

    const form = e.currentTarget
    const formData = new FormData(form)

    startTransition(async () => {
      const result = await updateInfluencer(player.id, null, formData)
      if (result.error) {
        setError(result.error)
        toast(result.error, 'error')
      } else {
        toast('¡Influencer actualizado exitosamente!', 'success')
        setIsEditing(false)
        setFileName(null)
        router.refresh()
      }
    })
  }

  // Format ID string, e.g. ID_G-001
  const formattedId = `ID_G-${String(player.number ?? 1).padStart(3, '0')}`

  return (
    <div className="bg-[#eaeaea] text-[#1a1a1a] rounded-3xl p-6 sm:p-10 shadow-md">

      {/* Admin Actions Bar */}
      {isAdmin && (
        <div className="flex justify-end mb-6">
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-black font-black text-xs uppercase tracking-widest rounded-xl transition-all cursor-pointer shadow-sm hover:scale-[1.02]"
            >
              <Edit2 className="w-3.5 h-3.5" />
              Modificar Perfil
            </button>
          ) : (
            <button
              onClick={() => {
                setIsEditing(false)
                setError(null)
                setImagePreview(player.imageUrl)
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

      {/* Alert Error */}
      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-300 text-red-800 text-sm rounded-xl">
          {error}
        </div>
      )}

      {!isEditing ? (
        /* ====== VIEW MODE ====== */
        <div className="grid grid-cols-1 md:grid-cols-[330px_1fr] gap-10 items-start">

          {/* Left Column: Portrait Card */}
          <div className="flex flex-col gap-4 w-full max-w-[330px] mx-auto">
            {/* Card Frame */}
            <div className="bg-[#6e6e6e] rounded-2xl overflow-hidden p-4 shadow-xl flex flex-col gap-4">
              {/* Card Header: ID & Online status */}
              <div className="flex justify-between items-center text-xs font-black uppercase tracking-wider px-1 text-yellow-500">
                <span>{formattedId}</span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 animate-pulse shadow-[0_0_8px_rgba(234,179,8,0.7)]" />
                  En Línea
                </span>
              </div>

              {/* Portrait Image Frame */}
              <div className="rounded-xl overflow-hidden aspect-[4/5] bg-neutral-800 relative">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt={player.name}
                    className="w-full h-full object-cover object-top"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-5xl">👤</div>
                )}
              </div>
            </div>

            {/* Social Media Buttons */}
            <div className="grid grid-cols-2 gap-4">
              {player.instagramUrl ? (
                <a
                  href={player.instagramUrl.trim().startsWith('http') ? player.instagramUrl.trim() : `https://${player.instagramUrl.trim()}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#2c2c2c] hover:bg-[#3d3d3d] text-yellow-500 hover:text-yellow-400 py-3 rounded-lg text-center font-black text-xs transition-all uppercase tracking-widest flex items-center justify-center gap-2 shadow-md cursor-pointer hover:scale-[1.02] active:scale-95"
                >
                  {getPlatformName(player.instagramUrl, 'Instagram')}
                </a>
              ) : (
                <div className="bg-[#2c2c2c]/40 text-zinc-500 py-3 rounded-lg text-center font-black text-xs uppercase tracking-widest cursor-not-allowed select-none">
                  Instagram
                </div>
              )}

              {player.youtubeUrl ? (
                <a
                  href={player.youtubeUrl.trim().startsWith('http') ? player.youtubeUrl.trim() : `https://${player.youtubeUrl.trim()}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#2c2c2c] hover:bg-[#3d3d3d] text-yellow-500 hover:text-yellow-400 py-3 rounded-lg text-center font-black text-xs transition-all uppercase tracking-widest flex items-center justify-center gap-2 shadow-md cursor-pointer hover:scale-[1.02] active:scale-95"
                >
                  {getPlatformName(player.youtubeUrl, 'YouTube')}
                </a>
              ) : (
                <div className="bg-[#2c2c2c]/40 text-zinc-500 py-3 rounded-lg text-center font-black text-xs uppercase tracking-widest cursor-not-allowed select-none">
                  YouTube
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Profile Info */}
          <div className="flex flex-col h-full justify-center pt-2 md:pt-4 text-right items-end">

            {/* Country Flag (positioned at the top right as shown in the image) */}
            {player.country && (
              <div className="w-14 h-14 rounded-full overflow-hidden border border-zinc-300 shadow-md mb-4 shrink-0 bg-white">
                <img
                  src={`/banderas/${player.country.toLowerCase().replace(' ', '-')}.png`}
                  alt={player.country}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Name + User Silhouette Icon */}
            <div className="flex items-center gap-3 mb-2 flex-wrap justify-end">
              <h1 className="font-sans text-4xl sm:text-5xl font-black text-[#1a1a1a] tracking-tight uppercase leading-none">
                {player.name}
              </h1>
              {/* User Outline Icon in Circle */}
              <div className="w-7 h-7 rounded-full border-2 border-[#333333] flex items-center justify-center shrink-0">
                <svg className="w-4 h-4 text-[#333333] fill-current" viewBox="0 0 24 24">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
              </div>
            </div>

            {/* Social Network + Flame Icon */}
            <div className="flex items-center gap-3 mb-4 justify-end flex-wrap">
              <span className="font-sans text-sm font-black uppercase tracking-widest text-[#2c2c2c]">
                {player.club || 'SIN RED SOCIAL'}
              </span>
              <div className="w-5 h-5 rounded-full border border-[#2c2c2c] flex items-center justify-center shrink-0">
                <Flame className="w-3 h-3 text-[#2c2c2c] fill-current" />
              </div>
            </div>

            {/* Age & Gender Row */}
            <div className="font-sans text-sm sm:text-base font-bold text-[#333333] uppercase tracking-wide mb-6">
              {player.age || 32} AÑOS, {player.gender || 'MASCULINO'}
            </div>

            {/* Bio Paragraph */}
            <p className="font-sans text-sm sm:text-base text-[#404040] leading-relaxed text-right mb-8 max-w-2xl">
              {player.bio || `${player.name} es una estrella de Micasino TV Show. Con talento, carisma y habilidades excepcionales, entrega todo su esfuerzo y diversión en cada duelo de influencers representando al canal oficial.`}
            </p>



          </div>

        </div>
      ) : (
        /* ====== EDIT MODE ====== */
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-[330px_1fr] gap-10 items-start">

          {/* Left Column: Portrait Card Edit */}
          <div className="bg-[#6e6e6e] rounded-2xl overflow-hidden p-4 shadow-xl w-full max-w-[330px] mx-auto flex flex-col gap-4">
            {/* Portrait Image Frame / Upload Preview */}
            <div className="rounded-xl overflow-hidden aspect-[4/5] bg-neutral-800 relative group">
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-full object-cover object-top"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-5xl">👤</div>
              )}

              {/* File input overlay */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 text-white p-4 text-center cursor-pointer">
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

            <p className="text-[10px] text-center text-zinc-200 mt-1">
              {fileName ? `Archivo: ${fileName}` : 'Formatos recomendados: PNG, JPG, WEBP'}
            </p>
          </div>

          {/* Right Column: Edit Inputs */}
          <div className="flex flex-col gap-5">
            <h2 className="font-sans text-2xl font-black uppercase tracking-wider text-[#1a1a1a] border-b pb-2 mb-2">
              Editar Datos de Influencer
            </h2>

            {/* Nombre */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="name" className="text-xs font-black uppercase tracking-widest text-zinc-600">
                Nombre Completo
              </label>
              <input
                type="text"
                id="name"
                name="name"
                defaultValue={player.name}
                required
                className="w-full px-4 py-3 bg-white border border-zinc-300 rounded-xl focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 focus:outline-none text-[#1a1a1a] font-medium transition-colors"
                disabled={isPending}
              />
            </div>

            {/* Red Social */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="socialNetwork" className="text-xs font-black uppercase tracking-widest text-zinc-600">
                Red Social Principal
              </label>
              <input
                type="text"
                id="socialNetwork"
                name="socialNetwork"
                defaultValue={player.club}
                required
                className="w-full px-4 py-3 bg-white border border-zinc-300 rounded-xl focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 focus:outline-none text-[#1a1a1a] font-medium transition-colors"
                disabled={isPending}
              />
            </div>

            {/* Instagram/Social URL 1 */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="instagramUrl" className="text-xs font-black uppercase tracking-widest text-zinc-600">
                Enlace de Red Social 1 (Opcional)
              </label>
              <input
                type="url"
                id="instagramUrl"
                name="instagramUrl"
                defaultValue={player.instagramUrl || ''}
                placeholder="Ej. https://www.instagram.com/nombre, o TikTok, Twitch..."
                className="w-full px-4 py-3 bg-white border border-zinc-300 rounded-xl focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 focus:outline-none text-[#1a1a1a] font-medium transition-colors"
                disabled={isPending}
              />
            </div>

            {/* YouTube/Social URL 2 */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="youtubeUrl" className="text-xs font-black uppercase tracking-widest text-zinc-600">
                Enlace de Red Social 2 (Opcional)
              </label>
              <input
                type="url"
                id="youtubeUrl"
                name="youtubeUrl"
                defaultValue={player.youtubeUrl || ''}
                placeholder="Ej. https://www.youtube.com/@nombre, o TikTok, Twitch..."
                className="w-full px-4 py-3 bg-white border border-zinc-300 rounded-xl focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 focus:outline-none text-[#1a1a1a] font-medium transition-colors"
                disabled={isPending}
              />
            </div>



            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Edad */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="age" className="text-xs font-black uppercase tracking-widest text-zinc-600">
                  Edad
                </label>
                <input
                  type="number"
                  id="age"
                  name="age"
                  min="1"
                  max="120"
                  defaultValue={player.age || 32}
                  required
                  className="w-full px-4 py-3 bg-white border border-zinc-300 rounded-xl focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 focus:outline-none text-[#1a1a1a] font-medium transition-colors"
                  disabled={isPending}
                />
              </div>

              {/* Género */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="gender" className="text-xs font-black uppercase tracking-widest text-zinc-600">
                  Género
                </label>
                <input
                  type="text"
                  id="gender"
                  name="gender"
                  defaultValue={player.gender || 'MASCULINO'}
                  required
                  className="w-full px-4 py-3 bg-white border border-zinc-300 rounded-xl focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 focus:outline-none text-[#1a1a1a] font-medium transition-colors"
                  disabled={isPending}
                />
              </div>

              {/* País */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="country" className="text-xs font-black uppercase tracking-widest text-zinc-600">
                  País
                </label>
                <select
                  id="country"
                  name="country"
                  required
                  defaultValue={player.country || ''}
                  className="w-full px-4 py-3 bg-white border border-zinc-300 rounded-xl focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 focus:outline-none text-[#1a1a1a] font-medium transition-colors"
                  disabled={isPending}
                >
                  <option value="" disabled className="text-gray-400">Selecciona un país</option>
                  {COUNTRIES.map((c) => (
                    <option key={c.value} value={c.value} className="text-[#1a1a1a]">
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Biografía */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="bio" className="text-xs font-black uppercase tracking-widest text-zinc-600">
                Biografía
              </label>
              <textarea
                id="bio"
                name="bio"
                rows={5}
                defaultValue={player.bio || ''}
                placeholder="Escribe la biografía del influencer..."
                className="w-full px-4 py-3 bg-white border border-zinc-300 rounded-xl focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 focus:outline-none text-[#1a1a1a] font-medium transition-colors resize-none"
                disabled={isPending}
              />
            </div>

            {/* Actions Buttons */}
            <div className="flex justify-between items-center gap-3 mt-4">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all cursor-pointer shadow-md hover:scale-[1.01] active:scale-95 disabled:opacity-50"
                disabled={isPending}
              >
                <Trash2 className="w-3.5 h-3.5" />
                Eliminar Perfil
              </button>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false)
                    setError(null)
                    setImagePreview(player.imageUrl)
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

          </div>

        </form>
      )}

      {/* Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-white border border-zinc-200 rounded-3xl p-8 max-w-md w-full shadow-2xl text-center flex flex-col gap-6 animate-scale-up">
            <h3 className="font-sans font-black text-2xl text-red-600 uppercase tracking-wide">
              ¿Eliminar Influencer?
            </h3>
            <p className="text-zinc-600 text-sm leading-relaxed">
              ¿Estás seguro de que deseas eliminar a <strong>{player.name}</strong>? Esta acción es permanente, borrará la ficha en la base de datos y eliminará de manera automática todos sus comentarios y hypes asociados.
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

    </div>
  )
}
