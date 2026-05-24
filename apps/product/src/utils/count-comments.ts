interface CommentLike {
  id: number | string;
  replies?: unknown[];
}

function isCommentLike(v: unknown): v is CommentLike {
  return typeof v === "object" && v !== null && "id" in v;
}

export function countTotalComments(comments: CommentLike[]): number {
  return comments.reduce((total, comment) => {
    let replyCount = 0;
    if (Array.isArray(comment.replies)) {
      for (const reply of comment.replies) {
        if (isCommentLike(reply)) {
          replyCount++;
        }
      }
    }
    return total + 1 + replyCount;
  }, 0);
}
