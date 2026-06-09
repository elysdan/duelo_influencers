import { notFound } from 'next/navigation'
import { db } from '@/db'
import { users, comments, players } from '@/db/schema'
import { eq, desc, sql, and, isNull, inArray, or } from 'drizzle-orm'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { auth } from '@/lib/auth'
import Link from 'next/link'
import { ArrowLeft, MessageSquareText, Heart, Repeat2, LayoutGrid } from 'lucide-react'
import { formatRelativeTime, cn } from '@/lib/utils'
import CommentCard from '@/components/shared/CommentCard'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [user] = await db.select({ name: users.name }).from(users).where(eq(users.id, id)).limit(1)
  return { title: `${user?.name || 'Usuario'} | Colombia 2026` }
}

export default async function UserWallPage({ 
  params,
  searchParams
}: { 
  params: Promise<{ id: string }>
  searchParams: Promise<{ filter?: string }>
}) {
  const { id } = await params
  const resolvedSearchParams = await searchParams
  const currentFilter = resolvedSearchParams?.filter || 'all'

  const session = await auth()
  const currentUserId = session?.user?.id

  // Fetch user profile
  const [user] = await db
    .select({
      id: users.id,
      name: users.name,
      avatarUrl: users.avatarUrl,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(eq(users.id, id))
    .limit(1)

  if (!user) notFound()

  // Fetch stats
  const [stats] = await db
    .select({
      totalComments: sql<number>`count(*)`.as('total_comments'),
      totalLikes: sql<number>`coalesce(sum(${comments.likesCount}), 0)`.as('total_likes'),
      totalRepostsMade: sql<number>`(SELECT count(*) FROM comment_reposts cr WHERE cr.user_id = ${id})`.as('total_reposts_made'),
      totalRepostsReceived: sql<number>`coalesce(sum(${comments.repostsCount}), 0)`.as('total_reposts_received'),
    })
    .from(comments)
    .where(eq(comments.authorId, id))

  // Fetch all comments authored by user OR reposted by user
  const userComments = await db
    .select({
      id: comments.id,
      content: comments.content,
      createdAt: comments.createdAt,
      likesCount: comments.likesCount,
      repostsCount: comments.repostsCount,
      repliesCount: comments.repliesCount,
      parentId: comments.parentId,
      playerId: comments.playerId,
      newsId: comments.newsId,
      playerName: players.name,
      authorId: comments.authorId,
      authorName: users.name,
      authorAvatar: users.avatarUrl,
      hasLiked: currentUserId
        ? sql<boolean>`CASE WHEN (SELECT 1 FROM comment_likes cl WHERE cl.comment_id = ${comments.id} AND cl.user_id = ${currentUserId}) = 1 THEN true ELSE false END`.as('has_liked')
        : sql<boolean>`false`.as('has_liked'),
      hasReposted: currentUserId
        ? sql<boolean>`CASE WHEN (SELECT 1 FROM comment_reposts cr WHERE cr.comment_id = ${comments.id} AND cr.user_id = ${currentUserId}) = 1 THEN true ELSE false END`.as('has_reposted')
        : sql<boolean>`false`.as('has_reposted'),
      isRepostedByMe: sql<boolean>`CASE WHEN (SELECT 1 FROM comment_reposts cr WHERE cr.comment_id = ${comments.id} AND cr.user_id = ${id}) = 1 AND ${comments.authorId} != ${id} THEN true ELSE false END`.as('is_reposted_by_me')
    })
    .from(comments)
    .leftJoin(players, eq(comments.playerId, players.id))
    .leftJoin(users, eq(comments.authorId, users.id))
    .where(
      or(
        eq(comments.authorId, id),
        inArray(comments.id, sql`(SELECT comment_id FROM comment_reposts WHERE user_id = ${id})`)
      )
    )
    .orderBy(desc(comments.createdAt))

  // Build context labels
  const commentsWithContext = userComments.map(c => {
    let contextLabel: string = ''
    if (c.playerName) {
      contextLabel = `Perfil de ${c.playerName}`
    } else if (c.newsId) {
      contextLabel = 'Noticias'
    } else {
      contextLabel = 'Comunidad'
    }

    if (c.parentId) {
      contextLabel = `💬 Respuesta • ${contextLabel}`
    }

    if (c.isRepostedByMe) {
      contextLabel = `🔁 Reposteado por ${user.name.split(' ')[0]} • ${contextLabel}`
    }

    return { ...c, contextLabel }
  })

  // Computed lengths for pure counts
  const countTodo = commentsWithContext.length
  const countPublicaciones = commentsWithContext.filter(c => c.authorId === id && !c.parentId).length
  const countRespuestas = commentsWithContext.filter(c => c.authorId === id && c.parentId !== null).length

  // Filter application relative to user's selections
  let finalComments = commentsWithContext
  if (currentFilter === 'publicaciones') {
    finalComments = commentsWithContext.filter(c => c.authorId === id && !c.parentId)
  } else if (currentFilter === 'respuestas') {
    finalComments = commentsWithContext.filter(c => c.authorId === id && c.parentId !== null)
  } else if (currentFilter === 'likes') {
    finalComments = commentsWithContext.filter(c => c.authorId === id && c.likesCount > 0)
  } else if (currentFilter === 'reposts_made') {
    finalComments = commentsWithContext.filter(c => c.isRepostedByMe)
  } else if (currentFilter === 'reposts_received') {
    finalComments = commentsWithContext.filter(c => c.authorId === id && c.repostsCount > 0)
  }

  const joinDate = user.createdAt 
    ? new Date(user.createdAt).toLocaleDateString('es-CO', { year: 'numeric', month: 'long' })
    : 'Desconocido'

  return (
    <>
      <Navbar userName={session?.user?.name} />

      <main className="min-h-screen pt-24 pb-16 px-4 relative overflow-hidden">
        <div
          className="absolute inset-0 z-0 opacity-15 pointer-events-none"
          style={{ background: 'radial-gradient(circle at 50% 10%, var(--yellow) 0%, transparent 50%)' }}
        />

        <div className="max-w-2xl mx-auto relative z-10">

          <Link
            href="/comunidad"
            className="inline-flex items-center gap-2 text-sm mb-8 transition-colors hover:text-white"
            style={{ color: 'var(--text-muted)' }}
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a la Comunidad
          </Link>

          {/* Profile Header */}
          <div className="glass-card rounded-3xl p-8 mb-8 flex flex-col sm:flex-row items-center gap-6 border border-white/5">
            <div className="w-24 h-24 rounded-full bg-gray-800 flex items-center justify-center border-2 border-[var(--yellow)]/30 overflow-hidden relative shrink-0 shadow-[0_0_30px_rgba(245,197,24,0.15)]">
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-4xl font-bold text-[var(--yellow)]">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div className="text-center sm:text-left">
              <h1 className="font-display text-3xl sm:text-4xl tracking-wider mb-2" style={{ color: 'var(--text-primary)' }}>
                {user.name}
              </h1>
              <p className="text-sm text-gray-500">
                Miembro desde {joinDate}
              </p>
            </div>
          </div>

          {/* Stats Row With Filters */}
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3 mb-10">
            <Link 
              href="?filter=all"
              scroll={false} 
              className={cn("glass-card rounded-2xl p-4 sm:p-5 text-center border flex flex-col justify-center transition-all hover:bg-white/5", currentFilter === 'all' ? "border-[var(--yellow)] shadow-[0_0_15px_rgba(255,204,0,0.1)] bg-white/5" : "border-white/5")}
            >
              <div className="flex items-center justify-center mb-2">
                <LayoutGrid className={cn("w-4 h-4", currentFilter === 'all' ? "text-[var(--yellow)]" : "text-gray-400")} />
              </div>
              <span className="font-mono text-xl sm:text-2xl font-bold text-white block mb-1">{countTodo}</span>
              <span className="text-[9px] sm:text-[10px] uppercase tracking-wider text-gray-500 font-semibold leading-tight">Ver todo</span>
            </Link>

            <Link 
              href="?filter=publicaciones"
              scroll={false} 
              className={cn("glass-card rounded-2xl p-4 sm:p-5 text-center border flex flex-col justify-center transition-all hover:bg-white/5", currentFilter === 'publicaciones' ? "border-[var(--yellow)] shadow-[0_0_15px_rgba(255,204,0,0.1)] bg-white/5" : "border-white/5")}
            >
              <div className="flex items-center justify-center mb-2">
                <MessageSquareText className={cn("w-4 h-4", currentFilter === 'publicaciones' ? "text-[var(--yellow)]" : "text-gray-400")} />
              </div>
              <span className="font-mono text-xl sm:text-2xl font-bold text-white block mb-1">{countPublicaciones}</span>
              <span className="text-[9px] sm:text-[10px] uppercase tracking-wider text-gray-500 font-semibold leading-tight">Publicaciones</span>
            </Link>

            <Link 
              href="?filter=respuestas"
              scroll={false} 
              className={cn("glass-card rounded-2xl p-4 sm:p-5 text-center border flex flex-col justify-center transition-all hover:bg-white/5", currentFilter === 'respuestas' ? "border-[var(--yellow)] shadow-[0_0_15px_rgba(255,204,0,0.1)] bg-white/5" : "border-white/5")}
            >
              <div className="flex items-center justify-center mb-2">
                <MessageSquareText className={cn("w-4 h-4 opacity-70", currentFilter === 'respuestas' ? "text-[var(--yellow)]" : "text-gray-400")} />
              </div>
              <span className="font-mono text-xl sm:text-2xl font-bold text-white block mb-1">{countRespuestas}</span>
              <span className="text-[9px] sm:text-[10px] uppercase tracking-wider text-gray-500 font-semibold leading-tight">Respuestas</span>
            </Link>

            <Link 
              href="?filter=likes"
              scroll={false} 
              className={cn("glass-card rounded-2xl p-4 sm:p-5 text-center border flex flex-col justify-center transition-all hover:bg-white/5", currentFilter === 'likes' ? "border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.1)] bg-white/5" : "border-white/5")}
            >
              <div className="flex items-center justify-center mb-2">
                <Heart className={cn("w-4 h-4", currentFilter === 'likes' ? "text-red-500" : "text-gray-400")} />
              </div>
              <span className="font-mono text-xl sm:text-2xl font-bold text-white block mb-1">{stats?.totalLikes ?? 0}</span>
              <span className="text-[9px] sm:text-[10px] uppercase tracking-wider text-gray-500 font-semibold leading-tight">Likes recibidos</span>
            </Link>

            <Link 
              href="?filter=reposts_made"
              scroll={false} 
              className={cn("glass-card rounded-2xl p-4 sm:p-5 text-center border flex flex-col justify-center transition-all hover:bg-white/5", currentFilter === 'reposts_made' ? "border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.1)] bg-white/5" : "border-white/5")}
            >
              <div className="flex items-center justify-center mb-2">
                <Repeat2 className={cn("w-4 h-4", currentFilter === 'reposts_made' ? "text-blue-500" : "text-gray-400")} />
              </div>
              <span className="font-mono text-xl sm:text-2xl font-bold text-white block mb-1">{stats?.totalRepostsMade ?? 0}</span>
              <span className="text-[9px] sm:text-[10px] uppercase tracking-wider text-gray-500 font-semibold leading-tight">Reposts hechos</span>
            </Link>

            <Link 
              href="?filter=reposts_received"
              scroll={false} 
              className={cn("glass-card rounded-2xl p-4 sm:p-5 text-center border flex flex-col justify-center transition-all hover:bg-white/5", currentFilter === 'reposts_received' ? "border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.1)] bg-white/5" : "border-white/5")}
            >
              <div className="flex items-center justify-center mb-2">
                <Repeat2 className={cn("w-4 h-4", currentFilter === 'reposts_received' ? "text-emerald-500" : "text-gray-400")} />
              </div>
              <span className="font-mono text-xl sm:text-2xl font-bold text-white block mb-1">{stats?.totalRepostsReceived ?? 0}</span>
              <span className="text-[9px] sm:text-[10px] uppercase tracking-wider text-gray-500 font-semibold leading-tight">Reposts recib.</span>
            </Link>
          </div>



          {/* Wall / Timeline */}
          <h2 className="font-display text-2xl tracking-wider mb-6 border-b border-white/10 pb-4 flex items-center justify-between" style={{ color: 'var(--text-primary)' }}>
            <span>MURO DE PUBLICACIONES</span>
            {currentFilter !== 'all' && (
              <span className="text-sm font-medium uppercase text-gray-400 tracking-wider">
                Filtro Activo
              </span>
            )}
          </h2>

          <div className="flex flex-col gap-4">
            {finalComments.length > 0 ? (
              finalComments.map(c => (
                <CommentCard
                  key={c.id}
                  id={c.id}
                  content={c.content}
                  formattedTime={formatRelativeTime(c.createdAt)}
                  authorId={c.authorId}
                  authorName={c.authorName}
                  authorAvatar={c.authorAvatar}
                  initialLikesCount={c.likesCount}
                  initialRepostsCount={c.repostsCount}
                  initialRepliesCount={c.repliesCount}
                  initialHasLiked={c.hasLiked}
                  initialHasReposted={c.hasReposted}
                  contextLabel={
                    c.isRepostedByMe ? (
                      <span className="text-gray-400 font-medium whitespace-nowrap overflow-hidden text-ellipsis flex items-center gap-1">
                        <Repeat2 className="w-3 h-3 text-blue-400 shrink-0" />
                        <span className="text-blue-400">Reposteado por {user.name.split(' ')[0]}</span> <span className="opacity-50">·</span> {c.contextLabel.split('•').slice(1).join('•')}
                      </span>
                    ) : (
                      c.contextLabel
                    )
                  }
                />
              ))
            ) : (
              <div className="glass-card rounded-3xl p-16 text-center flex flex-col items-center justify-center border-dashed border-2 border-white/10 opacity-70">
                <MessageSquareText className="w-12 h-12 mb-4 text-gray-500" />
                <p className="text-base font-medium text-gray-200">
                  {currentFilter === 'all' ? 'Sin publicaciones todavía' : 'No hay elementos para este filtro'}
                </p>
                <p className="text-sm mt-1 text-gray-400">
                   {currentFilter === 'all' 
                     ? `${user.name} aún no ha interactuado en la plataforma.` 
                     : 'Intenta seleccionar otra categoría arriba.'}
                </p>
              </div>
            )}
          </div>

        </div>
      </main>

      <Footer />
    </>
  )
}
