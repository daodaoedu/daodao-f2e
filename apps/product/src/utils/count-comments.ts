import {
  type ApiCommentNode,
  isApiCommentNode,
} from "@/components/check-in/display/check-in-detail";

export function countTotalComments(comments: ApiCommentNode[]): number {
  return comments.reduce((total, comment) => {
    let replyCount = 0;
    if (Array.isArray(comment.replies)) {
      for (const reply of comment.replies) {
        if (isApiCommentNode(reply)) {
          replyCount++;
        }
      }
    }
    return total + 1 + replyCount;
  }, 0);
}
