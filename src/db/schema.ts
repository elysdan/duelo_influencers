import {
  pgTable,
  text,
  uuid,
  timestamp,
  integer,
  boolean,
  pgEnum,
  uniqueIndex,
  jsonb,
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

// ─── Enums ───────────────────────────────────────────────────────────────────

export const userGenderEnum = pgEnum('user_gender', [
  'MASCULINO',
  'FEMENINO',
  'OTROS',
])

export const userRoleEnum = pgEnum('user_role', [
  'ADMIN',
  'MICASINO',
  'USER',
])

export const newsSourceEnum = pgEnum('news_source', [
  'FCF',
  'ESPN',
  'AS',
  'MARCA',
  'EL_TIEMPO',
  'OTHER',
])

export const playerPositionEnum = pgEnum('player_position', [
  'POR', // Portero
  'DEF', // Defensa
  'MED', // Centrocampista
  'DEL', // Delantero
  'ENT', // Entrenador
])

// ─── Users ────────────────────────────────────────────────────────────────────

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  avatarUrl: text('avatar_url'),
  profilePicture: text('profile_picture'),
  fullName: text('full_name'),
  birthDate: timestamp('birth_date'),
  phone: text('phone'),
  altEmail: text('alt_email'),
  addressCountry: text('address_country'),
  addressState: text('address_state'),
  addressCity: text('address_city'),
  gender: userGenderEnum('gender'),
  role: userRoleEnum('role').default('USER').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// NextAuth tables (required by @auth/drizzle-adapter)
export const sessions = pgTable('sessions', {
  sessionToken: text('session_token').primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  expires: timestamp('expires').notNull(),
})

export const verificationTokens = pgTable('verification_tokens', {
  identifier: text('identifier').notNull(),
  token: text('token').notNull(),
  expires: timestamp('expires').notNull(),
})

// ─── Brackets ─────────────────────────────────────────────────────────────────

export const userBrackets = pgTable('user_brackets', {
  userId: uuid('user_id').primaryKey().references(() => users.id, { onDelete: 'cascade' }),
  predictions: jsonb('predictions').notNull().default({}),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// ─── News ─────────────────────────────────────────────────────────────────────

export const newsItems = pgTable('news_items', {
  id: uuid('id').defaultRandom().primaryKey(),
  externalUrl: text('external_url').notNull().unique(),
  title: text('title').notNull(),
  excerpt: text('excerpt'),
  imageUrl: text('image_url'),
  source: newsSourceEnum('source').notNull().default('OTHER'),
  publishedAt: timestamp('published_at'),
  fetchedAt: timestamp('fetched_at').defaultNow().notNull(),
})

// ─── Football Tournament (World Cup) ──────────────────────────────────────────

export const worldCupGroups = pgTable('world_cup_groups', {
  id: text('id').primaryKey(), // 'A', 'B', 'K', 'L'
  name: text('name').notNull(),
})

export const soccerTeams = pgTable('soccer_teams', {
  id: text('id').primaryKey(), // 'COL', 'ARG'
  name: text('name').notNull(),
  flag: text('flag').notNull(),
  groupId: text('group_id').references(() => worldCupGroups.id, { onDelete: 'set null' }),
})

export const worldCupMatches = pgTable('world_cup_matches', {
  id: uuid('id').defaultRandom().primaryKey(),
  team1Id: text('team1_id').notNull().references(() => soccerTeams.id, { onDelete: 'cascade' }),
  team2Id: text('team2_id').notNull().references(() => soccerTeams.id, { onDelete: 'cascade' }),
  date: timestamp('date').notNull(),
  venue: text('venue').notNull(),
  city: text('city').notNull(),
  phase: text('phase').notNull(),
  resultTeam1: integer('result_team1'),
  resultTeam2: integer('result_team2'),
})

// ─── Players ──────────────────────────────────────────────────────────────────

export const players = pgTable('players', {
  id: text('id').primaryKey(), // slug: 'luis-diaz'
  name: text('name').notNull(),
  position: playerPositionEnum('position').notNull(),
  club: text('club').notNull(),
  number: integer('number'),
  imageUrl: text('image_url'),
  bio: text('bio'),
  goals: integer('goals').default(0),
  assists: integer('assists').default(0),
  caps: integer('caps').default(0), // partidos internacionales
  hypeCount: integer('hype_count').default(0).notNull(),
  age: integer('age'),
  gender: text('gender'),
  clips: jsonb('clips').$type<{ id: string; title: string; thumbnailUrl: string }[]>(),
  videoUrl: text('video_url'),
  country: text('country'),
})

// ─── Player Hypes ─────────────────────────────────────────────────────────────

export const playerHypes = pgTable(
  'player_hypes',
  {
    userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    playerId: text('player_id').notNull().references(() => players.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    uniqueHype: uniqueIndex('unique_player_hype').on(table.userId, table.playerId),
  })
)

// ─── Comments ─────────────────────────────────────────────────────────────────

export const comments = pgTable('comments', {
  id: uuid('id').defaultRandom().primaryKey(),
  content: text('content').notNull(),
  authorId: uuid('author_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  newsId: uuid('news_id').references(() => newsItems.id, { onDelete: 'cascade' }),
  playerId: text('player_id').references(() => players.id, { onDelete: 'cascade' }),
  parentId: uuid('parent_id'), // self-reference for threaded replies
  likesCount: integer('likes_count').default(0).notNull(),
  repostsCount: integer('reposts_count').default(0).notNull(),
  repliesCount: integer('replies_count').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// ─── Comment Likes ────────────────────────────────────────────────────────────

export const commentLikes = pgTable(
  'comment_likes',
  {
    userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    commentId: uuid('comment_id').notNull().references(() => comments.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    uniqueLike: uniqueIndex('unique_comment_like').on(table.userId, table.commentId),
  })
)

// ─── Comment Reposts ──────────────────────────────────────────────────────────

export const commentReposts = pgTable(
  'comment_reposts',
  {
    userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    commentId: uuid('comment_id').notNull().references(() => comments.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    uniqueRepost: uniqueIndex('unique_comment_repost').on(table.userId, table.commentId),
  })
)

// ─── Relations ────────────────────────────────────────────────────────────────

export const usersRelations = relations(users, ({ one, many }) => ({
  comments: many(comments),
  hypes: many(playerHypes),
  commentLikes: many(commentLikes),
  commentReposts: many(commentReposts),
  sessions: many(sessions),
  bracket: one(userBrackets),
}))

export const userBracketsRelations = relations(userBrackets, ({ one }) => ({
  user: one(users, { fields: [userBrackets.userId], references: [users.id] }),
}))

export const playersRelations = relations(players, ({ many }) => ({
  comments: many(comments),
  hypes: many(playerHypes),
}))

export const newsItemsRelations = relations(newsItems, ({ many }) => ({
  comments: many(comments),
}))

export const commentsRelations = relations(comments, ({ one, many }) => ({
  author: one(users, { fields: [comments.authorId], references: [users.id] }),
  newsItem: one(newsItems, { fields: [comments.newsId], references: [newsItems.id] }),
  player: one(players, { fields: [comments.playerId], references: [players.id] }),
  parent: one(comments, { fields: [comments.parentId], references: [comments.id], relationName: 'replies' }),
  replies: many(comments, { relationName: 'replies' }),
  likes: many(commentLikes),
  reposts: many(commentReposts),
}))

export const commentRepostsRelations = relations(commentReposts, ({ one }) => ({
  user: one(users, { fields: [commentReposts.userId], references: [users.id] }),
  comment: one(comments, { fields: [commentReposts.commentId], references: [comments.id] }),
}))

export const worldCupGroupsRelations = relations(worldCupGroups, ({ many }) => ({
  teams: many(soccerTeams),
}))

export const soccerTeamsRelations = relations(soccerTeams, ({ one, many }) => ({
  group: one(worldCupGroups, { fields: [soccerTeams.groupId], references: [worldCupGroups.id] }),
  matchesAsTeam1: many(worldCupMatches, { relationName: 'team1Matches' }),
  matchesAsTeam2: many(worldCupMatches, { relationName: 'team2Matches' }),
}))

export const worldCupMatchesRelations = relations(worldCupMatches, ({ one }) => ({
  team1: one(soccerTeams, { fields: [worldCupMatches.team1Id], references: [soccerTeams.id], relationName: 'team1Matches' }),
  team2: one(soccerTeams, { fields: [worldCupMatches.team2Id], references: [soccerTeams.id], relationName: 'team2Matches' }),
}))

// ─── Podcast Episodes ─────────────────────────────────────────────────────────

export const podcastEpisodes = pgTable('podcast_episodes', {
  id: uuid('id').defaultRandom().primaryKey(),
  episodeNumber: integer('episode_number').notNull(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  shortDescription: text('short_description').default('').notNull(),
  category: text('category').default('ENTREVISTA').notNull(),
  thumbnailUrl: text('thumbnail_url').notNull(),
  youtubeId: text('youtube_id'),
  vimeoId: text('vimeo_id'),
  dailymotionId: text('dailymotion_id'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// ─── Blog Posts ───────────────────────────────────────────────────────────────

export const blogPosts = pgTable('blog_posts', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  imageUrl: text('image_url').notNull(),
  author: text('author').default('Admin').notNull(),
  publishedAt: timestamp('published_at').defaultNow().notNull(),
  caption: text('caption'),
  content: text('content').notNull(),
  additionalImages: jsonb('additional_images').default([]).notNull(),
  category: text('category').default('ENTREVISTA').notNull(),
  readTime: text('read_time').default('3 min').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// ─── System Settings ──────────────────────────────────────────────────────────

export const systemSettings = pgTable('system_settings', {
  key: text('key').primaryKey(),
  value: text('value').notNull(),
})

// ─── Show Games ───────────────────────────────────────────────────────────────

export const showGames = pgTable('show_games', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: text('title').notNull(),
  imageUrl: text('image_url'),
  hasImage: boolean('has_image').default(false).notNull(),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})


