import { Card, CardContent } from "@/components/ui/card"
import VideoPlayer from "@/components/video/video-player"
import { formatDate } from "@/lib/utils"
import type { UserVideo } from "@/lib/types"

interface VideoListProps {
  videos: UserVideo[]
  loading: boolean
}

export default function VideoList({ videos = [], loading }: VideoListProps) {
  if (loading) {
    return <div className="text-center py-8">Loading videos...</div>
  }

  if (!videos || videos.length === 0) {
    return <div className="text-center py-8">No videos uploaded yet</div>
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {videos.map((video) => (
        <Card key={video.id} className="overflow-hidden">
          <VideoPlayer url={video.url} />
          <CardContent className="p-3">
            <h3 className="font-medium truncate">{video.title}</h3>
            <p className="text-xs text-muted-foreground mb-1">{formatDate(video.timestamp)}</p>
            {video.description && <p className="text-sm text-muted-foreground line-clamp-2">{video.description}</p>}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
