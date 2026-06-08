import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { db } from '@/db'
import { users } from '@/db/schema'
import { eq } from 'drizzle-orm'
import ProfileForm from './ProfileForm'
import { updateProfile, deleteAvatar, uploadNewAvatar } from './actions'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import fs from 'fs'
import path from 'path'

export const metadata = {
  title: 'Mi Perfil | Micasino TV Show',
  description: 'Configura tu perfil para unirte a la comunidad',
}

export default async function ProfilePage() {
  const session = await auth()

  const userId = session?.user?.id

  if (!userId) {
    redirect('/login')
  }

  const [userDb] = await db
    .select({
      name: users.name,
      avatarUrl: users.avatarUrl,
      profilePicture: users.profilePicture,
      fullName: users.fullName,
      birthDate: users.birthDate,
      phone: users.phone,
      altEmail: users.altEmail,
      addressCountry: users.addressCountry,
      addressState: users.addressState,
      addressCity: users.addressCity,
      gender: users.gender,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)

  if (!userDb) {
    redirect('/login')
  }

  const defaultDir = path.join(process.cwd(), 'public', 'cartoons')
  let defaultAvatars: string[] = []
  if (fs.existsSync(defaultDir)) {
    const files = fs.readdirSync(defaultDir)
    // Only include images
    defaultAvatars = files.filter(f => /\.(png|jpe?g|webp|svg)$/i.test(f)).map(file => `/cartoons/${file}`)
  }

  const uploadDir = path.join(process.cwd(), 'uploads', userId)
  let userAvatars: string[] = []
  if (fs.existsSync(uploadDir)) {
    const files = fs.readdirSync(uploadDir)
    userAvatars = files.filter(f => /\.(png|jpe?g|webp|svg)$/i.test(f)).map(file => `/api/uploads/${userId}/${file}`)
  }

  const allAvatars = [...defaultAvatars, ...userAvatars]

  return (
    <>
      <Navbar userName={userDb.name} />

      <main className="min-h-screen pt-24 pb-12" style={{ background: 'var(--bg-base)', color: 'var(--text-primary)' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

          <header className="mb-10 text-center sm:text-left">
            <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight drop-shadow-lg" style={{ color: 'var(--yellow)' }}>
              MI PERFIL
            </h1>
            <p className="text-lg max-w-2xl" style={{ color: 'var(--text-secondary)' }}>
              Sube de nivel tu presencia en la comunidad. Sube tu foto, elige tu avatar y personaliza cómo te verán los demás usuarios.
            </p>
          </header>

          <ProfileForm
            initialName={userDb.name}
            initialAvatar={userDb.avatarUrl}
            initialPicture={userDb.profilePicture}
            initialFullName={userDb.fullName}
            initialBirthDate={userDb.birthDate}
            initialPhone={userDb.phone}
            initialAltEmail={userDb.altEmail}
            initialAddressCountry={userDb.addressCountry}
            initialAddressState={userDb.addressState}
            initialAddressCity={userDb.addressCity}
            initialGender={userDb.gender}
            availableAvatars={allAvatars}
            updateAction={updateProfile}
            deleteAction={deleteAvatar}
            uploadAction={uploadNewAvatar}
          />

        </div>
      </main>
      <Footer />
    </>
  )
}