import dotenv from 'dotenv'
import path from 'path'
dotenv.config({ path: path.join(process.cwd(), '.env.local') })

async function main() {
  // Use dynamic imports to prevent ES6 hoist-ordering from running db connection before dotenv loads the env vars
  const { db } = await import('../src/db')
  const { blogPosts } = await import('../src/db/schema')

  const posts = await db.select().from(blogPosts)
  console.log('BLOG POSTS IN DB:')
  posts.forEach(p => {
    console.log(`- ID: ${p.id}`)
    console.log(`  Title: ${p.title}`)
    console.log(`  Image: ${p.imageUrl}`)
    console.log(`  Category: ${p.category}`)
  })
}

main().catch(console.error)
