import { auth } from '@/lib/auth'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import HomeGrid from '@/components/landing/HomeGrid'
import { db } from '@/db'
import { newsItems, players, comments, users } from '@/db/schema'
import { desc, asc, isNull, and, eq } from 'drizzle-orm'

export default async function HomePage() {
  const session = await auth()

  // Obtener últimas 6 noticias, top 6 jugadores y las 2 publicaciones de la comunidad más recientes
  const [latestNews, topPlayers, latestCommunityPosts] = await Promise.all([
    db.select().from(newsItems).orderBy(desc(newsItems.publishedAt)).limit(6),
    db.select().from(players).orderBy(desc(players.hypeCount), asc(players.name)).limit(6),
    db
      .select({
        id: comments.id,
        content: comments.content,
        createdAt: comments.createdAt,
        authorName: users.name,
        authorAvatar: users.avatarUrl,
        likesCount: comments.likesCount,
        repliesCount: comments.repliesCount,
        playerImage: players.imageUrl,
        playerName: players.name,
        mediaUrl: comments.mediaUrl,
        mediaType: comments.mediaType,
      })
      .from(comments)
      .leftJoin(users, eq(users.id, comments.authorId))
      .leftJoin(players, eq(players.id, comments.playerId))
      .where(and(isNull(comments.parentId), isNull(comments.newsId)))
      .orderBy(desc(comments.createdAt))
      .limit(2),
  ])

  return (
    <div className="flex flex-col min-h-screen bg-[#06070b]">
      <Navbar userName={session?.user?.name} />
      <main className="flex-grow pt-16 pb-12">
        <HomeGrid 
          news={latestNews} 
          players={topPlayers} 
          communityPosts={latestCommunityPosts} 
          user={session?.user} 
        />
      </main>
      <div className="border-t border-white/5">
        <Footer />
      </div>
    </div>
  )
}


