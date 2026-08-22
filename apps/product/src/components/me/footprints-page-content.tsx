"use client";

import { useMyFutureLetters } from "@daodao/api";
import { useState } from "react";
import { FutureLetterDialog, FutureLetterTimeline } from "@/components/future-letter";
import { FootprintsList } from "@/components/me/footprints-list";

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
      <div className="mx-auto mt-10 max-w-[448px]">
        <FootprintsList />
      </div>
    </>
  );
}
