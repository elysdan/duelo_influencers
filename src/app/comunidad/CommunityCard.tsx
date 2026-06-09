'use client'

import { useState } from 'react'
import { Heart, MessageSquare, User, Send, X } from 'lucide-react'
import { toggleCommentLike } from '@/app/actions/likes'
import { fetchCommentReplies, addReplyToComment } from '@/app/actions/replies'
import { useToast } from '@/components/ui/ToastProvider'
import { cn } from '@/lib/utils'
import { useRouter, usePathname } from 'next/navigation'

interface CommunityCardProps {
  id: string
  content: string
  playerImage: string | null
  playerName: string | null
  authorName: string | null
  authorAvatar: string | null
  initialLikesCount: number
  initialHasLiked: boolean
  initialRepliesCount: number
  isLoggedIn: boolean
  mediaUrl?: string | null
  mediaType?: string | null
  currentUserAvatar?: string | null
}

export default function CommunityCard({
  id,
  content,
  playerImage,
  playerName,
  authorName,
  authorAvatar,
  initialLikesCount,
  initialHasLiked,
  initialRepliesCount,
  isLoggedIn,
  mediaUrl,
  mediaType,
  currentUserAvatar
}: CommunityCardProps) {
  const [likesCount, setLikesCount] = useState(initialLikesCount)
  const [hasLiked, setHasLiked] = useState(initialHasLiked)
  const [repliesCount, setRepliesCount] = useState(initialRepliesCount)
  const [replyText, setReplyText] = useState('')
  const [replies, setReplies] = useState<any[]>([])
  const [showReplies, setShowReplies] = useState(false)
  const [loadingReplies, setLoadingReplies] = useState(false)
  const { toast } = useToast()
  const router = useRouter()
  const pathname = usePathname()

  const handleAuthRedirect = () => {
    const params = new URLSearchParams(window.location.search)
    params.set('login', 'true')
    router.push(`${pathname}?${params.toString()}`)
  }

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!isLoggedIn) {
      handleAuthRedirect()
      return
    }
    const prevHasLiked = hasLiked
    const prevCount = likesCount
    setHasLiked(!prevHasLiked)
    setLikesCount(prevCount + (prevHasLiked ? -1 : 1))

    const result = await toggleCommentLike(id)
    if (!result.success) {
      setHasLiked(prevHasLiked)
      setLikesCount(prevCount)
      toast('Error al procesar el Me gusta', 'error')
    }
  }

  const handleReplyToggle = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!isLoggedIn) {
      handleAuthRedirect()
      return
    }
    const nextShow = !showReplies
    setShowReplies(nextShow)
    if (nextShow && replies.length === 0 && repliesCount > 0) {
      setLoadingReplies(true)
      const res = await fetchCommentReplies(id, 1, 20)
      setLoadingReplies(false)
      if (res.success && res.data) {
        setReplies(res.data)
      }
    }
  }

  const handleReplyLike = async (replyId: string, index: number) => {
    if (!isLoggedIn) {
      handleAuthRedirect()
      return
    }
    const reply = replies[index]
    if (!reply) return

    const newReplies = [...replies]
    const prevHasLiked = reply.hasLiked
    const prevCount = reply.likesCount

    newReplies[index] = {
      ...reply,
      hasLiked: !prevHasLiked,
      likesCount: prevCount + (prevHasLiked ? -1 : 1)
    }
    setReplies(newReplies)

    const result = await toggleCommentLike(replyId)
    if (!result.success) {
      newReplies[index] = {
        ...reply,
        hasLiked: prevHasLiked,
        likesCount: prevCount
      }
      setReplies(newReplies)
      toast('Error al procesar el Me gusta en el comentario', 'error')
    }
  }

  const handleSendReply = async () => {
    if (!replyText.trim()) return
    const result = await addReplyToComment(id, replyText)
    if (result.success) {
      toast('Respuesta publicada', 'success')
      setReplyText('')
      setRepliesCount(prev => prev + 1)
      const res = await fetchCommentReplies(id, 1, 30)
      if (res.success && res.data) {
        setReplies(res.data)
        setShowReplies(true)
      }
    } else {
      toast('Error al publicar respuesta', 'error')
    }
  }

  return (
    <>
      <div className="w-full bg-[#efefef] rounded-xl overflow-hidden shadow-md border border-zinc-350 flex flex-col hover:shadow-lg transition-all duration-300">
        {/* Post Image or Video (Uploaded media or Fallback Influencer Image) */}
        {mediaUrl ? (
          <div className="relative w-full aspect-video overflow-hidden bg-black/5">
            {mediaType === 'video' ? (
              <video 
                src={mediaUrl} 
                className="w-full h-full object-cover block" 
                controls 
                preload="metadata" 
              />
            ) : (
              <img 
                src={mediaUrl} 
                alt="Post media" 
                className="w-full h-full object-cover block" 
              />
            )}
          </div>
        ) : playerImage ? (
          <div className="relative w-full aspect-video overflow-hidden bg-black/5">
            <img 
              src={playerImage} 
              alt={playerName || 'Post image'} 
              className="w-full h-full object-cover block"
            />
          </div>
        ) : null}

        {/* Post Body */}
        <div className="p-4 sm:p-5 flex flex-col gap-3">
          {/* Interaction Row (Likes and Comments) */}
          <div className="flex items-center gap-4 text-zinc-700 select-none">
            {/* Heart Button */}
            <button 
              onClick={handleLike}
              className="flex items-center gap-1.5 hover:text-red-500 transition-colors cursor-pointer group"
            >
              <Heart 
                className={cn(
                  "w-5 h-5 transition-transform group-hover:scale-110", 
                  hasLiked ? "fill-red-500 text-red-500" : "text-zinc-650"
                )} 
              />
              <span className="font-mono font-bold text-xs sm:text-sm">{likesCount}</span>
            </button>

            {/* Comment Button */}
            <button 
              onClick={handleReplyToggle}
              className="flex items-center gap-1.5 hover:text-yellow-600 transition-colors cursor-pointer group"
            >
              <MessageSquare className="w-5 h-5 text-zinc-650 transition-transform group-hover:scale-110" />
              <span className="font-mono font-bold text-xs sm:text-sm">{repliesCount}</span>
            </button>
          </div>

          {/* Content Caption */}
          <p className="text-sm text-zinc-800 font-bold leading-relaxed text-left">
            {content}
          </p>

          {/* Author Footer */}
          <div className="flex items-center gap-2 border-t border-zinc-300/60 pt-3 mt-1 text-left">
            <div className="w-6 h-6 rounded-full bg-zinc-300 flex items-center justify-center overflow-hidden border border-zinc-400">
              {authorAvatar ? (
                <img src={authorAvatar} alt={authorName || 'User'} className="w-full h-full object-cover" />
              ) : (
                <User className="w-4 h-4 text-zinc-500" />
              )}
            </div>
            <span className="text-[11px] font-bold text-zinc-550 truncate">{authorName || 'Usuario'}</span>
          </div>
        </div>
      </div>

      {/* Comments Modal Overlay */}
      {showReplies && (
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-6 md:p-8"
          onClick={() => setShowReplies(false)}
        >
          {/* Modal Content */}
          <div 
            className={cn(
              "bg-[#efefef] rounded-3xl overflow-hidden border border-zinc-350 shadow-2xl relative flex flex-col",
              (mediaUrl || playerImage) ? "w-full max-w-4xl h-[90vh] md:h-[80vh] md:flex-row" : "w-full max-w-lg max-h-[85vh]"
            )}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button 
              onClick={() => setShowReplies(false)}
              className="absolute top-4 right-4 bg-black/60 hover:bg-black text-white rounded-full p-2 transition-colors cursor-pointer z-50 shadow-md"
              title="Cerrar"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Left Column (Media) */}
            {(mediaUrl || playerImage) && (
              <div className="w-full md:w-3/5 bg-black flex items-center justify-center relative min-h-[240px] md:min-h-0">
                {mediaUrl ? (
                  mediaType === 'video' ? (
                    <video 
                      src={mediaUrl} 
                      className="w-full h-full max-h-[40vh] md:max-h-full object-contain block" 
                      controls 
                      preload="metadata" 
                    />
                  ) : (
                    <img 
                      src={mediaUrl} 
                      alt="Post media" 
                      className="w-full h-full max-h-[40vh] md:max-h-full object-contain block" 
                    />
                  )
                ) : playerImage ? (
                  <img 
                    src={playerImage} 
                    alt={playerName || 'Post image'} 
                    className="w-full h-full max-h-[40vh] md:max-h-full object-contain block"
                  />
                ) : null}
              </div>
            )}

            {/* Right/Main Column (Post details, Comments & Input) */}
            <div className={cn(
              "flex flex-col flex-1 h-full min-h-0",
              (mediaUrl || playerImage) ? "w-full md:w-2/5" : "w-full"
            )}>
              {/* Post Header & Caption */}
              <div className="p-5 flex flex-col gap-3 border-b border-zinc-300">
                {/* Author Info */}
                <div className="flex items-center gap-2.5 text-left">
                  <div className="w-8 h-8 rounded-full bg-zinc-300 flex items-center justify-center overflow-hidden border border-zinc-400">
                    {authorAvatar ? (
                      <img src={authorAvatar} alt={authorName || 'User'} className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-5 h-5 text-zinc-500" />
                    )}
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-black text-zinc-800 leading-none">{authorName || 'Usuario'}</span>
                  </div>
                </div>

                {/* Caption content */}
                <p className="text-sm sm:text-base text-zinc-800 font-bold leading-relaxed text-left">
                  {content}
                </p>

                {/* Card stats */}
                <div className="flex items-center gap-4 text-zinc-700 select-none text-left pt-1">
                  {/* Heart Icon Button */}
                  <button 
                    onClick={handleLike}
                    className="flex items-center gap-1.5 hover:text-red-500 transition-colors cursor-pointer group"
                  >
                    <Heart 
                      className={cn(
                        "w-5 h-5 transition-transform group-hover:scale-110", 
                        hasLiked ? "fill-red-500 text-red-500" : "text-zinc-650"
                      )} 
                    />
                    <span className="font-mono font-bold text-xs sm:text-sm">{likesCount}</span>
                  </button>

                  <div className="flex items-center gap-1.5 text-zinc-650">
                    <MessageSquare className="w-5 h-5" />
                    <span className="font-mono font-bold text-xs sm:text-sm">{repliesCount}</span>
                  </div>
                </div>
              </div>

              {/* Scrollable Comments list */}
              <div className="flex-grow overflow-y-auto p-5 flex flex-col gap-4 text-left min-h-0 custom-scrollbar bg-zinc-50/30">
                <div className="flex items-center gap-1.5 text-zinc-700 font-bold text-xs sm:text-sm select-none border-b border-zinc-300/60 pb-2">
                  <MessageSquare className="w-4 h-4 text-zinc-650" />
                  <span>Comentarios</span>
                </div>

                {loadingReplies ? (
                  <div className="text-xs text-zinc-500 font-semibold pl-2">Cargando comentarios...</div>
                ) : replies.length > 0 ? (
                  replies.map((reply, idx) => (
                    <div key={reply.id} className="flex items-start justify-between gap-3 group">
                      <div className="flex items-start gap-2.5 flex-1 min-w-0">
                        {/* Reply Avatar */}
                        <div className="w-7 h-7 rounded-full bg-zinc-300 flex items-center justify-center overflow-hidden shrink-0 border border-zinc-400">
                          {reply.user?.avatarUrl ? (
                            <img src={reply.user.avatarUrl} alt={reply.user.name || 'User'} className="w-full h-full object-cover" />
                          ) : (
                            <User className="w-4 h-4 text-zinc-500" />
                          )}
                        </div>
                        {/* Reply Text */}
                        <div className="text-zinc-800 text-xs sm:text-sm font-bold leading-relaxed break-words pt-0.5">
                          {reply.content}
                        </div>
                      </div>

                      {/* Reply like heart */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleReplyLike(reply.id, idx)
                        }}
                        className="shrink-0 transition-transform hover:scale-110 cursor-pointer pt-1"
                      >
                        <Heart 
                          className={cn(
                            "w-3.5 h-3.5", 
                            reply.hasLiked ? "fill-red-500 text-red-500" : "text-zinc-450 hover:text-red-500"
                          )} 
                        />
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="text-xs text-zinc-500 font-bold pl-2 italic">Sin comentarios aún</div>
                )}
              </div>

              {/* Reply Comment Box Input */}
              <div className="p-4 border-t border-zinc-300 bg-[#efefef] flex gap-2.5 items-center">
                {/* User avatar */}
                <div className="w-8 h-8 rounded-full bg-zinc-300 flex items-center justify-center overflow-hidden shrink-0 border border-zinc-400">
                  {currentUserAvatar ? (
                    <img src={currentUserAvatar} alt="User avatar" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-4 h-4 text-zinc-500" />
                  )}
                </div>

                {/* Input box */}
                <div className="flex-grow flex items-center gap-2 bg-[#eaeaea] border border-zinc-350 rounded-xl px-3 py-1.5 shadow-inner">
                  <input 
                    type="text" 
                    value={replyText}
                    onChange={e => setReplyText(e.target.value)}
                    placeholder="Deja un comentario..."
                    className="w-full bg-transparent border-0 text-xs sm:text-sm text-zinc-800 placeholder-zinc-500 outline-none font-bold"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleSendReply()
                      }
                    }}
                  />
                  <button 
                    onClick={handleSendReply}
                    disabled={!replyText.trim()}
                    className="px-4 py-1.5 bg-[#f5c518] hover:bg-yellow-400 text-black rounded-lg font-black text-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shrink-0 border-b border-black select-none"
                  >
                    Publicar
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}
    </>
  )
}
