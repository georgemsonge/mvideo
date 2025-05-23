"use client"

import { useState, useRef, useEffect } from "react"
import VideoCard from "@/components/video-card"

// Sample video data with reliable sources
const VIDEOS = [
  {
    id: "1",
    videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    thumbnailUrl: "/placeholder.svg?height=720&width=405&text=Video+1",
    user: {
      username: "@taylorswift",
      avatar: "/placeholder.svg?height=50&width=50",
      isVerified: true,
    },
    description: "New song out now! #music #newrelease",
    likes: "1.2M",
    comments: "24.5K",
    shares: "86.3K",
    audio: "Original Sound - Taylor Swift",
  },
  {
    id: "2",
    videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    thumbnailUrl: "/placeholder.svg?height=720&width=405&text=Video+2",
    user: {
      username: "@foodlover",
      avatar: "/placeholder.svg?height=50&width=50",
      isVerified: false,
    },
    description: "Try this amazing recipe! #food #cooking #recipe",
    likes: "345.6K",
    comments: "12.3K",
    shares: "42.1K",
    audio: "Cooking Time - Food Channel",
  },
  {
    id: "3",
    videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    thumbnailUrl: "/placeholder.svg?height=720&width=405&text=Video+3",
    user: {
      username: "@traveler",
      avatar: "/placeholder.svg?height=50&width=50",
      isVerified: true,
    },
    description: "Exploring the beautiful beaches of Bali! #travel #bali #vacation",
    likes: "789.2K",
    comments: "32.1K",
    shares: "56.7K",
    audio: "Paradise - Travel Sounds",
  },
  {
    id: "4",
    videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    thumbnailUrl: "/placeholder.svg?height=720&width=405&text=Video+4",
    user: {
      username: "@gamer",
      avatar: "/placeholder.svg?height=50&width=50",
      isVerified: false,
    },
    description: "Check out this amazing gameplay! #gaming #streamer",
    likes: "567.8K",
    comments: "18.9K",
    shares: "34.2K",
    audio: "Gaming Sounds - Game Channel",
  },
  {
    id: "5",
    videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
    thumbnailUrl: "/placeholder.svg?height=720&width=405&text=Video+5",
    user: {
      username: "@comedian",
      avatar: "/placeholder.svg?height=50&width=50",
      isVerified: true,
    },
    description: "This made me laugh so hard! #comedy #funny #viral",
    likes: "1.5M",
    comments: "45.6K",
    shares: "98.7K",
    audio: "Comedy Central - Funny Moments",
  },
]

export default function VideoFeed() {
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0)
  const feedRef = useRef<HTMLDivElement>(null)

  // Use refs instead of state to track preloaded videos to avoid re-renders
  const preloadedVideosRef = useRef<Set<string>>(new Set())
  const preloadingRef = useRef<Set<string>>(new Set())
  const lastPreloadedIndexRef = useRef<number>(-1)

  // Handle scroll events to update current video index
  const handleScroll = () => {
    if (!feedRef.current) return

    const scrollPosition = feedRef.current.scrollTop
    const videoHeight = feedRef.current.clientHeight
    const index = Math.round(scrollPosition / videoHeight)

    if (index !== currentVideoIndex && index >= 0 && index < VIDEOS.length) {
      setCurrentVideoIndex(index)
    }
  }

  // Set up scroll event listener
  useEffect(() => {
    const feedElement = feedRef.current
    if (feedElement) {
      feedElement.addEventListener("scroll", handleScroll)
      return () => feedElement.removeEventListener("scroll", handleScroll)
    }
  }, [])

  // Preload videos when current index changes
  useEffect(() => {
    // Skip if we've already preloaded for this index
    if (lastPreloadedIndexRef.current === currentVideoIndex) {
      return
    }

    // Update the last preloaded index
    lastPreloadedIndexRef.current = currentVideoIndex

    const preloadVideos = async () => {
      // Determine which videos to preload (current, previous, next, next+1)
      const indicesToPreload = [
        currentVideoIndex, // Current video
        currentVideoIndex - 1, // Previous video
        currentVideoIndex + 1, // Next video
        currentVideoIndex + 2, // Next + 1 video
      ].filter((index) => index >= 0 && index < VIDEOS.length)

      // Preload each video
      for (const index of indicesToPreload) {
        const videoUrl = VIDEOS[index].videoUrl

        // Skip if already preloaded or currently preloading
        if (preloadedVideosRef.current.has(videoUrl) || preloadingRef.current.has(videoUrl)) {
          continue
        }

        // Mark as preloading
        preloadingRef.current.add(videoUrl)

        console.log(`Preloading video: ${index}`)

        try {
          // Create a video element for preloading
          const videoElement = document.createElement("video")
          videoElement.preload = "auto"
          videoElement.muted = true
          videoElement.src = videoUrl

          // Start loading the video data
          videoElement.load()

          // Wait for the video to be ready or timeout
          await Promise.race([
            new Promise<void>((resolve) => {
              videoElement.addEventListener(
                "loadeddata",
                () => {
                  resolve()
                },
                { once: true },
              )
            }),
            new Promise<void>((resolve) => {
              setTimeout(resolve, 5000) // 5 second timeout
            }),
          ])

          // Mark as preloaded
          preloadedVideosRef.current.add(videoUrl)
          console.log(`Video ${index} preloaded successfully`)
        } catch (error) {
          console.error(`Error preloading video ${index}:`, error)
        } finally {
          // Remove from preloading set
          preloadingRef.current.delete(videoUrl)
        }
      }
    }

    preloadVideos()
  }, [currentVideoIndex]) // Only depend on currentVideoIndex

  // Check if a video is preloaded
  const isVideoPreloaded = (videoUrl: string) => {
    return preloadedVideosRef.current.has(videoUrl)
  }

  return (
    <div
      ref={feedRef}
      className="flex-1 overflow-y-scroll snap-y snap-mandatory"
      style={{ scrollSnapType: "y mandatory" }}
    >
      {VIDEOS.map((video, index) => (
        <VideoCard
          key={video.id}
          video={video}
          isActive={index === currentVideoIndex}
          isPreloaded={isVideoPreloaded(video.videoUrl)}
        />
      ))}
    </div>
  )
}
