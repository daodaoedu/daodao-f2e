"use client";

export {
  MOCK_PRACTICE,
  MOCK_CHECK_INS_DATA,
  MOCK_INITIAL_REACTIONS,
  TOTAL_COMMENT_COUNT,
} from "./_components/practice-detail";

import { PracticeDetail } from "./_components/practice-detail";

export default function ReactDemoPage() {
  return <PracticeDetail isOwner />;
}
