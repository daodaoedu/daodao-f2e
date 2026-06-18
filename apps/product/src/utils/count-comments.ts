type CommentLike = {
  id: number | string;
  replies?: unknown[];
};

function isCommentLike(v: unknown): v is CommentLike {
  return typeof v === "object" && v !== null && "id" in v;
}

export function countCommentsWithReplies(raw: unknown): number {
  if (!Array.isArray(raw)) return 0;
  const topLevel = raw.filter(isCommentLike);
  const replyCount = topLevel.reduce((sum, c) => {
    const replies = Array.isArray(c.replies) ? c.replies : [];
    return sum + replies.filter(isCommentLike).length;
  }, 0);
  return topLevel.length + replyCount;
}
