"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Play, Pause, SkipForward, SkipBack, Volume2, Music } from "lucide-react"

export default function MusicTab() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTrack, setCurrentTrack] = useState("No track selected")
  const [volume, setVolume] = useState([70])
  const [progress, setProgress] = useState([0])

  const demoTracks = [
    "Relaxing Piano Music",
    "Nature Sounds",
    "Lo-Fi Hip Hop",
    "Ambient Soundscape",
    "Meditation Music",
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Music className="h-5 w-5 mr-2" />
          Music Player
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Now Playing */}
        <div className="text-center">
          <div className="w-32 h-32 bg-muted rounded-lg mx-auto mb-4 flex items-center justify-center">
            <Music className="h-12 w-12 text-muted-foreground" />
          </div>
          <h3 className="font-medium">{currentTrack}</h3>
          <p className="text-sm text-muted-foreground">Demo Artist</p>
        </div>

        {/* Controls */}
        <div className="flex justify-center items-center gap-4">
          <Button variant="ghost" size="icon">
            <SkipBack className="h-5 w-5" />
          </Button>
          <Button size="icon" onClick={() => setIsPlaying(!isPlaying)}>
            {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
          </Button>
          <Button variant="ghost" size="icon">
            <SkipForward className="h-5 w-5" />
          </Button>
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <Slider value={progress} onValueChange={setProgress} max={100} step={1} className="w-full" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>0:00</span>
            <span>3:45</span>
          </div>
        </div>

        {/* Volume */}
        <div className="flex items-center gap-2">
          <Volume2 className="h-4 w-4" />
          <Slider value={volume} onValueChange={setVolume} max={100} step={1} className="flex-1" />
          <span className="text-sm text-muted-foreground w-8">{volume[0]}%</span>
        </div>

        {/* Track List */}
        <div className="space-y-2">
          <h4 className="font-medium">Demo Tracks</h4>
          <div className="space-y-1">
            {demoTracks.map((track, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 hover:bg-muted/50 rounded-md cursor-pointer"
                onClick={() => setCurrentTrack(track)}
              >
                <span className="text-sm">{track}</span>
                <Button variant="ghost" size="sm">
                  <Play className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
