import { auth } from '@/lib/auth'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { db } from '@/db'
import { showGames, users } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import GameDetailClient from './GameDetailClient'

interface DynamicGamePageProps {
  params: Promise<{ id: string }>
}

export default async function GameDetailPage({ params }: DynamicGamePageProps) {
  const { id } = await params
  const session = await auth()

  // Fetch the specific game from DB
  const [game] = await db
    .select()
    .from(showGames)
    .where(eq(showGames.id, id))
    .limit(1)

  if (!game) {
    notFound()
  }

  // Verify if the user is an admin
  let isAdmin = false
  if (session?.user?.id) {
    const [user] = await db
      .select({ role: users.role })
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1)
    isAdmin = user?.role === 'ADMIN'
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#06070b] relative overflow-hidden">
      {/* Background radial glows */}
      <div className="absolute top-[10%] left-[-10%] w-[600px] h-[600px] bg-yellow-500/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[-10%] w-[600px] h-[600px] bg-yellow-500/3 rounded-full blur-[160px] pointer-events-none" />

      <Navbar userName={session?.user?.name} />

      <GameDetailClient game={game} isAdmin={isAdmin} />

      <Footer />
    </div>
  )
}

