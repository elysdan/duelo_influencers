'use client'

import VideoPlayer from '@/components/landing/VideoPlayer'
import RecentOpinions from '@/components/landing/RecentOpinions'
import SidebarRecommendations from '@/components/landing/SidebarRecommendations'

interface NewsItem {
  id: string
  title: string
  excerpt: string | null
  imageUrl: string | null
  source: string
  publishedAt: Date | null
  externalUrl: string
}

interface PlayerItem {
  id: string
  name: string
  imageUrl: string | null
  position: string
  club: string
}

interface HomeGridProps {
  news: NewsItem[]
  players: PlayerItem[]
  user: {
    name?: string | null
    email?: string | null
    image?: string | null
    id?: string | null
  } | null | undefined
}

export default function HomeGrid({ news, players, user }: HomeGridProps) {
  const videoSource = '/videos/MICRO DUELO DE INFLUENCER 1805 APROB.mp4'

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
      {/* 1. Large Immersive Video Player (always 100% width on top) */}
      <div className="w-full">
        <VideoPlayer src={videoSource} />
      </div>

      {/* 2. Main Two-Column Content Grid directly below the player */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left Column (Main Content): Comments */}
        <div className="lg:col-span-2 flex flex-col w-full">
          <RecentOpinions user={user} />
        </div>

        {/* Right Column (Sidebar Recommendations): Up Next, Related Videos, Channels */}
        <div className="lg:col-span-1 w-full">
          <SidebarRecommendations news={news} players={players} />
        </div>
      </div>
    </div>
  )
}
