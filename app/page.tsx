import VideoFeed from "@/components/video-feed"
import BottomNavigation from "@/components/bottom-navigation"

export default function Home() {
  return (
    <main className="flex flex-col h-screen bg-black overflow-hidden">
      <VideoFeed />
      <BottomNavigation />
    </main>
  )
}
