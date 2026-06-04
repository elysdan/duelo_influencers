import { auth } from '@/lib/auth'
import { db } from '@/db'
import { users, systemSettings } from '@/db/schema'
import { eq } from 'drizzle-orm'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import EditableClasificacion from '@/components/clasificacion/EditableClasificacion'

export const metadata = { title: 'Tabla de Clasificación Oficial | Micasino TV Show' }

export default async function ClasificacionPage() {
  const session = await auth()

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

  // Fetch customizable image URLs from settings table
  const [paisesSetting] = await db
    .select({ value: systemSettings.value })
    .from(systemSettings)
    .where(eq(systemSettings.key, 'tabla_de_paises_url'))
    .limit(1)

  const [semanaSetting] = await db
    .select({ value: systemSettings.value })
    .from(systemSettings)
    .where(eq(systemSettings.key, 'tabla_de_semana_url'))
    .limit(1)

  const tablaDePaisesUrl = paisesSetting?.value || '/TablaDePaises.png'
  const tablaDeSemanaUrl = semanaSetting?.value || '/TablaDeSemana.png'

  return (
    <div className="flex flex-col min-h-screen bg-[#06070b] relative overflow-hidden">
      {/* Background Decorative Glow Orbs */}
      <div className="absolute top-[20%] left-[-10%] w-[500px] h-[500px] bg-yellow-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[30%] right-[-10%] w-[600px] h-[600px] bg-yellow-500/3 rounded-full blur-[150px] pointer-events-none" />
      
      <Navbar userName={session?.user?.name} />

      <main className="flex-grow pt-32 pb-24 px-4 sm:px-6 lg:px-8 relative z-10">
        <EditableClasificacion 
          isAdmin={isAdmin}
          initialTablaDePaisesUrl={tablaDePaisesUrl}
          initialTablaDeSemanaUrl={tablaDeSemanaUrl}
        />
      </main>

      <Footer />
    </div>
  )
}


