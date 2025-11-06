import type { Comment } from "@/lib/types"
import { formatDate } from "@/lib/utils"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface CommentListProps {
  comments: Comment[]
}

export default function CommentList({ comments }: CommentListProps) {
  if (comments.length === 0) {
    return <p className="text-sm text-muted-foreground">No comments yet</p>
  }

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium">Comments ({comments.length})</h4>
      <ul className="space-y-3">
        {comments.map((comment) => (
          <li key={comment.id} className="text-sm">
            <div className="flex items-start gap-2">
              <Avatar className="h-6 w-6">
                <AvatarFallback className="text-xs">{comment.username.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="font-semibold">{comment.username}</span>
                  <span className="text-xs text-muted-foreground">{formatDate(comment.timestamp)}</span>
                </div>
                <p className="mt-1">{comment.content}</p>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
