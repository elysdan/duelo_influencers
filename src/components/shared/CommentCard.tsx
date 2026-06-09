'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { Heart, Repeat2, MessageSquare, Send, CornerDownRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toggleCommentLike } from '@/app/actions/likes'
import { toggleCommentRepost } from '@/app/actions/reposts'
import { fetchCommentReplies, addReplyToComment } from '@/app/actions/replies'
import { useToast } from '@/components/ui/ToastProvider'

export interface CommentData {
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
}

interface CommentCardProps {
  id: string
  content: string
  formattedTime: string
  authorId?: string | null
  authorName: string | null
  authorAvatar: string | null
  initialLikesCount: number
  initialHasLiked: boolean
  initialRepostsCount?: number
  initialHasReposted?: boolean
  initialRepliesCount?: number
  contextLabel?: React.ReactNode
  isReply?: boolean
  isLoggedIn?: boolean
}

export default function CommentCard({
  id,
  content,
  formattedTime,
  authorId,
  authorName,
  authorAvatar,
  initialLikesCount,
  initialHasLiked,
  initialRepostsCount = 0,
  initialHasReposted = false,
  initialRepliesCount = 0,
  contextLabel,
  isReply = false,
  isLoggedIn = false,
}: CommentCardProps) {
  const router = useRouter()
  const pathname = usePathname()

  const handleAuthRedirect = () => {
    const params = new URLSearchParams(window.location.search)
    params.set('login', 'true')
    router.push(`${pathname}?${params.toString()}`)
  }
  const [likesCount, setLikesCount] = useState(initialLikesCount || 0)
  const [hasLiked, setHasLiked] = useState(initialHasLiked)
  const [isLikePending, setIsLikePending] = useState(false)

  const [repostsCount, setRepostsCount] = useState(initialRepostsCount || 0)
  const [hasReposted, setHasReposted] = useState(initialHasReposted)
  const [isRepostPending, setIsRepostPending] = useState(false)

  const [repliesCount, setRepliesCount] = useState(initialRepliesCount || 0)
  const [isReplying, setIsReplying] = useState(false)
  const [replyText, setReplyText] = useState('')
  const [isSendingReply, setIsSendingReply] = useState(false)

  const [replies, setReplies] = useState<CommentData[]>([])
  const [showReplies, setShowReplies] = useState(false)
  const [isLoadingReplies, setIsLoadingReplies] = useState(false)
  const [repliesPage, setRepliesPage] = useState(1)
  const [hasMoreReplies, setHasMoreReplies] = useState(false)

  const { toast } = useToast()
  const displayName = authorName || 'Fan de la Tri'

  const handleLike = async () => {
    if (!isLoggedIn) {
      handleAuthRedirect()
      return
    }
    const prevHasLiked = hasLiked
    const prevCount = likesCount

    setHasLiked(!prevHasLiked)
    setLikesCount(prevCount + (prevHasLiked ? -1 : 1))
    setIsLikePending(true)

    const result = await toggleCommentLike(id)
    setIsLikePending(false)

    if (!result.success) {
      setHasLiked(prevHasLiked)
      setLikesCount(prevCount)
      if (result.error === 'Unauthorized') toast('Debes iniciar sesión para dar Me gusta.', 'error')
      else toast('Error al procesar el Me gusta', 'error')
    }
  }

  const handleRepost = async () => {
    if (!isLoggedIn) {
      handleAuthRedirect()
      return
    }
    const prevHasReposted = hasReposted
    const prevCount = repostsCount

    setHasReposted(!prevHasReposted)
    setRepostsCount(prevCount + (prevHasReposted ? -1 : 1))
    setIsRepostPending(true)

    const result = await toggleCommentRepost(id)
    setIsRepostPending(false)

    if (!result.success) {
      setHasReposted(prevHasReposted)
      setRepostsCount(prevCount)
      if (result.error === 'Unauthorized') toast('Debes iniciar sesión para Compartir.', 'error')
      else toast('Error al procesar la acción', 'error')
    }
  }

  const loadReplies = async (pageToLoad: number) => {
    setIsLoadingReplies(true)
    const result = await fetchCommentReplies(id, pageToLoad, 5) // cargamos 5 por vez
    setIsLoadingReplies(false)

    if (result.success && result.data) {
      if (pageToLoad === 1) {
        setReplies(result.data as CommentData[])
      } else {
        setReplies(prev => [...prev, ...(result.data as CommentData[])])
      }
      setHasMoreReplies(result.hasMore || false)
    } else {
      toast('Error al cargar respuestas', 'error')
    }
  }

  const handleToggleReplies = () => {
    if (showReplies) {
      setShowReplies(false)
    } else {
      setShowReplies(true)
      if (replies.length === 0 && repliesCount > 0) {
        setRepliesPage(1)
        loadReplies(1)
      }
    }
  }

  const handleSendReply = async () => {
    if (!replyText.trim()) return

    setIsSendingReply(true)
    const result = await addReplyToComment(id, replyText)
    setIsSendingReply(false)

    if (result.success) {
      toast('Respuesta publicada', 'success')
      setReplyText('')
      setIsReplying(false)
      setRepliesCount(prev => prev + 1)
      
      // Force reload replies to show new one
      if (showReplies) {
         setRepliesPage(1)
         loadReplies(1)
      } else {
         setShowReplies(true)
         setRepliesPage(1)
         loadReplies(1)
      }
    } else {
      if (result.error === 'Unauthorized') toast('Inicia sesión para responder', 'error')
      else toast('Error al publicar respuesta', 'error')
    }
  }

  return (
    <div className={cn("flex flex-col gap-3", isReply ? "mt-2" : "")}>
      <div className={cn(
        "glass-card rounded-3xl p-5 sm:p-6 flex flex-col sm:flex-row gap-4 sm:gap-5 items-start transition-all hover:bg-white/[0.02] border border-white/5 shadow-lg relative group",
        isReply ? "p-4 sm:p-5 bg-white/5 shadow-none before:absolute before:content-[''] before:-left-[18px] sm:before:-left-[26px] before:top-8 before:w-[18px] sm:before:w-[26px] before:border-t before:border-b-0 before:border-white/10" : ""
      )}>
        
        {/* Avatar */}
        <div className="shrink-0 relative z-10">
           {authorId ? (
            <Link href={`/usuario/${authorId}`}>
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gray-800 flex items-center justify-center border border-gray-700 overflow-hidden relative hover:border-[var(--yellow)] transition-colors">
                {authorAvatar ? <Image src={authorAvatar} alt={displayName} fill className="object-cover" /> : <span className="text-gray-400 text-sm font-bold">{displayName.charAt(0).toUpperCase()}</span>}
              </div>
            </Link>
          ) : (
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gray-800 flex items-center justify-center border border-gray-700 overflow-hidden relative text-center">
              {authorAvatar ? <Image src={authorAvatar} alt={displayName} fill className="object-cover" /> : <span className="text-gray-400 text-sm font-bold m-auto">{displayName.charAt(0).toUpperCase()}</span>}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-grow min-w-0 w-full relative z-10">
          <div className="flex flex-col mb-2 gap-1">
            <div className="flex items-center gap-2 flex-wrap">
              {authorId ? (
                <Link href={`/usuario/${authorId}`} className="font-bold text-white text-sm hover:text-[var(--yellow)] transition-colors">{displayName}</Link>
              ) : (
                <span className="font-bold text-white text-sm">{displayName}</span>
              )}
              <span className="text-xs text-gray-500 font-medium whitespace-nowrap">· {formattedTime}</span>
            </div>
            {contextLabel && contextLabel}
          </div>
          
          <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap break-words">
            {content}
          </p>
        </div>

        {/* Actions Stack: Likes, Reposts, Replies */}
        <div className="flex flex-row sm:flex-col gap-2 w-full sm:w-auto mt-3 sm:mt-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-white/10 shrink-0 ml-auto items-end sm:items-center relative z-20">
          
          {/* Like */}
          <button onClick={handleLike} disabled={isLikePending} className={cn("flex items-center justify-center gap-1.5 px-3 py-1.5 sm:px-3 rounded-full sm:rounded-lg text-xs font-semibold relative transition-all shadow-sm", hasLiked ? "bg-red-500/10 text-red-500 shadow-[0_0_10px_rgba(239,68,68,0.2)] border border-red-500/30" : "bg-white/5 text-gray-400 border border-white/5 hover:bg-white/10 hover:text-red-400")} title="Me gusta">
             <Heart className={cn("w-4 h-4 transition-transform", hasLiked && "fill-current scale-110")} />
             {likesCount > 0 && <span className="font-mono font-bold leading-none">{likesCount}</span>}
          </button>
          
          {/* Repost */}
          <button onClick={handleRepost} disabled={isRepostPending} className={cn("flex items-center justify-center gap-1.5 px-3 py-1.5 sm:px-3 rounded-full sm:rounded-lg text-xs font-semibold relative transition-all shadow-sm", hasReposted ? "bg-blue-500/10 text-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.2)] border border-blue-500/30" : "bg-white/5 text-gray-400 border border-white/5 hover:bg-white/10 hover:text-blue-400")} title="Repostear">
             <Repeat2 className={cn("w-4 h-4 transition-transform", hasReposted && "scale-110")} />
             {repostsCount > 0 && <span className="font-mono font-bold leading-none">{repostsCount}</span>}
          </button>

           {/* Reply */}
           <button 
              onClick={() => {
                if (!isLoggedIn) {
                  handleAuthRedirect()
                  return
                }
                setIsReplying(!isReplying)
              }} 
              className={cn("flex items-center justify-center gap-1.5 px-3 py-1.5 sm:px-3 rounded-full sm:rounded-lg text-xs font-semibold relative transition-all shadow-sm", isReplying ? "bg-[var(--yellow)]/10 text-[var(--yellow)] shadow-[0_0_10px_rgba(255,204,0,0.2)] border border-[var(--yellow)]/30" : "bg-white/5 text-gray-400 border border-white/5 hover:bg-white/10 hover:text-[var(--yellow)]")} 
              title="Responder"
            >
              <MessageSquare className={cn("w-4 h-4 transition-transform", isReplying && "scale-110 fill-current/20")} />
              {repliesCount > 0 && <span className="font-mono font-bold leading-none">{repliesCount}</span>}
           </button>
        </div>
      </div>

      {/* Embedded Reply Area */}
      {isReplying && (
        <div className="flex gap-3 pl-8 sm:pl-16 pr-2 py-1 animate-in fade-in slide-in-from-top-2 relative z-20">
           <CornerDownRight className="w-5 h-5 text-gray-600 shrink-0 mt-3" />
           <div className="flex-grow flex gap-2">
             <textarea 
               value={replyText}
               onChange={e => setReplyText(e.target.value)}
               placeholder="Escribe tu respuesta..."
               className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white resize-none h-12 focus:h-24 transition-all focus:border-[var(--yellow)] outline-none custom-scrollbar"
             />
             <button 
               onClick={handleSendReply}
               disabled={isSendingReply || !replyText.trim()}
               className="h-12 px-4 bg-[var(--yellow)] text-black rounded-xl font-bold flex items-center justify-center disabled:opacity-50 hover:bg-yellow-400 transition-colors shrink-0"
             >
               {isSendingReply ? <span className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" /> : <Send className="w-4 h-4" />}
             </button>
           </div>
        </div>
      )}

      {/* Replies Thread */}
      {repliesCount > 0 && (
        <div className="pl-4 sm:pl-12 flex flex-col gap-1 relative z-10">
           {/* Visual Thread line connecting children */}
           {showReplies && <div className="absolute left-[1.125rem] sm:left-[3.125rem] top-0 bottom-6 w-px bg-white/10" />}

           {!showReplies ? (
             <button onClick={handleToggleReplies} className="text-sm font-semibold text-[var(--yellow)]/80 hover:text-[var(--yellow)] text-left py-2 px-4 transition-colors w-max">
               Ver respuestas ({repliesCount})
             </button>
           ) : (
             <div className="flex flex-col gap-2 pt-2 relative">
                {replies.map((reply) => (
                   <CommentCard
                     key={reply.id}
                     id={reply.id}
                     content={reply.content}
                     formattedTime={new Date(reply.createdAt).toLocaleDateString('es-CO', { month: 'short', day: 'numeric' })}
                     authorId={reply.authorId}
                     authorName={reply.user.name}
                     authorAvatar={reply.user.avatarUrl}
                     initialLikesCount={reply.likesCount}
                     initialRepostsCount={reply.repostsCount}
                     initialRepliesCount={reply.repliesCount}
                     initialHasLiked={reply.hasLiked}
                     initialHasReposted={reply.hasReposted}
                     isReply={true}
                     isLoggedIn={isLoggedIn}
                   />
                ))}
                
                {isLoadingReplies && <div className="text-center py-4"><span className="w-5 h-5 block border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto"></span></div>}
                
                <div className="flex gap-4 items-center pl-4 py-2 relative z-10">
                  {hasMoreReplies && !isLoadingReplies && (
                    <button 
                      onClick={() => {
                         const next = repliesPage + 1
                         setRepliesPage(next)
                         loadReplies(next)
                      }} 
                      className="text-xs font-semibold text-gray-400 hover:text-white transition-colors"
                    >
                      Ver más respuestas
                    </button>
                  )}
                  {showReplies && (
                    <button onClick={handleToggleReplies} className="text-xs font-semibold text-[var(--yellow)]/70 hover:text-[var(--yellow)] transition-colors">
                      Ocultar respuestas
                    </button>
                  )}
                </div>
             </div>
           )}
        </div>
      )}
    </div>
  )
}
