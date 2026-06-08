'use client'

import { useState, useRef, useEffect } from 'react'
import { User, CheckCircle2, Upload, X, Trash2, Calendar, Phone, Mail, MapPin, Users } from 'lucide-react'

export default function ProfileForm({
  initialName,
  initialAvatar,
  initialPicture,
  initialFullName,
  initialBirthDate,
  initialPhone,
  initialAltEmail,
  initialAddressCountry,
  initialAddressState,
  initialAddressCity,
  initialGender,
  availableAvatars,
  updateAction,
  deleteAction,
  uploadAction,
}: {
  initialName: string
  initialAvatar: string | null
  initialPicture: string | null
  initialFullName?: string | null
  initialBirthDate?: Date | null
  initialPhone?: string | null
  initialAltEmail?: string | null
  initialAddressCountry?: string | null
  initialAddressState?: string | null
  initialAddressCity?: string | null
  initialGender?: string | null
  availableAvatars: string[]
  updateAction: (formData: FormData) => Promise<{ error?: string; success?: string }>
  deleteAction: (url: string) => Promise<{ error?: string; success?: string }>
  uploadAction: (formData: FormData) => Promise<{ error?: string; success?: string; url?: string }>
}) {
  const [name, setName] = useState(initialName)
  const [avatarUrl, setAvatarUrl] = useState(initialAvatar || '')
  
  // New Info States
  const [fullName, setFullName] = useState(initialFullName || '')
  const [birthDate, setBirthDate] = useState(initialBirthDate ? new Date(initialBirthDate).toISOString().split('T')[0] : '')
  const [phone, setPhone] = useState(initialPhone || '')
  const [altEmail, setAltEmail] = useState(initialAltEmail || '')
  const [addressCountry, setAddressCountry] = useState(initialAddressCountry || '')
  const [addressState, setAddressState] = useState(initialAddressState || '')
  const [addressCity, setAddressCity] = useState(initialAddressCity || '')
  const [gender, setGender] = useState(initialGender || '')
  
  const [picturePreview, setPicturePreview] = useState<string | null>(initialPicture)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      
      const reader = new FileReader()
      reader.onload = (event) => {
        setPicturePreview(event.target?.result as string)
      }
      reader.readAsDataURL(file)

      setLoading(true)
      setMessage(null)
      const formData = new FormData()
      formData.append('file', file)

      try {
        const result = await uploadAction(formData)
        if (result.url) {
          setAvatarUrl(result.url)
          setMessage({ type: 'success', text: result.success || 'Foto subida y seleccionada' })
        } else if (result.error) {
          setMessage({ type: 'error', text: result.error })
        }
      } catch (err) {
        setMessage({ type: 'error', text: 'Ocurrió un error al subir la imagen' })
      } finally {
        setLoading(false)
        if (fileInputRef.current) fileInputRef.current.value = ''
      }
    }
  }

  const handleDeleteAvatar = async (e: React.MouseEvent, url: string) => {
    e.preventDefault()
    if (!window.confirm('¿Seguro que quieres eliminar esta foto?')) return

    setDeleting(url)
    try {
      const result = await deleteAction(url)
      if (result.error) setMessage({ type: 'error', text: result.error })
      else {
        setMessage({ type: 'success', text: result.success || 'Foto eliminada' })
        if (avatarUrl === url) setAvatarUrl('')
        if (picturePreview === url) setPicturePreview(null)
      }
    } catch {
      setMessage({ type: 'error', text: 'Error al eliminar' })
    } finally {
      setDeleting(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!name.trim()) return

    setLoading(true)
    setMessage(null)

    const formData = new FormData()
    formData.append('name', name)
    formData.append('avatarUrl', avatarUrl)
    formData.append('fullName', fullName)
    formData.append('birthDate', birthDate)
    formData.append('phone', phone)
    formData.append('altEmail', altEmail)
    formData.append('addressCountry', addressCountry)
    formData.append('addressState', addressState)
    formData.append('addressCity', addressCity)
    formData.append('gender', gender)

    try {
      const result = await updateAction(formData)
      if (result.error) {
        setMessage({ type: 'error', text: result.error })
      } else if (result.success) {
        setMessage({ type: 'success', text: result.success })
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Error inesperado al actualizar el perfil' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 glass-card p-6 sm:p-8 relative overflow-hidden backdrop-blur-md">
      
      {/* Decorative gradient */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--yellow)]/10 rounded-full blur-[80px] pointer-events-none" />

      {message && (
        <div className={`p-4 rounded-xl flex items-center gap-3 ${message.type === 'success' ? 'bg-green-500/20 text-green-700 border border-green-500/30' : 'bg-red-500/20 text-red-700 border border-red-500/30'}`}>
          {message.type === 'success' && <CheckCircle2 className="w-5 h-5 flex-shrink-0" />}
          <p className="text-sm font-medium">{message.text}</p>
        </div>
      )}

      {/* Profile Picture Upload */}
      <div className="space-y-3">
        <label className="block text-sm font-bold" style={{ color: 'var(--text-secondary)' }}>Foto de Perfil</label>
        <div className="flex items-center gap-4">
          <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 bg-[var(--bg-elevated)]" style={{ borderColor: 'var(--border)' }}>
            {picturePreview ? (
              <img src={picturePreview} alt="Foto de perfil" className="w-full h-full object-cover" />
            ) : (
              <div className="flex items-center justify-center w-full h-full text-gray-400">
                <User className="w-10 h-10" />
              </div>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 hover:opacity-90 cursor-pointer"
              style={{
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border)',
                color: 'var(--text-primary)',
              }}
            >
              <Upload className="w-4 h-4" />
              Subir Foto
            </button>
            {picturePreview && (
               <button
                type="button"
                onClick={() => {
                  setPicturePreview(null)
                  if (fileInputRef.current) fileInputRef.current.value = ''
                }}
                className="px-4 py-2 hover:bg-red-500/10 rounded-lg text-sm font-medium text-red-500 transition-colors flex items-center gap-2 w-max cursor-pointer"
              >
                <X className="w-4 h-4" />
                Eliminar Foto
              </button>
            )}
          </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />
        </div>
      </div>

      {/* Name section */}
      <div className="space-y-3">
        <label htmlFor="name" className="block text-sm font-bold" style={{ color: 'var(--text-secondary)' }}>
          Tu Nombre
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <User className="h-5 w-5 text-gray-400" />
          </div>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="block w-full pl-11 pr-4 py-3 rounded-xl outline-none transition-colors"
            style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border)',
              color: 'var(--text-primary)',
            }}
            placeholder="Escribe tu nombre visible"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
        {/* Full Name */}
        <div className="space-y-3">
          <label htmlFor="fullName" className="block text-sm font-bold" style={{ color: 'var(--text-secondary)' }}>Nombre Completo</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><User className="h-5 w-5 text-gray-400" /></div>
            <input 
              id="fullName" 
              type="text" 
              value={fullName} 
              onChange={(e) => setFullName(e.target.value)} 
              className="block w-full pl-11 pr-4 py-3 rounded-xl outline-none transition-colors"
              style={{
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border)',
                color: 'var(--text-primary)',
              }}
              placeholder="Tus nombres y apellidos" 
            />
          </div>
        </div>

        {/* Birth Date */}
        <div className="space-y-3">
          <label htmlFor="birthDate" className="block text-sm font-bold" style={{ color: 'var(--text-secondary)' }}>Fecha de Nacimiento</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Calendar className="h-5 w-5 text-gray-400" /></div>
            <input 
              id="birthDate" 
              type="date" 
              value={birthDate} 
              onChange={(e) => setBirthDate(e.target.value)} 
              className="block w-full pl-11 pr-4 py-3 rounded-xl outline-none transition-colors"
              style={{
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border)',
                color: 'var(--text-primary)',
              }}
            />
          </div>
        </div>

        {/* Phone */}
        <div className="space-y-3">
          <label htmlFor="phone" className="block text-sm font-bold" style={{ color: 'var(--text-secondary)' }}>Teléfono (opcional)</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Phone className="h-5 w-5 text-gray-400" /></div>
            <input 
              id="phone" 
              type="tel" 
              value={phone} 
              onChange={(e) => setPhone(e.target.value)} 
              className="block w-full pl-11 pr-4 py-3 rounded-xl outline-none transition-colors"
              style={{
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border)',
                color: 'var(--text-primary)',
              }}
              placeholder="+57 300 000 0000" 
            />
          </div>
        </div>

        {/* Alt Email */}
        <div className="space-y-3">
          <label htmlFor="altEmail" className="block text-sm font-bold" style={{ color: 'var(--text-secondary)' }}>Correo Electrónico Alternativo</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Mail className="h-5 w-5 text-gray-400" /></div>
            <input 
              id="altEmail" 
              type="email" 
              value={altEmail} 
              onChange={(e) => setAltEmail(e.target.value)} 
              className="block w-full pl-11 pr-4 py-3 rounded-xl outline-none transition-colors"
              style={{
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border)',
                color: 'var(--text-primary)',
              }}
              placeholder="tu_otro_correo@ejemplo.com" 
            />
          </div>
        </div>

        {/* Gender */}
        <div className="space-y-3">
          <label htmlFor="gender" className="block text-sm font-bold" style={{ color: 'var(--text-secondary)' }}>Género</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Users className="h-5 w-5 text-gray-400" /></div>
            <input 
              id="gender" 
              type="text" 
              value={gender} 
              onChange={(e) => setGender(e.target.value)} 
              className="block w-full pl-11 pr-4 py-3 rounded-xl outline-none transition-colors"
              style={{
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border)',
                color: 'var(--text-primary)',
              }}
              placeholder="Ej: Masculino, Femenino, Otro..."
            />
          </div>
        </div>
      </div>

      <div className="space-y-3 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
        <label className="block text-sm font-bold" style={{ color: 'var(--text-secondary)' }}>Dirección Residencial</label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><MapPin className="h-5 w-5 text-gray-400" /></div>
            <input 
              type="text" 
              value={addressCountry} 
              onChange={(e) => setAddressCountry(e.target.value)} 
              className="block w-full pl-11 pr-4 py-3 rounded-xl outline-none transition-colors"
              style={{
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border)',
                color: 'var(--text-primary)',
              }}
              placeholder="País" 
            />
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><MapPin className="h-5 w-5 text-gray-400" /></div>
            <input 
              type="text" 
              value={addressState} 
              onChange={(e) => setAddressState(e.target.value)} 
              className="block w-full pl-11 pr-4 py-3 rounded-xl outline-none transition-colors"
              style={{
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border)',
                color: 'var(--text-primary)',
              }}
              placeholder="Estado / Depto" 
            />
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><MapPin className="h-5 w-5 text-gray-400" /></div>
            <input 
              type="text" 
              value={addressCity} 
              onChange={(e) => setAddressCity(e.target.value)} 
              className="block w-full pl-11 pr-4 py-3 rounded-xl outline-none transition-colors"
              style={{
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border)',
                color: 'var(--text-primary)',
              }}
              placeholder="Ciudad" 
            />
          </div>
        </div>
      </div>

      {/* Avatars section */}
      <div className="space-y-4 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
        <label className="block text-sm font-bold" style={{ color: 'var(--text-secondary)' }}>
          Elige tu Avatar del Show
        </label>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {availableAvatars.map((url, i) => {
            const isSelected = avatarUrl === url
            const isDeletable = url.includes('/api/uploads/')
            const isBeingDeleted = deleting === url

            return (
              <div key={i} className="relative group">
                <button
                  type="button"
                  onClick={() => setAvatarUrl(url)}
                  className={`relative w-full aspect-square rounded-2xl overflow-hidden transition-all duration-200 border-2 cursor-pointer ${isSelected ? 'border-[var(--yellow)] scale-105 shadow-[0_0_20px_rgba(255,204,0,0.3)]' : 'hover:scale-105'}`}
                  style={{ borderColor: isSelected ? 'var(--yellow)' : 'var(--border)' }}
                >
                  <img
                    src={url}
                    alt={`Avatar ${i + 1}`}
                    className="w-full h-full object-cover"
                  />
                  {isSelected && (
                    <div className="absolute inset-0 bg-[var(--yellow)]/20 flex items-center justify-center">
                       <div className="bg-[var(--yellow)] text-black rounded-full p-1 shadow-lg">
                         <CheckCircle2 className="w-5 h-5" />
                       </div>
                    </div>
                  )}
                </button>

                {isDeletable && (
                  <button
                    type="button"
                    onClick={(e) => handleDeleteAvatar(e, url)}
                    title="Eliminar foto"
                    disabled={isBeingDeleted}
                    className="absolute top-2 right-2 bg-red-500/90 hover:bg-red-600 text-white p-1.5 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10 disabled:opacity-50 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            )
          })}
        </div>
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
           Puedes seleccionar uno de nuestros avatares exclusivos o dejarlo vacío.
        </p>
      </div>

      <button
        type="submit"
        disabled={loading || !name.trim()}
        className="w-full sm:w-auto px-8 py-3 rounded-xl font-bold transition-transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2 cursor-pointer"
        style={{ background: 'var(--yellow)', color: '#000' }}
      >
        {loading ? (
          <>
            <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
            Guardando...
          </>
        ) : (
          'Guardar Cambios'
        )}
      </button>

    </form>
  )
}
