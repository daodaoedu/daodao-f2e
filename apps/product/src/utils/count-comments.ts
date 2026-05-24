interface CommentLike {
  id: number | string;
  replies?: unknown[];
}

function isCommentLike(v: unknown): v is CommentLike {
  return typeof v === "object" && v !== null && "id" in v;
}

export function countTotalComments(comments: CommentLike[]): number {
  return comments.reduce((total, comment) => {
    const replies = Array.isArray(comment.replies)
      ? comment.replies.filter(isCommentLike).length
      : 0;
    return total + 1 + replies;
  }, 0);
}
