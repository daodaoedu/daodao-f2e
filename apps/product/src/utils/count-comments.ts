type CommentLike = {
  id: number | string;
  replies?: unknown[];
};

function isCommentLike(v: unknown): v is CommentLike {
  return (
    typeof v === "object" &&
    v !== null &&
    "id" in v &&
    (typeof (v as { id: unknown }).id === "number" ||
      typeof (v as { id: unknown }).id === "string")
  );
}

export function countCommentsWithReplies(raw: unknown): number {
  if (!Array.isArray(raw)) return 0;
  let count = 0;
  for (const c of raw) {
    if (isCommentLike(c)) {
      count++;
      if (Array.isArray(c.replies)) {
        for (const r of c.replies) {
          if (isCommentLike(r)) {
            count++;
          }
        }
      }
    }
  }
  return count;
}
