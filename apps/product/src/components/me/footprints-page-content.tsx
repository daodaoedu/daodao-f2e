"use client";

import { useMyFutureLetters } from "@daodao/api";
import { useState } from "react";
import { FutureLetterDialog, FutureLetterTimeline } from "@/components/future-letter";

export function FootprintsPageContent() {
  const [isLetterDialogOpen, setIsLetterDialogOpen] = useState(false);
  const [timelineVersion, setTimelineVersion] = useState(0);
  const draftsQuery = useMyFutureLetters({ status: "draft", limit: 1 });
  const draft = draftsQuery.data?.data?.[0] ?? null;
  const isDraftQueryPending = draftsQuery.isLoading || draftsQuery.isValidating;

  const openNewLetter = () => {
    if (isDraftQueryPending) return;
    setIsLetterDialogOpen(true);
  };

  return (
    <>
      <FutureLetterTimeline
        onWriteLetter={openNewLetter}
        isWriteLetterDisabled={isDraftQueryPending}
        refreshToken={timelineVersion}
      />
      <FutureLetterDialog
        open={isLetterDialogOpen}
        onOpenChange={setIsLetterDialogOpen}
        initialLetter={draft}
        onSaved={async () => {
          await draftsQuery.mutate();
          setTimelineVersion((version) => version + 1);
        }}
      />
    </>
  );
}
