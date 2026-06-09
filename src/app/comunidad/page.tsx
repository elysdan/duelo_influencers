import { db } from '@/db'
import { comments, users, players } from '@/db/schema'
import { eq, desc, isNull, and, sql } from 'drizzle-orm'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { auth } from '@/lib/auth'
import CommunityForm from './CommunityForm'
import CommunityCard from './CommunityCard'
import { MessageSquareText } from 'lucide-react'

export async function generateMetadata() {
  return { title: 'Comunidad | Micasino TV Show' }
}

export default async function ComunidadPage() {
  const session = await auth()
  const currentUserId = session?.user?.id

  // Fetch comments joined with users (author) and players (influencer image)
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
      playerImage: players.imageUrl,
      playerName: players.name,
      mediaUrl: comments.mediaUrl,
      mediaType: comments.mediaType,
      hasLiked: currentUserId
        ? sql<boolean>`CASE WHEN (SELECT 1 FROM comment_likes cl WHERE cl.comment_id = ${comments.id} AND cl.user_id = ${currentUserId}) = 1 THEN true ELSE false END`.as('has_liked')
        : sql<boolean>`false`.as('has_liked'),
      hasReposted: currentUserId
        ? sql<boolean>`CASE WHEN (SELECT 1 FROM comment_reposts cr WHERE cr.comment_id = ${comments.id} AND cr.user_id = ${currentUserId}) = 1 THEN true ELSE false END`.as('has_reposted')
        : sql<boolean>`false`.as('has_reposted')
    })
    .from(comments)
    .leftJoin(users, eq(users.id, comments.authorId))
    .leftJoin(players, eq(players.id, comments.playerId))
    .where(isNull(comments.parentId))
    .orderBy(desc(comments.createdAt))

  return (
    <>
      <Navbar userName={session?.user?.name} />
      
      <main className="min-h-screen pt-24 pb-16 px-4 bg-[var(--bg-base)] relative">
        
        <div className="max-w-4xl mx-auto relative z-10">
          
          {/* Header Title with +10.000 Members */}
          <div className="relative flex flex-col md:flex-row items-center justify-center gap-6 mb-10 w-full min-h-[50px]">
            {/* Center Logo */}
            <div className="select-none pointer-events-none flex justify-center">
              <img 
                src="/titulo_comunidad.png" 
                alt="Comunidad" 
                className="w-full max-w-[280px] sm:max-w-[340px] h-auto object-contain block" 
              />
            </div>

            {/* Right side Members count */}
            <div className="md:absolute md:right-0 md:top-1/2 md:-translate-y-1/2 flex items-center gap-3 bg-white/70 backdrop-blur-md py-2 px-4 rounded-full border border-zinc-300 shrink-0 select-none shadow-sm">
              {/* Overlapping avatars */}
              <div className="flex -space-x-3.5">
                <img src="/players/camilo-vargas.webp" className="w-8 h-8 rounded-full border-2 border-white object-cover" alt="Member" />
                <img src="/players/david-ospina.webp" className="w-8 h-8 rounded-full border-2 border-white object-cover" alt="Member" />
                <img src="/players/luis-diaz.webp" className="w-8 h-8 rounded-full border-2 border-white object-cover" alt="Member" />
              </div>
              <div className="flex flex-col text-left leading-none">
                <span className="text-sm font-black text-zinc-900">+10.000</span>
                <span className="text-[10px] font-bold text-zinc-650 uppercase tracking-wider">miembros</span>
              </div>
            </div>
          </div>

          {/* Forum Form "Postea algo..." */}
          <CommunityForm user={session?.user} />

          {/* Posts Grid */}
          <div className="mt-8">
            {feed.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {feed.map(post => (
                  <CommunityCard
                    key={post.id}
                    id={post.id}
                    content={post.content}
                    playerImage={post.playerImage}
                    playerName={post.playerName}
                    authorName={post.authorName}
                    authorAvatar={post.authorAvatar}
                    initialLikesCount={post.likesCount}
                    initialHasLiked={post.hasLiked}
                    initialRepliesCount={post.repliesCount}
                    isLoggedIn={!!session?.user}
                    mediaUrl={post.mediaUrl}
                    mediaType={post.mediaType}
                    currentUserAvatar={session?.user?.image}
                  />
                ))}
              </div>
            ) : (
              <div className="glass-card rounded-3xl p-16 text-center flex flex-col items-center justify-center border-dashed border-2 border-white/10 opacity-70">
                <MessageSquareText className="w-12 h-12 mb-4 text-gray-500" />
                <p className="text-base font-medium text-gray-250">El muro está vacío</p>
                <p className="text-sm mt-1 text-gray-400">Sé el primero en compartir tu opinión en la Comunidad de Micasino TV Show.</p>
              </div>
            )}
          </div>

        </div>
      </main>
      
      <Footer />
    </>
  )
}
