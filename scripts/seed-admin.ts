import { config } from 'dotenv'
import { resolve } from 'path'

// Load environment variables manually from .env.local
config({ path: resolve(process.cwd(), '.env.local') })

import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import * as schema from '../src/db/schema'
import bcrypt from 'bcryptjs'

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const db = drizzle(pool, { schema })

async function seedAdmin() {
  console.log('🌱 Iniciando sembrado del usuario Administrador...')

  const email = 'admin@micasino.com'
  const password = 'micasino123'
  const passwordHash = await bcrypt.hash(password, 12)

  // Clear existing if any onConflict
  await db
    .insert(schema.users)
    .values({
      name: 'Admin Micasino',
      email: email,
      passwordHash: passwordHash,
      role: 'ADMIN',
    })
    .onConflictDoNothing()

  console.log('\n🎉 ¡Usuario Administrador Creado con Éxito!');
  console.log('------------------------------------------------');
  console.log(`📧 Email:      ${email}`);
  console.log(`🔑 Contraseña: ${password}`);
  console.log(`🛡️ Rol:        ADMIN`);
  console.log('------------------------------------------------');
  
  await pool.end()
}

seedAdmin().catch((err) => {
  console.error('❌ Error en seed de admin:', err)
  process.exit(1)
})
