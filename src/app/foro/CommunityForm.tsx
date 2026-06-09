'use client'

import { useState, useTransition } from 'react'
import { postGlobalComment } from './actions'

export default function CommunityForm() {
  const [content, setContent] = useState('')
  const [isPending, startTransition] = useTransition()
  
  const charsLeft = 300 - content.length
  const isNearLimit = charsLeft <= 20
  const isOverLimit = charsLeft < 0

  return (
    <div className="glass-card p-6 rounded-3xl mb-8 border border-white/10">
      <form 
        action={(formData) => {
          if (isOverLimit || content.trim() === '') return
          startTransition(async () => {
             const result = await postGlobalComment(formData)
             if (result?.success) {
               setContent('')
             }
          })
        }}
        className="flex flex-col gap-3"
      >
        <textarea
          name="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="¿Qué quieres compartir hoy sobre el show o tus influencers favoritos?"
          className="w-full bg-black/40 border border-white/5 rounded-xl p-4 text-base text-white resize-none focus:outline-none focus:border-yellow-500 min-h-[120px] transition-colors"
          required
        />
        <div className="flex items-center justify-between mt-2">
          <span className={`text-sm font-bold ${isOverLimit ? 'text-red-500' : isNearLimit ? 'text-yellow-500' : 'text-gray-500'}`}>
            {content.length} / 300
          </span>
          <button 
            type="submit" 
            disabled={isPending || isOverLimit || content.trim() === ''}
            className="px-8 py-2.5 rounded-full font-bold text-sm bg-yellow-500 text-black hover:bg-yellow-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? 'Publicando...' : 'Postear'}
          </button>
        </div>
      </form>
    </div>
  )
}
