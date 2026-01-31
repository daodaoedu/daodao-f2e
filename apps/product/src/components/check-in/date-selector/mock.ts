import { MoodType } from "@/constants/mood";
import type { ICheckInDisplayData } from "../types";

// 模擬資料 - 之後替換為實際 API 資料
export const mockCheckIns: Record<string, ICheckInDisplayData> = {
  "1": {
    id: "1",
    date: "2026.01.01",
    mood: MoodType.neutral,
    content:
      "今天我主要練習了…\n我學到的一個新概念是新概念是\nPodcast裡面主持人提到\n過程中發生了一件有趣的事，就是過程中發生了一件有趣的",
    tags: ["新概念", "有趣"],
    images: [
      "https://placehold.co/600x400",
      "https://placehold.co/600x399",
      "https://placehold.co/600x398",
    ],
    practiceTitle: "學習 Vibe coding",
  },
  "3": {
    id: "3",
    date: "2026.01.03",
    mood: MoodType.bored,
    content: "今天我主要練習了學習 Vibe coding 文字文字文字文字文字文字。",
    tags: ["受啟發"],
    practiceTitle: "學習 Vibe coding",
  },
  "4": {
    id: "4",
    date: "2026.01.04",
    mood: MoodType.fine,
    content: "今天我主要練習了學習 Vibe coding 文字文字文字文字文字文字。",
    tags: ["新概念"],
    practiceTitle: "學習 Vibe coding",
  },
};
