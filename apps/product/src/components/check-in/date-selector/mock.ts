import { MoodType } from "@/constants/mood";
import type { ICheckInDisplayData } from "../types";

export const mockCheckIns: Record<string, ICheckInDisplayData> = {
  "1": {
    id: "1",
    date: "2026.01.01",
    mood: MoodType.neutral,
    content:
      "Today I practiced...\nOne new concept I learned was...\nThe podcast host mentioned...\nSomething interesting happened during the process.",
    tags: ["new concept", "interesting"],
    images: [
      "https://placehold.co/600x400",
      "https://placehold.co/600x399",
      "https://placehold.co/600x398",
    ],
    practiceTitle: "Learning Vibe coding",
  },
  "3": {
    id: "3",
    date: "2026.01.03",
    mood: MoodType.bored,
    content: "Today I mainly practiced Vibe coding.",
    tags: ["inspired"],
    practiceTitle: "Learning Vibe coding",
  },
  "4": {
    id: "4",
    date: "2026.01.04",
    mood: MoodType.fine,
    content: "Today I mainly practiced Vibe coding.",
    tags: ["new concept"],
    practiceTitle: "Learning Vibe coding",
  },
};
