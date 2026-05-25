import { auth } from '@/lib/auth'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import HomeGrid from '@/components/landing/HomeGrid'
import { db } from '@/db'
import { newsItems, players } from '@/db/schema'
import { desc, asc } from 'drizzle-orm'

export default async function HomePage() {
  const session = await auth()

  // Obtener últimas 6 noticias y top 6 jugadores para la barra lateral
  const [latestNews, topPlayers] = await Promise.all([
    db.select().from(newsItems).orderBy(desc(newsItems.publishedAt)).limit(6),
    db.select().from(players).orderBy(desc(players.hypeCount), asc(players.name)).limit(6),
  ])

  return (
    <div className="flex flex-col min-h-screen bg-[#06070b]">
      <Navbar userName={session?.user?.name} />
      <main className="flex-grow pt-16 pb-12">
        <HomeGrid news={latestNews} players={topPlayers} user={session?.user} />
      </main>
      <Footer />
    </div>
  )
}
