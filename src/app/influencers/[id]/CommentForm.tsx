'use client'

import { useState } from 'react'

export default function CommentForm({ 
  postAction 
}: { 
  postAction: (formData: FormData) => Promise<void> 
}) {
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (content.trim().length === 0 || content.length > 300) return
    
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    await postAction(formData)
    setContent('')
    setLoading(false)
  }

  // Handle character limits dynamically on change to strictly enforce the UI
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value
    if (val.length <= 300) {
      setContent(val)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto relative">
      <textarea 
        name="content"
        value={content}
        onChange={handleChange}
        maxLength={300}
        className="w-full bg-black/40 border border-white/10 rounded-xl p-4 pb-8 text-sm text-white mb-4 placeholder-gray-500 focus:outline-none focus:border-[var(--yellow)] resize-none"
        placeholder="Escribe tu aliento aquí..."
        rows={4}
        required
      />
      
      <div 
        className={`absolute bottom-[80px] right-3 text-xs font-mono font-medium transition-colors ${content.length >= 300 ? 'text-red-400' : 'text-gray-500'}`}
      >
        {content.length}/300
      </div>

      <button 
        type="submit" 
        disabled={loading || content.trim().length === 0}
        className="w-full px-8 py-3 rounded-xl font-bold transition-transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2" 
        style={{ background: 'var(--yellow)', color: '#000' }}
      >
        {loading ? (
          <>
            <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
            Publicando...
          </>
        ) : (
          'Comentar'
        )}
      </button>
    </form>
  )
}
