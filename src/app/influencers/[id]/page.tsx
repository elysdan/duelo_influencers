import { notFound } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { db } from '@/db'
import { players, newsItems, comments, users } from '@/db/schema'
import { eq, desc, ilike, or, and, sql, isNull } from 'drizzle-orm'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { auth } from '@/lib/auth'
import Link from 'next/link'
import { Flame, Shield, ArrowLeft, ExternalLink, MessageSquareText } from 'lucide-react'
import { formatRelativeTime } from '@/lib/utils'
import CommentForm from './CommentForm'
import CommentCard from '@/components/shared/CommentCard'
import HypeButton from '@/components/shared/HypeButton'
import { commentLikes, playerHypes } from '@/db/schema'
import ClipGrid from '@/components/players/ClipGrid'

const POSITION_LABELS: Record<string, string> = {
  POR: 'Slots Creator', DEF: 'Roulette Creator', MED: 'Live Show Host', DEL: 'VIP Player', ENT: 'TV Show Host'
}
const POSITION_COLORS: Record<string, string> = {
  POR: 'var(--yellow)', DEF: '#3b82f6', MED: '#8b5cf6', DEL: '#ef4444', ENT: '#a3a3a3'
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [player] = await db.select({ name: players.name }).from(players).where(eq(players.id, id)).limit(1)
  return { title: `${player?.name || 'Influencer'} | Micasino TV Show` }
}

