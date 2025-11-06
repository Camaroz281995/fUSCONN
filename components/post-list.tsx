import type { Post } from "@/lib/types"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import CommentForm from "@/components/comment-form"
import CommentList from "@/components/comment-list"
import { formatDate } from "@/lib/utils"

interface PostListProps {
  posts: Post[]
  onCommentAdded: () => void
}

export default function PostList({ posts, onCommentAdded }: PostListProps) {
  if (!posts || posts.length === 0) {
    return <div className="text-center py-8">No posts yet. Be the first to post!</div>
  }

  return (
    <div className="space-y-6">
      {posts.map((post) => (
        <Card key={post.id} className="overflow-hidden">
          <CardHeader className="bg-muted/50 pb-2">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold">{post.username}</h3>
                <p className="text-xs text-muted-foreground">{formatDate(post.timestamp)}</p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-4 pb-2">
            <p className="whitespace-pre-wrap">{post.content}</p>
          </CardContent>

          <CardFooter className="flex flex-col items-stretch p-0">
            <div className="border-t p-4">
              <CommentList comments={post.comments || []} />
            </div>

            <div className="border-t p-4">
              <CommentForm postId={post.id} onCommentAdded={onCommentAdded} />
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
