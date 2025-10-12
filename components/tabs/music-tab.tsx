"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Music,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Repeat,
  Shuffle,
  Heart,
  Search,
  List,
  Radio,
} from "lucide-react"

interface Track {
  id: string
  title: string
  artist: string
  album: string
  duration: number
  url?: string
  isLiked: boolean
}

interface Playlist {
  id: string
  name: string
  tracks: Track[]
  cover?: string
}

export default function MusicTab() {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [volume, setVolume] = useState([75])
  const [isMuted, setIsMuted] = useState(false)
  const [isRepeat, setIsRepeat] = useState(false)
  const [isShuffle, setIsShuffle] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [activeView, setActiveView] = useState<"tracks" | "playlists" | "radio">("tracks")

  const audioRef = useRef<HTMLAudioElement>(null)

  // Demo tracks
  const tracks: Track[] = [
    {
      id: "1",
      title: "Chill Vibes",
      artist: "Relaxing Sounds",
      album: "Ambient Collection",
      duration: 180,
      isLiked: true,
    },
    {
      id: "2",
      title: "Focus Flow",
      artist: "Study Music",
      album: "Concentration",
      duration: 240,
      isLiked: false,
    },
    {
      id: "3",
      title: "Nature Sounds",
      artist: "Environmental Audio",
      album: "Natural Ambience",
      duration: 300,
      isLiked: true,
    },
    {
      id: "4",
      title: "Peaceful Piano",
      artist: "Classical Relaxation",
      album: "Piano Serenity",
      duration: 210,
      isLiked: false,
    },
  ]

  // Demo playlists
  const playlists: Playlist[] = [
    {
      id: "1",
      name: "Chill Mix",
      tracks: tracks.slice(0, 2),
    },
    {
      id: "2",
      name: "Focus Time",
      tracks: tracks.slice(1, 3),
    },
    {
      id: "3",
      name: "Relaxation",
      tracks: tracks.slice(2, 4),
    },
  ]

  const playTrack = (track: Track) => {
    setCurrentTrack(track)
    setIsPlaying(true)
    setCurrentTime(0)
  }

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying)
  }

  const toggleMute = () => {
    setIsMuted(!isMuted)
  }

  const toggleLike = (trackId: string) => {
    console.log(`Toggle like for track ${trackId}`)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const filteredTracks = tracks.filter(
    (track) =>
      track.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      track.artist.toLowerCase().includes(searchTerm.toLowerCase()) ||
      track.album.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const filteredPlaylists = playlists.filter((playlist) =>
    playlist.name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Simulate audio progress
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (isPlaying && currentTrack) {
      interval = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= currentTrack.duration) {
            setIsPlaying(false)
            return 0
          }
          return prev + 1
        })
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isPlaying, currentTrack])

  return (
    <div className="space-y-6">
      {/* Music Player Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Music className="h-5 w-5" />
            Music Player
          </CardTitle>
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search music..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* View Tabs */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-2">
            <Button
              variant={activeView === "tracks" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveView("tracks")}
            >
              <Music className="h-4 w-4 mr-2" />
              Tracks
            </Button>
            <Button
              variant={activeView === "playlists" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveView("playlists")}
            >
              <List className="h-4 w-4 mr-2" />
              Playlists
            </Button>
            <Button
              variant={activeView === "radio" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveView("radio")}
            >
              <Radio className="h-4 w-4 mr-2" />
              Radio
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Music Library */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>
              {activeView === "tracks" ? "Your Music" : activeView === "playlists" ? "Playlists" : "Radio Stations"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px]">
              {activeView === "tracks" && (
                <div className="space-y-2">
                  {filteredTracks.map((track) => (
                    <div
                      key={track.id}
                      className={`flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer ${
                        currentTrack?.id === track.id ? "bg-muted" : ""
                      }`}
                      onClick={() => playTrack(track)}
                    >
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-8 h-8 p-0"
                        onClick={(e) => {
                          e.stopPropagation()
                          if (currentTrack?.id === track.id) {
                            togglePlayPause()
                          } else {
                            playTrack(track)
                          }
                        }}
                      >
                        {isPlaying && currentTrack?.id === track.id ? (
                          <Pause className="h-4 w-4" />
                        ) : (
                          <Play className="h-4 w-4" />
                        )}
                      </Button>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{track.title}</p>
                        <p className="text-sm text-muted-foreground truncate">
                          {track.artist} • {track.album}
                        </p>
                      </div>
                      <span className="text-sm text-muted-foreground">{formatTime(track.duration)}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleLike(track.id)
                        }}
                      >
                        <Heart className={`h-4 w-4 ${track.isLiked ? "fill-red-500 text-red-500" : ""}`} />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {activeView === "playlists" && (
                <div className="space-y-4">
                  {filteredPlaylists.map((playlist) => (
                    <Card key={playlist.id} className="hover:shadow-md transition-shadow cursor-pointer">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center">
                            <Music className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <h3 className="font-semibold">{playlist.name}</h3>
                            <p className="text-sm text-muted-foreground">{playlist.tracks.length} tracks</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {activeView === "radio" && (
                <div className="space-y-4">
                  {["Chill Radio", "Focus Radio", "Nature Sounds", "Classical Radio"].map((station) => (
                    <Card key={station} className="hover:shadow-md transition-shadow cursor-pointer">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-600 rounded-lg flex items-center justify-center">
                            <Radio className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <h3 className="font-semibold">{station}</h3>
                            <p className="text-sm text-muted-foreground">Live streaming</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Now Playing */}
        <Card>
          <CardHeader>
            <CardTitle>Now Playing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {currentTrack ? (
              <>
                {/* Track Info */}
                <div className="text-center space-y-2">
                  <div className="w-32 h-32 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg mx-auto flex items-center justify-center">
                    <Music className="h-12 w-12 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{currentTrack.title}</h3>
                    <p className="text-sm text-muted-foreground">{currentTrack.artist}</p>
                  </div>
                </div>

                {/* Progress */}
                <div className="space-y-2">
                  <Slider
                    value={[currentTime]}
                    max={currentTrack.duration}
                    step={1}
                    className="w-full"
                    onValueChange={(value) => setCurrentTime(value[0])}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(currentTrack.duration)}</span>
                  </div>
                </div>

                {/* Controls */}
                <div className="flex items-center justify-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsShuffle(!isShuffle)}
                    className={isShuffle ? "text-primary" : ""}
                  >
                    <Shuffle className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <SkipBack className="h-4 w-4" />
                  </Button>
                  <Button onClick={togglePlayPause} size="lg" className="rounded-full">
                    {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                  </Button>
                  <Button variant="ghost" size="sm">
                    <SkipForward className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsRepeat(!isRepeat)}
                    className={isRepeat ? "text-primary" : ""}
                  >
                    <Repeat className="h-4 w-4" />
                  </Button>
                </div>

                {/* Volume */}
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={toggleMute}>
                    {isMuted || volume[0] === 0 ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                  </Button>
                  <Slider
                    value={isMuted ? [0] : volume}
                    max={100}
                    step={1}
                    className="flex-1"
                    onValueChange={(value) => {
                      setVolume(value)
                      setIsMuted(value[0] === 0)
                    }}
                  />
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <Music className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Select a track to start playing</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
