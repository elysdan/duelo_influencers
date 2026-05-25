import { db } from '@/db'
import { comments, users } from '@/db/schema'
import { eq, desc, isNull, and, sql } from 'drizzle-orm'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { auth } from '@/lib/auth'
import Link from 'next/link'
import { MessageSquareText } from 'lucide-react'
import { formatRelativeTime } from '@/lib/utils'
import CommunityForm from './CommunityForm'
import CommentCard from '@/components/shared/CommentCard'

export async function generateMetadata() {
  return { title: 'Comunidad del Show | Micasino TV Show' }
}

export default async function ComunidadPage() {
  const session = await auth()

  const currentUserId = session?.user?.id

  const feed = await db
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
    .leftJoin(users, eq(users.id, comments.authorId))
    .where(and(isNull(comments.playerId), isNull(comments.newsId), isNull(comments.parentId)))
    .orderBy(desc(comments.createdAt))

  return (
    <>
      <Navbar userName={session?.user?.name} />
      
      <main className="min-h-screen pt-32 pb-16 px-4 bg-gradient-to-b from-[var(--bg-base)] to-black relative">
        <div className="absolute inset-0 z-0 opacity-10 pointer-events-none" style={{ background: 'radial-gradient(circle at 50% 0%, var(--yellow) 0%, transparent 50%)' }} />
        
        <div className="max-w-2xl mx-auto relative z-10">
          
          <div className="mb-10 text-center">
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl text-yellow-500 mb-4 tracking-wider" style={{ textShadow: '0 0 40px rgba(234, 179, 8, 0.3)' }}>
              COMUNIDAD DEL SHOW
            </h1>
            <p className="text-gray-400 text-sm md:text-base max-w-lg mx-auto">
              El foro oficial para debatir sobre los micro duelos de influencers, compartir tus opiniones en tiempo real y apoyar a tus participantes favoritos.
            </p>
          </div>

          {session?.user ? (
            <CommunityForm />
          ) : (
            <div className="glass-card p-6 rounded-3xl mb-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left border border-white/5">
              <div>
                <h3 className="text-base font-bold text-white mb-1">Únete a la conversación</h3>
                <p className="text-xs text-gray-400">Inicia sesión para participar en los debates de la comunidad.</p>
              </div>
              <Link href="/login" className="px-6 py-2.5 rounded-full font-bold text-sm bg-yellow-500 text-black hover:bg-yellow-400 transition-colors shrink-0">
                Iniciar Sesión
              </Link>
            </div>
          )}

          <div className="flex flex-col gap-4">
            {feed.length > 0 ? (
              feed.map(post => (
                <CommentCard
                  key={post.id}
                  id={post.id}
                  content={post.content}
                  formattedTime={formatRelativeTime(post.createdAt)}
                  authorId={post.authorId}
                  authorName={post.authorName}
                  authorAvatar={post.authorAvatar}
                  initialLikesCount={post.likesCount}
                  initialRepostsCount={post.repostsCount}
                  initialRepliesCount={post.repliesCount}
                  initialHasLiked={post.hasLiked}
                  initialHasReposted={post.hasReposted}
                />
              ))
            ) : (
              <div className="glass-card rounded-3xl p-16 text-center flex flex-col items-center justify-center border-dashed border-2 border-white/10 opacity-70">
                <MessageSquareText className="w-12 h-12 mb-4 text-gray-500" />
                <p className="text-base font-medium text-gray-200">El muro está vacío</p>
                <p className="text-sm mt-1 text-gray-400">Sé el primero en compartir tu opinión sobre los duelos en la Comunidad de Micasino TV Show.</p>
              </div>
            )}
          </div>

        </div>
      </main>
      
      <Footer />
    </>
  )
}
