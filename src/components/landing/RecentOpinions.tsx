'use client'

import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, MessageSquare, Send } from 'lucide-react'
import { fetchRecentOpinions, postVideoComment } from '@/app/opiniones/actions'
import CommentCard from '@/components/shared/CommentCard'
import { useToast } from '@/components/ui/ToastProvider'
import Link from 'next/link'

interface OpinionData {
  id: string
  content: string
  createdAt: Date
  likesCount: number
  repostsCount: number
  repliesCount: number
  hasLiked: boolean
  hasReposted: boolean
  authorId: string
  user: {
    name: string
    avatarUrl: string | null
  }
  player: {
    name: string
    imageUrl: string | null
  }
}

interface RecentOpinionsProps {
  user: {
    name?: string | null
    email?: string | null
    image?: string | null
    id?: string | null
  } | null | undefined
}

export default function RecentOpinions({ user }: RecentOpinionsProps) {
  const [opinions, setOpinions] = useState<OpinionData[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  
  // YouTube comment input state
  const [commentContent, setCommentContent] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    loadOpinions(currentPage)
  }, [currentPage])

  const loadOpinions = async (page: number) => {
    setLoading(true)
    const result = await fetchRecentOpinions(page, 5) // cargamos 5 comentarios por página
    if (result.success && result.data) {
      setOpinions(result.data as OpinionData[])
      setTotalPages(result.totalPages || 1)
    }
    setLoading(false)
  }

  // Handle posting a comment
  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!commentContent.trim()) return

    setIsSubmitting(true)
    const result = await postVideoComment(commentContent)
    setIsSubmitting(false)

    if (result.success) {
      toast('¡Comentario publicado con éxito!', 'success')
      setCommentContent('')
      setIsFocused(false)
      // Reload comments list and set page to 1 to see the new comment
      setCurrentPage(1)
      loadOpinions(1)
    } else {
      toast(result.error || 'Error al publicar el comentario.', 'error')
    }
  }

  // Helper for pagination limits
  const getPageNumbers = () => {
    const pages = []
    let p = 1
    while (p <= totalPages && p <= 5) {
      pages.push(p)
      p++
    }
    return pages
  }

  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : 'U'

  return (
    <div className="flex flex-col gap-6 text-white w-full border-t border-white/5 pt-8 mt-4">
      {/* Comments Header */}
      <div className="flex items-center gap-6 mb-2">
        <span className="font-bold text-lg sm:text-xl flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-[var(--yellow)]" />
          Comentarios
        </span>
        <span className="text-xs font-semibold text-gray-400">
          Ordenar por: Relevancia
        </span>
      </div>

      {/* YouTube Style Add Comment Form */}
      <div className="flex gap-3 items-start my-2">
        {/* User Avatar Bubble */}
        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-yellow-500 to-amber-600 flex items-center justify-center font-bold text-black text-sm shrink-0 border border-white/10 shadow-[0_0_10px_rgba(245,197,24,0.15)]">
          {user ? (
            user.image ? (
              <img src={user.image} alt={user.name || 'User'} className="w-full h-full object-cover rounded-full" />
            ) : (
              userInitial
            )
          ) : (
            '?'
          )}
        </div>

        <div className="flex-grow flex flex-col gap-2">
          {user ? (
            <form onSubmit={handlePostComment} className="w-full">
              <textarea
                value={commentContent}
                onChange={(e) => setCommentContent(e.target.value.substring(0, 300))}
                onFocus={() => setIsFocused(true)}
                placeholder="Añade un comentario público..."
                className="w-full bg-transparent border-b border-white/15 focus:border-b-2 focus:border-[var(--yellow)] outline-none py-1.5 text-sm text-white resize-none transition-all duration-150 h-8 focus:h-20"
              />
              
              {isFocused && (
                <div className="flex items-center justify-between mt-2 animate-in fade-in duration-200">
                  <span className="text-[10px] font-mono text-gray-500">
                    {commentContent.length}/300
                  </span>
                  
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setCommentContent('')
                        setIsFocused(false)
                      }}
                      className="px-3 py-1.5 rounded-full text-xs font-semibold text-gray-300 hover:bg-white/5 transition-colors cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting || !commentContent.trim()}
                      className="px-4 py-1.5 rounded-full text-xs font-bold bg-[var(--yellow)] text-black hover:bg-yellow-400 transition-colors disabled:opacity-50 disabled:hover:bg-[var(--yellow)] flex items-center gap-1 cursor-pointer"
                    >
                      {isSubmitting ? (
                        <span className="w-3 h-3 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <Send className="w-3 h-3" />
                          <span>Comentar</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </form>
          ) : (
            <div className="py-3 px-4 rounded-xl bg-white/5 border border-white/5 text-xs sm:text-sm text-gray-400">
              Debes{' '}
              <Link href="/login" className="text-[var(--yellow)] font-bold hover:underline">
                iniciar sesión
              </Link>{' '}
              para comentar en este video.
            </div>
          )}
        </div>
      </div>

      {/* Comments List */}
      <div className="relative min-h-[250px] flex flex-col gap-4 mt-2">
        {loading && opinions.length === 0 ? (
          <div className="absolute inset-0 flex justify-center items-center py-10">
            <div className="w-8 h-8 border-3 border-white/10 border-t-[var(--yellow)] rounded-full animate-spin" />
          </div>
        ) : opinions.length === 0 ? (
          <p className="text-gray-400 text-center py-12 text-sm">Sé el primero en dejar un comentario.</p>
        ) : (
          <div className="flex flex-col gap-5">
            {opinions.map((op) => (
              <CommentCard
                key={op.id}
                id={op.id}
                content={op.content}
                formattedTime={new Date(op.createdAt).toLocaleDateString('es-CO', {
                  month: 'short',
                  day: 'numeric',
                })}
                authorId={op.authorId}
                authorName={op.user.name}
                authorAvatar={op.user.avatarUrl}
                initialLikesCount={op.likesCount}
                initialRepostsCount={op.repostsCount}
                initialRepliesCount={op.repliesCount}
                initialHasLiked={op.hasLiked}
                initialHasReposted={op.hasReposted}
                contextLabel={
                  <span className="text-[10px] text-gray-400">
                    sobre{' '}
                    <span className="text-[var(--yellow)] uppercase tracking-wider font-bold">
                      {op.player.name}
                    </span>
                  </span>
                }
              />
            ))}
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8 bg-white/5 py-2 px-4 rounded-full w-max mx-auto border border-white/5 backdrop-blur-md">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1 || loading}
            className="p-1.5 rounded-full text-gray-400 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent transition-all flex items-center gap-1 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline text-xs font-semibold pr-1">Anterior</span>
          </button>

          <div className="flex items-center gap-1 mx-1">
            {getPageNumbers().map((num) => (
              <button
                key={num}
                onClick={() => setCurrentPage(num)}
                disabled={loading}
                className={`w-8 h-8 rounded-full font-bold text-xs transition-all cursor-pointer ${
                  currentPage === num
                    ? 'bg-[var(--yellow)] text-black shadow-[0_0_10px_rgba(245,197,24,0.3)]'
                    : 'bg-transparent text-gray-400 hover:bg-white/10 hover:text-white'
                }`}
              >
                {num}
              </button>
            ))}
            {totalPages > 5 && <span className="text-gray-500 tracking-widest px-1">...</span>}
          </div>

          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages || loading}
            className="p-1.5 rounded-full text-gray-400 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent transition-all flex items-center gap-1 cursor-pointer"
          >
            <span className="hidden sm:inline text-xs font-semibold pl-1">Siguiente</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  )
}
