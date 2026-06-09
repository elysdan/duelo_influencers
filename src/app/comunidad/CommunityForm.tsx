'use client'

import { useState, useTransition, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { postGlobalComment } from './actions'
import { Image, Video, User, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CommunityFormProps {
  user?: {
    name?: string | null
    image?: string | null
  } | null
}

export default function CommunityForm({ user }: CommunityFormProps) {
  const [content, setContent] = useState('')
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  const pathname = usePathname()

  // File states
  const [mediaFile, setMediaFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [mediaType, setMediaType] = useState<'image' | 'video' | null>(null)

  // Input refs
  const imageInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)
  
  const charsLeft = 300 - content.length
  const isOverLimit = charsLeft < 0

  const handleInteractionClick = (e: React.MouseEvent) => {
    if (!user) {
      e.preventDefault()
      const params = new URLSearchParams(window.location.search)
      params.set('login', 'true')
      router.push(`${pathname}?${params.toString()}`)
    }
  }

  const handleImageClick = (e: React.MouseEvent) => {
    if (!user) {
      handleInteractionClick(e)
      return
    }
    imageInputRef.current?.click()
  }

  const handleVideoClick = (e: React.MouseEvent) => {
    if (!user) {
      handleInteractionClick(e)
      return
    }
    videoInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video') => {
    const file = e.target.files?.[0]
    if (file) {
      setMediaFile(file)
      setMediaType(type)
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    }
  }

  const clearMedia = () => {
    setMediaFile(null)
    setPreviewUrl(null)
    setMediaType(null)
    if (imageInputRef.current) imageInputRef.current.value = ''
    if (videoInputRef.current) videoInputRef.current.value = ''
  }

  return (
    <div className="bg-[#efefef] p-5 rounded-xl mb-8 border border-zinc-350 shadow-sm text-left">
      <form 
        action={(formData) => {
          if (!user) return
          if (isOverLimit || content.trim() === '') return
          startTransition(async () => {
             if (mediaFile) {
               formData.append('mediaFile', mediaFile)
             }
             const result = await postGlobalComment(formData)
             if (result?.success) {
               setContent('')
               clearMedia()
             }
          })
        }}
        className="flex flex-col gap-4"
        onClick={handleInteractionClick}
      >
        {/* Hidden File Inputs */}
        <input 
          type="file" 
          ref={imageInputRef} 
          onChange={(e) => handleFileChange(e, 'image')} 
          accept="image/*" 
          name="imageInput" 
          className="hidden" 
        />
        <input 
          type="file" 
          ref={videoInputRef} 
          onChange={(e) => handleFileChange(e, 'video')} 
          accept="video/*" 
          name="videoInput" 
          className="hidden" 
        />

        <div className="flex gap-3 items-start">
          {/* User Avatar */}
          <div className="w-10 h-10 rounded-full bg-zinc-300 flex items-center justify-center overflow-hidden shrink-0 border border-zinc-400">
            {user?.image ? (
              <img src={user.image} alt={user.name || 'User'} className="w-full h-full object-cover" />
            ) : (
              <User className="w-6 h-6 text-zinc-500" />
            )}
          </div>

          {/* Text Area */}
          <textarea
            name="content"
            value={content}
            onChange={(e) => {
              if (user) {
                setContent(e.target.value)
              }
            }}
            readOnly={!user}
            placeholder="Postea algo..."
            className="w-full bg-transparent border-0 text-sm md:text-base text-zinc-800 placeholder-zinc-550 resize-none focus:outline-none min-h-[48px] pt-2 custom-scrollbar font-bold"
            required
          />
        </div>

        {/* Media Preview Area */}
        {previewUrl && (
          <div className="relative mt-2 rounded-xl overflow-hidden border border-zinc-300 max-h-[280px] bg-black/5 flex items-center justify-center">
            {mediaType === 'image' ? (
              <img src={previewUrl} alt="Preview" className="max-h-[280px] w-auto object-contain block" />
            ) : (
              <video src={previewUrl} className="max-h-[280px] w-auto block" controls />
            )}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                clearMedia()
              }}
              className="absolute top-2 right-2 bg-black/70 hover:bg-black text-white rounded-full p-1.5 transition-colors cursor-pointer"
              title="Eliminar archivo"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Action Row */}
        <div className="flex items-center justify-between border-t border-zinc-300 pt-3">
          <div className="flex gap-2">
            {/* Image icon button */}
            <button
              type="button"
              onClick={handleImageClick}
              className="w-8 h-8 rounded-full bg-[#3b3b3b] hover:bg-neutral-800 text-white flex items-center justify-center cursor-pointer transition-colors"
              title="Añadir imagen"
            >
              <Image className="w-4 h-4" />
            </button>
            {/* Video icon button */}
            <button
              type="button"
              onClick={handleVideoClick}
              className="w-8 h-8 rounded-full bg-[#3b3b3b] hover:bg-neutral-800 text-white flex items-center justify-center cursor-pointer transition-colors"
              title="Añadir video"
            >
              <Video className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-3">
            {user && content.length > 0 && (
              <span className={cn("text-xs font-bold", isOverLimit ? 'text-red-500' : 'text-zinc-500')}>
                {content.length} / 300
              </span>
            )}
            <button 
              type="submit" 
              disabled={isPending || isOverLimit || content.trim() === '' || !user}
              className="px-6 py-2 bg-[#f5c518] text-black font-bold text-sm hover:bg-yellow-400 transition-colors border-b-2 border-black disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center"
            >
              {isPending ? 'Publicando...' : 'Publicar'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
