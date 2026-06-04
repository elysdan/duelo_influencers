import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { db } from '@/db'
import { users, showGames } from '@/db/schema'
import { eq } from 'drizzle-orm'
import AdminJuegosClient from './AdminJuegosClient'

export const metadata = { title: 'Administrar Juegos | Micasino TV Show' }

export default async function AdminJuegosPage() {
  const session = await auth()
  if (!session?.user?.id) {
    redirect('/juegos')
  }

  // Double check admin role in DB
  const [user] = await db
    .select({ role: users.role })
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1)

  if (user?.role !== 'ADMIN') {
    redirect('/juegos')
  }

  // Fetch current games from DB
  const currentGames = await db.select().from(showGames).orderBy(showGames.createdAt)

  return (
    <div className="flex flex-col min-h-screen bg-[#06070b] relative overflow-hidden text-white">
      {/* Background decoration */}
      <div className="absolute top-[10%] left-[-15%] w-[600px] h-[600px] bg-yellow-500/3 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[-15%] w-[600px] h-[600px] bg-yellow-500/3 rounded-full blur-[150px] pointer-events-none" />

      <main className="flex-grow pt-32 pb-24 px-4 sm:px-6 relative z-10">
        <AdminJuegosClient initialGames={currentGames} />
      </main>
    </div>
  )
}
