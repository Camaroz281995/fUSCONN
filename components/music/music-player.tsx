"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Volume2, VolumeX, Play, Pause, Music, SkipForward, AlertCircle } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Alert, AlertDescription } from "@/components/ui/alert"

// Using reliable audio sources from SoundHelix (free for non-commercial use)
const MUSIC_TRACKS = [
  {
    id: "track-1",
    name: "Ambient Piano",
    artist: "SoundHelix",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
  },
  {
    id: "track-2",
    name: "Gentle Melody",
    artist: "SoundHelix",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
  },
  {
    id: "track-3",
    name: "Relaxing Rhythm",
    artist: "SoundHelix",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
  },
]

export default function MusicPlayer() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState(0.5)
  const [isMuted, setIsMuted] = useState(false)
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0)
  const [showControls, setShowControls] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const animationRef = useRef<number | null>(null)

  // Initialize audio element
  useEffect(() => {
    const audio = new Audio()
    audio.preload = "metadata"
    audio.volume = volume

    // Set up event listeners
    audio.addEventListener("timeupdate", updateProgress)
    audio.addEventListener("loadedmetadata", () => {
      setDuration(audio.duration)
      setLoading(false)
    })
    audio.addEventListener("ended", () => {
      setIsPlaying(false)
      setCurrentTime(0)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    })
    audio.addEventListener("error", (e) => {
      console.error("Audio error:", e)
      setError("Unable to play this track. Please try another one.")
      setIsPlaying(false)
      setLoading(false)
    })

    audioRef.current = audio

    // Clean up on unmount
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.src = ""
        audioRef.current.removeEventListener("timeupdate", updateProgress)
        audioRef.current.removeEventListener("loadedmetadata", () => {})
        audioRef.current.removeEventListener("ended", () => {})
        audioRef.current.removeEventListener("error", () => {})
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])

  // Update track when currentTrackIndex changes
  useEffect(() => {
    if (!audioRef.current) return

    const audio = audioRef.current
    const wasPlaying = !audio.paused

    // Reset state
    setError(null)
    setLoading(true)
    setCurrentTime(0)
    setDuration(0)

    // Update source
    audio.src = MUSIC_TRACKS[currentTrackIndex].url

    // If it was playing, try to play the new track
    if (wasPlaying) {
      playAudio()
    }
  }, [currentTrackIndex])

  const updateProgress = () => {
    if (!audioRef.current) return

    setCurrentTime(audioRef.current.currentTime)

    if (isPlaying) {
      animationRef.current = requestAnimationFrame(updateProgress)
    }
  }

  const playAudio = () => {
    if (!audioRef.current) return

    setError(null)
    setLoading(true)

    const playPromise = audioRef.current.play()

    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          setIsPlaying(true)
          setLoading(false)
          animationRef.current = requestAnimationFrame(updateProgress)
        })
        .catch((err) => {
          console.error("Play error:", err)
          setError("Couldn't play audio. Try clicking play again.")
          setIsPlaying(false)
          setLoading(false)
        })
    }
  }

  const pauseAudio = () => {
    if (!audioRef.current) return

    audioRef.current.pause()
    setIsPlaying(false)

    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
    }
  }

  const togglePlay = () => {
    if (isPlaying) {
      pauseAudio()
    } else {
      playAudio()
    }
  }

  const toggleMute = () => {
    if (!audioRef.current) return

    const newMutedState = !isMuted
    audioRef.current.muted = newMutedState
    setIsMuted(newMutedState)
  }

  const handleVolumeChange = (value: number[]) => {
    if (!audioRef.current) return

    const newVolume = value[0]
    audioRef.current.volume = newVolume
    setVolume(newVolume)

    if (newVolume === 0) {
      audioRef.current.muted = true
      setIsMuted(true)
    } else if (isMuted) {
      audioRef.current.muted = false
      setIsMuted(false)
    }
  }

  const handleSeek = (value: number[]) => {
    if (!audioRef.current) return

    const newTime = value[0]
    audioRef.current.currentTime = newTime
    setCurrentTime(newTime)
  }

  const nextTrack = () => {
    setCurrentTrackIndex((prev) => (prev + 1) % MUSIC_TRACKS.length)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10 rounded-full shadow-md bg-background"
              onClick={() => setShowControls(!showControls)}
            >
              <Music className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left">
            <p>Background Music</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {showControls && (
        <div className="absolute bottom-12 right-0 p-3 rounded-lg shadow-lg bg-background border w-80">
          <div className="flex flex-col gap-1 mb-3">
            <div className="text-sm font-medium">{MUSIC_TRACKS[currentTrackIndex].name}</div>
            <div className="text-xs text-muted-foreground">{MUSIC_TRACKS[currentTrackIndex].artist}</div>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-3">
              <AlertCircle className="h-4 w-4 mr-2" />
              <AlertDescription className="text-xs">{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex items-center gap-2 mb-3">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={togglePlay} disabled={loading}>
              {loading ? (
                <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              ) : isPlaying ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
            </Button>

            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={toggleMute}>
              {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </Button>

            <Slider
              value={[isMuted ? 0 : volume]}
              max={1}
              step={0.01}
              onValueChange={handleVolumeChange}
              className="w-24"
            />
          </div>

          {/* Progress bar */}
          <div className="space-y-1 mb-3">
            <Slider
              value={[currentTime]}
              max={duration || 100}
              step={0.1}
              onValueChange={handleSeek}
              disabled={duration === 0}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">
              Track {currentTrackIndex + 1}/{MUSIC_TRACKS.length}
            </span>
            <Button variant="ghost" size="sm" onClick={nextTrack}>
              <SkipForward className="h-4 w-4 mr-1" />
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