export default async function PlayerProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  const currentUserId = session?.user?.id
  
  async function postComment(formData: FormData) {
    'use server'
    const currentSession = await auth()
    if (!currentSession?.user?.id) return
    
    let content = formData.get('content') as string
    if (!content || content.trim() === '') return
    content = content.trim().substring(0, 300)

    await db.insert(comments).values({
      content,
      authorId: currentSession.user.id,
      playerId: id,
    })

    revalidatePath(`/influencers/${id}`)
  }  
  
  // Fetch Player and Hype Status
  const [player] = await db
    .select({
      id: players.id,
      name: players.name,
      position: players.position,
      club: players.club,
      number: players.number,
      imageUrl: players.imageUrl,
      bio: players.bio,
      goals: players.goals,
      assists: players.assists,
      caps: players.caps,
      hypeCount: players.hypeCount,
      hasHyped: currentUserId
        ? sql<boolean>`CASE WHEN (SELECT 1 FROM player_hypes ph WHERE ph.player_id = ${players.id} AND ph.user_id = ${currentUserId}) = 1 THEN true ELSE false END`.as('has_hyped')
        : sql<boolean>`false`.as('has_hyped')
    })
    .from(players)
    .where(eq(players.id, id))
    .limit(1)

  if (!player) notFound()

  // Fetch News dynamically using player name
  const nameParts = player.name.split(' ')
  const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : player.name

  const relatedNews = await db
    .select()
    .from(newsItems)
    .where(or(ilike(newsItems.title, `%${lastName}%`), ilike(newsItems.excerpt, `%${lastName}%`)))
    .orderBy(desc(newsItems.publishedAt))
    .limit(3)
    
  const displayNews = relatedNews.length > 0 ? relatedNews : await db.select().from(newsItems).orderBy(desc(newsItems.publishedAt)).limit(3)

  // Fetch Opinions (Comments)
  const playerOpinions = await db
    .select({
      id: comments.id,
      content: comments.content,
      createdAt: comments.createdAt,
      authorId: comments.authorId,
      authorName: users.name,
      authorAvatar: users.avatarUrl,
      likesCount: comments.likesCount,
      repostsCount: comments.repostsCount,
      repliesCount: comments.repliesCount,
      hasLiked: currentUserId
        ? sql<boolean>`CASE WHEN (SELECT 1 FROM comment_likes cl WHERE cl.comment_id = ${comments.id} AND cl.user_id = ${currentUserId}) = 1 THEN true ELSE false END`.as('has_liked')
        : sql<boolean>`false`.as('has_liked'),
      hasReposted: currentUserId
        ? sql<boolean>`CASE WHEN (SELECT 1 FROM comment_reposts cr WHERE cr.comment_id = ${comments.id} AND cr.user_id = ${currentUserId}) = 1 THEN true ELSE false END`.as('has_reposted')
        : sql<boolean>`false`.as('has_reposted')
    })
    .from(comments)
    .leftJoin(users, eq(comments.authorId, users.id))
    .where(and(eq(comments.playerId, player.id), isNull(comments.parentId)))
    .orderBy(desc(comments.createdAt))

  const posColor = POSITION_COLORS[player.position] || 'var(--text-primary)'

  return (
    <>
      <Navbar userName={session?.user?.name} />
      
      <main className="min-h-screen pt-24 pb-16 px-4 overflow-hidden relative">
        <div 
          className="absolute inset-0 z-0 opacity-20 pointer-events-none"
          style={{ background: `radial-gradient(circle at 50% 20%, ${posColor}20 0%, transparent 60%)` }}
        />

        <div className="max-w-4xl mx-auto relative z-10">
          
          <Link 
            href="/influencers" 
            className="inline-flex items-center gap-2 text-sm mb-8 transition-colors hover:text-white"
            style={{ color: 'var(--text-muted)' }}
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a Influencers
          </Link>

          <div className="flex flex-col gap-10">
            
            {/* ====== Row 1: Foto | Bio ====== */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Foto Player */}
              <div 
                className="glass-card rounded-3xl overflow-hidden relative group aspect-[4/5] flex items-center justify-center p-6"
                style={{ border: `1px solid ${posColor}40` }}
              >
                <div 
                  className="absolute inset-0 transition-opacity duration-500 opacity-50 group-hover:opacity-100"
                  style={{ background: `radial-gradient(ellipse at center, ${posColor}40 0%, transparent 70%)` }}
                />
                {player.number && (
                  <div className="absolute top-4 -right-8 text-[12rem] font-display opacity-[0.03] select-none leading-none z-0">
                    {player.number}
                  </div>
                )}
                {player.imageUrl ? (
                  <img 
                    src={player.imageUrl} 
                    alt={player.name} 
                    className="w-full h-full object-cover object-top relative z-10 rounded-2xl drop-shadow-2xl transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <span className="text-8xl relative z-10">⚽</span>
                )}
              </div>
              
              {/* Bio */}
              <div className="glass-card p-8 rounded-3xl flex flex-col h-full justify-center">
                <h2 className="text-2xl font-display tracking-widest mb-4 uppercase" style={{ color: 'var(--text-primary)' }}>
                  Biografía
                </h2>
                <div className="w-16 h-[3px] bg-yellow-500 mb-6 rounded-full" style={{ background: posColor }} />
                <p className="text-base leading-relaxed flex-grow text-justify" style={{ color: 'var(--text-secondary)' }}>
                  {player.bio || `${player.name} es una estrella de Micasino TV Show. Con talento, carisma y habilidades excepcionales, entrega todo su esfuerzo y diversión en cada duelo de influencers representando al canal oficial.`}
                </p>
              </div>
            </div>

            {/* ====== Row 2: Tag & Nombre | Hypes ====== */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center mt-2">
              <div>
                <span 
                  className="px-4 py-1.5 text-xs font-bold uppercase tracking-widest rounded-full border mb-4 inline-block"
                  style={{ borderColor: posColor, color: posColor, background: `${posColor}10` }}
                >
                  {POSITION_LABELS[player.position]}
                </span>
                
                <h1 className="font-display text-5xl sm:text-7xl leading-none mb-3" style={{ color: 'var(--text-primary)' }}>
                  {player.name}
                </h1>
                
                <div className="flex items-center gap-4 text-base" style={{ color: 'var(--text-secondary)' }}>
                  <span className="flex items-center gap-2 font-medium">
                    <Shield className="w-5 h-5 text-gray-500" />
                    {player.club}
                  </span>
                </div>
              </div>

              {/* Hypes Button */}
              <div className="flex justify-start md:justify-end">
                <HypeButton 
                  playerId={player.id} 
                  initialHypeCount={player.hypeCount ?? 0} 
                  initialHasHyped={player.hasHyped} 
                />
              </div>
            </div>

            {/* ====== Row 3: Clips Grid (Interactive Video clips list) ====== */}
            <ClipGrid playerName={player.name} />

            {/* ====== Row 5: Opiniones ====== */}
            <div className="mt-8">
              <h2 className="font-display text-4xl mb-6 border-b pb-4" style={{ color: 'var(--text-primary)', borderColor: 'var(--border)' }}>
                COMENTARIOS
              </h2>
              
              <div className="flex flex-col gap-4 mb-10">
                {playerOpinions.length > 0 ? (
                  playerOpinions.map(opinion => (
                    <CommentCard
                      key={opinion.id}
                      id={opinion.id}
                      content={opinion.content}
                      formattedTime={formatRelativeTime(opinion.createdAt)}
                      authorId={opinion.authorId}
                      authorName={opinion.authorName}
                      authorAvatar={opinion.authorAvatar}
                      initialLikesCount={opinion.likesCount}
                      initialRepostsCount={opinion.repostsCount}
                      initialRepliesCount={opinion.repliesCount}
                      initialHasLiked={opinion.hasLiked}
                      initialHasReposted={opinion.hasReposted}
                    />
                  ))
                ) : (
                  <div className="glass-card opacity-60 rounded-3xl p-10 text-center flex flex-col items-center justify-center border-dashed border-2">
                    <MessageSquareText className="w-10 h-10 mb-4" style={{ color: 'var(--text-muted)' }} />
                    <p className="text-base font-medium" style={{ color: 'var(--text-primary)' }}>Aún no hay comentarios</p>
                    <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Sé el primero en comentar sobre {player.name}.</p>
                  </div>
                )}
              </div>

              {/* Call to action */}
              <div className="text-center mt-4 p-8 bg-black/20 border border-white/5 rounded-3xl">
                <p className="font-display text-4xl mb-6 tracking-widest" style={{ color: 'var(--text-primary)' }}>¿Quieres dejar tu comentario?</p>
                {session?.user ? (
                  <CommentForm postAction={postComment} />
                ) : (
                  <Link href="/login" className="px-8 py-4 rounded-xl font-bold inline-block transition-all hover:scale-105 hover:bg-white border text-sm" style={{ borderColor: 'var(--text-muted)', color: 'var(--bg-base)', background: 'var(--text-primary)' }}>
                    Inicia sesión para comentar
                  </Link>
                )}
              </div>
            </div>

          </div>
        </div>
      </main>
      
      <Footer />
    </>
  )
}
