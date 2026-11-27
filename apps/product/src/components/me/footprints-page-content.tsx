"use client";

import { useFeatureFlags, useMyFutureLetters } from "@daodao/api";
import { useState } from "react";
import { FutureLetterDialog, FutureLetterTimeline } from "@/components/future-letter";

export function FootprintsPageContent() {
  const flags = useFeatureFlags();
  if (!flags.futureLetterEntry) {
    return <FutureLetterTimeline onWriteLetter={() => {}} />;
  }
  return <FootprintsWithLetterComposition />;
}

function FootprintsWithLetterComposition() {
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
        futureLetterEntryEnabled
        onWriteLetter={openNewLetter}
        isWriteLetterDisabled={isDraftQueryPending}
        refreshToken={timelineVersion}
        draft={draft}
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
