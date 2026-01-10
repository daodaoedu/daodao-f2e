"use client";

import { Deco4Svg } from "@daodao/assets";
import { useParams } from "@daodao/i18n/navigation";
import { addDays, format, isValid, parse } from "date-fns";
import { useMemo } from "react";
import {
  CheckInButton,
  type CheckInData as CheckInSheetData,
} from "@/components/dashboard";
import { PageHeader } from "@/components/layout";
import {
  CheckInDateSelector,
  type CheckInData,
  CheckInDetail,
} from "@/components/practice/detail";
import { toast } from "@daodao/ui/components/sonner";

// 模擬資料 - 之後替換為實際 API 資料
const mockCheckIns: Record<string, CheckInData> = {
  "1": {
    id: "1",
    date: "2026.01.01",
    mood: "neutral",
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
    mood: "bored",
    content: "今天我主要練習了學習 Vibe coding 文字文字文字文字文字文字。",
    tags: ["受啟發"],
    practiceTitle: "學習 Vibe coding",
  },
  "4": {
    id: "4",
    date: "2026.01.04",
    mood: "fine",
    content: "今天我主要練習了學習 Vibe coding 文字文字文字文字文字文字。",
    tags: ["新概念"],
    practiceTitle: "學習 Vibe coding",
  },
};

// 模擬 practice 資訊 - 之後替換為實際 API 資料
const mockPractice = {
  startDate: "2026-01-01",
  durationDays: 7,
};

/**
 * 生成完整的日期列表（從開始日期到結束日期）
 */
const generateFullDateRange = (
  startDate: string,
  durationDays: number
): Array<{ id: string; date: string; hasCheckIn: boolean }> => {
  const start = parse(startDate, "yyyy-MM-dd", new Date());
  if (!isValid(start)) {
    return [];
  }

  const dates: Array<{ id: string; date: string; hasCheckIn: boolean }> = [];
  const checkInDateMap = new Map(
    Object.values(mockCheckIns).map((checkIn) => [
      checkIn.date.replace(/\./g, "-"),
      checkIn.id,
    ])
  );

  for (let i = 0; i < durationDays; i++) {
    const currentDate = addDays(start, i);
    const dateString = format(currentDate, "yyyy-MM-dd");
    const checkInId = checkInDateMap.get(dateString);

    dates.push({
      id: checkInId || `empty-${dateString}`,
      date: dateString,
      hasCheckIn: !!checkInId,
    });
  }

  return dates;
};

export default function CheckInDetailPage() {
  const params = useParams();
  const practiceId = params.id as string;
  const checkInId = params.checkInId as string;
  const checkInData = mockCheckIns[checkInId];

  // 生成完整的日期列表（包含空缺的日期）
  const fullCheckInDates = useMemo(
    () =>
      generateFullDateRange(mockPractice.startDate, mockPractice.durationDays),
    []
  );

  if (!checkInData) {
    return <div>找不到打卡記錄</div>;
  }

  const handleCheckInComplete = (data: CheckInSheetData) => {
    // TODO: 處理打卡資料
    console.log("打卡資料:", data);
  };

  return (
    <div className="relative w-screen min-h-screen z-10 overflow-hidden overflow-y-auto bg-logo-cyan">
      <Deco4Svg
        className="absolute top-0 right-0 -z-10"
        width={270}
        height={484}
      />

      {/* 日期選擇器 */}
      <CheckInDateSelector
        checkInDates={fullCheckInDates}
        checkIns={mockCheckIns}
        activeCheckInId={checkInId}
        practiceId={practiceId}
      />

      <PageHeader
        leftAction="back"
        backLabel="返回"
        title="打卡紀錄"
        closeTo={`/practices/${practiceId}`}
        variant="light"
        disableLightOn="mobile"
      />

      <main className="max-w-[448px] mx-auto pt-[88px] md:pt-3 px-5 pb-40">
        <CheckInDetail checkInData={checkInData} />
      </main>

      <footer className="fixed bottom-0 left-0 right-0 flex justify-center gap-6 p-6 border-t border-light-gray bg-very-light-gray z-20">
        {/* 打卡按鈕 */}
        <CheckInButton
          variant="orange"
          className="w-full sm:max-w-[288px]"
          taskTitle={checkInData.practiceTitle}
          onComplete={handleCheckInComplete}
        />
      </footer>
    </div>
  );
}
