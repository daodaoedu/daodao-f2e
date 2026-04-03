"use client";

import { useState } from "react";

export interface MentionCandidate {
  userId: string;
  numericUserId?: number;
  name: string;
  photoURL?: string;
  customId?: string | null;
}

/**
 * Hook for managing @mention state in a comment input.
 *
 * - tracks which users have been selected via the mention dropdown (mentionedIds map)
 * - filters only mentions that are still present in the final content on submit
 */
export function useMentionInput() {
  const [mentionedIds, setMentionedIds] = useState<Map<number, string>>(new Map());

  /** Call this when the user selects a candidate from the mention dropdown */
  const handleMentionSelect = (candidate: MentionCandidate) => {
    if (!candidate.numericUserId) return;
    setMentionedIds((prev) => {
      const next = new Map(prev);
      next.set(candidate.numericUserId as number, candidate.customId || candidate.name);
      return next;
    });
  };

  /**
   * Returns only the numeric user IDs whose @handle is still present in content.
   * Uses word-boundary detection: @handle must be followed by end-of-string,
   * whitespace, or non-word character (prevents @alice matching @alicebob).
   * Call this right before submitting a comment.
   */
  const getActiveMentionIds = (content: string): number[] => {
    return [...mentionedIds.entries()]
      .filter(([, handle]) => {
        const pattern = new RegExp(
          `@${handle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?=[\\s,!?.。、]|$)`
        );
        return pattern.test(content);
      })
      .map(([id]) => id);
  };

  /** Reset state after a comment is submitted */
  const reset = () => setMentionedIds(new Map());

  return { mentionedIds, handleMentionSelect, getActiveMentionIds, reset };
}
