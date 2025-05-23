"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Heart, MessageCircle, Share2, Music2, CheckCircle, Play, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import CommentsSection from "./comments-section"

interface VideoCardProps {
  video: {
    id: string
    videoUrl: string
    thumbnailUrl: string
    user: {
      username: string
      avatar: string
      isVerified: boolean
    }
    description: string
    likes: string
    comments: string
    shares: string
    audio: string
  }
  isActive: boolean
  isPreloaded?: boolean
}

export default function VideoCard({ video, isActive, isPreloaded = false }: VideoCardProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [isCommentsOpen, setIsCommentsOpen] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const previousActiveRef = useRef<boolean>(false)

  // Reset error state when video changes
  useEffect(() => {
    setHasError(false)
    setIsLoading(true)
    setLoadingProgress(0)
  }, [video.videoUrl])

  // Handle video playback based on active state
  useEffect(() => {
    if (!videoRef.current) return

    // If this is the first time this video becomes active
    if (isActive && !previousActiveRef.current) {
      const videoElement = videoRef.current

      // If the video is already preloaded, it might be ready to play
      if (isPreloaded) {
        console.log(`Video ${video.id} is preloaded, attempting to play`)

        // Check if the video has enough data to start playing
        if (videoElement.readyState >= 3) {
          // HAVE_FUTURE_DATA or higher
          setIsLoading(false)
          playVideo(videoElement)
        } else {
          // Even though it's preloaded, we still need to wait for data
          console.log(`Video ${video.id} is preloaded but not ready yet, waiting...`)

          // Set up event listeners for loading progress
          setupLoadingListeners(videoElement)

          // Make sure the video is loading
          videoElement.load()
        }
      } else {
        // Video wasn't preloaded, start loading now
        console.log(`Video ${video.id} is not preloaded, starting load`)
        setIsLoading(true)

        // Set up event listeners for loading progress
        setupLoadingListeners(videoElement)

        // Start loading the video
        videoElement.load()
      }
    }
    // If the video is no longer active, pause it
    else if (!isActive && previousActiveRef.current) {
      videoRef.current.pause()
      setIsPlaying(false)
    }

    // Update the previous active state
    previousActiveRef.current = isActive
  }, [isActive, isPreloaded, video.id])

  // Pause video when comments are open
  useEffect(() => {
    if (isCommentsOpen && videoRef.current && isPlaying) {
      videoRef.current.pause()
      setIsPlaying(false)
    }
  }, [isCommentsOpen, isPlaying])

  // Set up loading event listeners for a video element
  const setupLoadingListeners = (videoElement: HTMLVideoElement) => {
    // Track loading progress
    const handleProgress = () => {
      if (videoElement.buffered.length > 0) {
        const bufferedEnd = videoElement.buffered.end(videoElement.buffered.length - 1)
        const duration = videoElement.duration
        if (duration > 0) {
          const progress = (bufferedEnd / duration) * 100
          setLoadingProgress(Math.round(progress))
        }
      }
    }

    // Handle when video can play through
    const handleCanPlayThrough = () => {
      console.log(`Video ${video.id} can play through`)
      setIsLoading(false)

      if (isActive) {
        playVideo(videoElement)
      }
    }

    // Add event listeners
    videoElement.addEventListener("progress", handleProgress)
    videoElement.addEventListener("canplaythrough", handleCanPlayThrough)

    // Handle loading timeout - if it takes too long, try to play anyway
    setTimeout(() => {
      if (isLoading && isActive) {
        console.log(`Video ${video.id} loading timeout, attempting to play anyway`)
        setIsLoading(false)
        playVideo(videoElement)
      }
    }, 5000)

    // Return cleanup function
    return () => {
      videoElement.removeEventListener("progress", handleProgress)
      videoElement.removeEventListener("canplaythrough", handleCanPlayThrough)
    }
  }

  // Play a video with error handling
  const playVideo = (videoElement: HTMLVideoElement) => {
    const playPromise = videoElement.play()

    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          setIsPlaying(true)
          setIsLoading(false)
        })
        .catch((error) => {
          console.error(`Video ${video.id} play failed:`, error)
          setIsPlaying(false)
          setHasError(true)
          setIsLoading(false)
        })
    }
  }

  // Toggle play/pause when user taps the video
  const togglePlayPause = () => {
    if (hasError || isLoading) return

    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
        setIsPlaying(false)
      } else {
        playVideo(videoRef.current)
      }
    }
  }

  const toggleLike = () => {
    setIsLiked(!isLiked)
  }

  const handleVideoError = () => {
    console.error(`Video ${video.id} failed to load`)
    setHasError(true)
    setIsLoading(false)
  }

  const openComments = (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent video play/pause
    setIsCommentsOpen(true)
  }

  const closeComments = () => {
    setIsCommentsOpen(false)
  }

  return (
    <div className="relative h-screen w-full snap-start snap-always">
      {/* Video or Fallback */}
      <div className="absolute inset-0 bg-black" onClick={togglePlayPause}>
        {hasError ? (
          // Error state - show thumbnail with error message
          <div className="h-full w-full flex flex-col items-center justify-center bg-gray-900">
            <img
              src={video.thumbnailUrl || "/placeholder.svg"}
              alt="Video thumbnail"
              className="absolute inset-0 w-full h-full object-cover opacity-50"
            />
            <div className="z-10 bg-black/70 p-4 rounded-lg text-center">
              <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-2" />
              <p className="text-white">Video unavailable</p>
              <p className="text-gray-400 text-sm mt-1">This content couldn't be loaded</p>
            </div>
          </div>
        ) : isLoading ? (
          // Loading state - show thumbnail with loading indicator
          <div className="h-full w-full flex items-center justify-center bg-gray-900">
            <img
              src={video.thumbnailUrl || "/placeholder.svg"}
              alt="Video thumbnail"
              className="absolute inset-0 w-full h-full object-cover opacity-50"
            />
            <div className="z-10 flex flex-col items-center">
              <div className="h-16 w-16 rounded-full bg-white/20 flex items-center justify-center mb-4">
                <Play className="h-8 w-8 text-white" />
              </div>

              {/* Loading progress bar */}
              <div className="w-32 bg-gray-700 rounded-full h-1.5 mb-1">
                <div
                  className="bg-white h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${loadingProgress}%` }}
                ></div>
              </div>
              <p className="text-white text-xs">Loading {loadingProgress}%</p>
            </div>
          </div>
        ) : (
          // Video player
          <video
            ref={videoRef}
            className="h-full w-full object-cover"
            loop
            playsInline
            poster={video.thumbnailUrl}
            onError={handleVideoError}
            preload={isPreloaded ? "auto" : "metadata"}
          >
            <source src={video.videoUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        )}
      </div>

      {/* Preloaded indicator - for debugging only, remove in production */}
      {isPreloaded && (
        <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full z-10">
          Preloaded
        </div>
      )}

      {/* Overlay content */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="flex h-full">
          {/* Video info */}
          <div className="flex-1 flex flex-col justify-end p-4 pointer-events-auto">
            {/* Username and description */}
            <div className="mb-4">
              <div className="flex items-center mb-2">
                <span className="text-white font-semibold">{video.user.username}</span>
                {video.user.isVerified && <CheckCircle className="h-4 w-4 ml-1 text-blue-500 fill-blue-500" />}
              </div>
              <p className="text-white text-sm">{video.description}</p>
              <div className="flex items-center mt-2">
                <Music2 className="h-4 w-4 text-white mr-2" />
                <p className="text-white text-xs">{video.audio}</p>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="w-16 flex flex-col items-center justify-end pb-8 pointer-events-auto">
            {/* Profile picture */}
            <div className="mb-5">
              <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white">
                <img
                  src={video.user.avatar || "/placeholder.svg"}
                  alt="User profile"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Like button */}
            <div className="flex flex-col items-center mb-4">
              <button
                onClick={toggleLike}
                className="w-10 h-10 rounded-full bg-gray-800/50 flex items-center justify-center"
              >
                <Heart className={cn("h-6 w-6", isLiked ? "text-red-500 fill-red-500" : "text-white")} />
              </button>
              <span className="text-white text-xs mt-1">{video.likes}</span>
            </div>

            {/* Comment button */}
            <div className="flex flex-col items-center mb-4">
              <button
                onClick={openComments}
                className="w-10 h-10 rounded-full bg-gray-800/50 flex items-center justify-center"
              >
                <MessageCircle className="h-6 w-6 text-white" />
              </button>
              <span className="text-white text-xs mt-1">{video.comments}</span>
            </div>

            {/* Share button */}
            <div className="flex flex-col items-center mb-4">
              <button className="w-10 h-10 rounded-full bg-gray-800/50 flex items-center justify-center">
                <Share2 className="h-6 w-6 text-white" />
              </button>
              <span className="text-white text-xs mt-1">{video.shares}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Comments section */}
      <CommentsSection videoId={video.id} isOpen={isCommentsOpen} onClose={closeComments} />
    </div>
  )
}
