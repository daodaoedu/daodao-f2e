"use client";

import { usePracticeById, usePracticeCheckIns, useUpdatePracticeCheckIn } from "@daodao/api";
import { Deco4Svg } from "@daodao/assets";
import { useParams } from "@daodao/i18n/navigation";
import { toast } from "@daodao/ui/components/sonner";
import { addDays, format, isValid, parse } from "date-fns";
import { useMemo } from "react";
import { CheckInButton, CheckInDateSelector, CheckInDetail } from "@/components/check-in";
import type { ICheckInDisplayData, ICheckInFormData } from "@/components/check-in/types";
import { PageHeader } from "@/components/layout";
import { mapApiMoodToMoodType, mapMoodTypeToApiMood } from "@/constants/mood";

/**
 * 將 API 的 checkinDate 格式轉換為顯示格式
 * 從 "2024-01-20" 轉換為 "2024.01.20"
 */
const formatCheckInDate = (checkinDate: string): string => {
  const date = parse(checkinDate, "yyyy-MM-dd", new Date());
  if (!isValid(date)) {
    return checkinDate.replace(/-/g, ".");
  }
  return format(date, "yyyy.MM.dd");
};

/**
 * 生成完整的日期列表（從開始日期到結束日期）
 */
const generateFullDateRange = (
  startDate: string,
  durationDays: number,
  checkInsMap: Map<string, string>
): Array<{ id: string; date: string; hasCheckIn: boolean }> => {
  const start = parse(startDate, "yyyy-MM-dd", new Date());
  if (!isValid(start)) {
    return [];
  }

  const dates: Array<{ id: string; date: string; hasCheckIn: boolean }> = [];

  for (let i = 0; i < durationDays; i++) {
    const currentDate = addDays(start, i);
    const dateString = format(currentDate, "yyyy-MM-dd");
    const checkInId = checkInsMap.get(dateString);

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

  // 獲取 practice 資料
  const { data: practiceData, isLoading: isLoadingPractice } = usePracticeById(practiceId);

  // 更新打卡記錄
  const { updateCheckIn } = useUpdatePracticeCheckIn(practiceId, checkInId);

  // 獲取所有 check-ins
  const { data: checkInsData, isLoading: isLoadingCheckIns } = usePracticeCheckIns(practiceId, {
    limit: 30,
  });

  // 將 API 的 check-ins 轉換為 ICheckInDisplayData 格式
  const checkInsMap = useMemo(() => {
    const map = new Map<string, ICheckInDisplayData>();

    if (!checkInsData?.data || !practiceData?.data) {
      return map;
    }

    checkInsData.data.forEach((checkIn) => {
      const moodType = mapApiMoodToMoodType(checkIn.mood);
      if (!moodType) {
        return;
      }

      const displayData: ICheckInDisplayData = {
        id: String(checkIn.id),
        date: formatCheckInDate(checkIn.checkinDate),
        mood: moodType,
        content: checkIn.note || "",
        // @TODO: 後續再處理 tags
        tags: [],
        images: checkIn.imageUrls || [],
        practiceTitle: practiceData.data.title,
      };

      map.set(String(checkIn.id), displayData);
    });

    return map;
  }, [checkInsData, practiceData]);

  // 建立日期到 check-in ID 的映射（用於生成日期列表）
  const checkInDateToIdMap = useMemo(() => {
    const map = new Map<string, string>();

    if (!checkInsData?.data) {
      return map;
    }

    checkInsData.data.forEach((checkIn) => {
      map.set(checkIn.checkinDate, String(checkIn.id));
    });

    return map;
  }, [checkInsData]);

  // 建立 check-in ID 到時間戳的映射（用於 lastCheckInDate 的 24 小時冷卻判斷）
  const checkInIdToDateMap = useMemo(() => {
    const map = new Map<string, string>();

    if (!checkInsData?.data) {
      return map;
    }

    checkInsData.data.forEach((checkIn) => {
      map.set(String(checkIn.id), checkIn.createdAt);
    });

    return map;
  }, [checkInsData]);

  // 獲取目標 check-in 資料
  const checkInData = useMemo(() => {
    return checkInsMap.get(checkInId) || null;
  }, [checkInsMap, checkInId]);

  // 生成完整的日期列表（包含空缺的日期）
  const fullCheckInDates = useMemo(() => {
    if (!practiceData?.data) {
      return [];
    }

    return generateFullDateRange(
      practiceData.data.startDate || "",
      practiceData.data.durationDays || 0,
      checkInDateToIdMap
    );
  }, [practiceData, checkInDateToIdMap]);

  // 將 check-ins 轉換為 Record 格式供 CheckInDateSelector 使用
  const checkInsRecord = useMemo(() => {
    const record: Record<string, ICheckInDisplayData> = {};
    checkInsMap.forEach((value, key) => {
      record[key] = value;
    });
    return record;
  }, [checkInsMap]);

  // Loading 狀態
  if (isLoadingPractice || isLoadingCheckIns) {
    return (
      <div className="relative w-screen min-h-screen z-10 overflow-hidden overflow-y-auto bg-logo-cyan">
        <Deco4Svg className="absolute top-0 right-0 -z-10" width={270} height={484} />
        <PageHeader
          title="打卡紀錄"
          rightActionTo={`/practices/${practiceId}`}
          variant="light"
          disableLightOn="mobile"
        />
        <main className="max-w-[448px] mx-auto pt-[88px] md:pt-[72px] px-5 pb-40">
          <div className="text-center text-white">載入中...</div>
        </main>
      </div>
    );
  }

  // Error 或找不到 check-in 的狀態
  if (!checkInData || !practiceData?.data) {
    return (
      <div className="relative w-screen min-h-screen z-10 overflow-hidden overflow-y-auto bg-logo-cyan">
        <Deco4Svg className="absolute top-0 right-0 -z-10" width={270} height={484} />
        <PageHeader
          title="打卡紀錄"
          rightActionTo={`/practices/${practiceId}`}
          variant="light"
          disableLightOn="mobile"
        />
        <main className="max-w-[448px] mx-auto pt-[88px] md:pt-[72px] px-5 pb-40">
          <div className="text-center text-white">找不到打卡記錄</div>
        </main>
      </div>
    );
  }

  const handleCheckInComplete = (data: unknown) => {
    // TODO: 處理打卡資料
    console.log("打卡資料:", data);
  };

  const handleEditComplete = async (data: ICheckInFormData) => {
    try {
      const apiMood = mapMoodTypeToApiMood(data.mood);
      await updateCheckIn({
        mood: apiMood,
        tags: data.tags,
        description: data.description,
        media: data.media,
      });
      toast.success("打卡已更新");
    } catch (error) {
      console.error("更新打卡失敗:", error);
      toast.error("更新打卡失敗，請稍後再試");
      throw error;
    }
  };

  return (
    <div className="relative w-screen min-h-screen z-10 overflow-hidden overflow-y-auto bg-logo-cyan">
      <Deco4Svg className="absolute top-0 right-0 -z-10" width={270} height={484} />

      {/* 日期選擇器 */}
      <CheckInDateSelector
        checkInDates={fullCheckInDates}
        checkIns={checkInsRecord}
        activeCheckInId={checkInId}
        practiceId={practiceId}
      />

      <PageHeader
        title="打卡紀錄"
        rightActionTo={`/practices/${practiceId}`}
        variant="light"
        disableLightOn="mobile"
      />

      <main className="max-w-[448px] mx-auto pt-[88px] md:pt-[72px] px-5 pb-40">
        <CheckInDetail checkInData={checkInData} onEditComplete={handleEditComplete} />
      </main>

      <footer className="fixed bottom-0 left-0 right-0 flex justify-center gap-6 p-6 border-t border-light-gray bg-very-light-gray z-20">
        {/* 打卡按鈕 */}
        <CheckInButton
          variant="orange"
          className="w-full sm:max-w-[288px]"
          practiceId={practiceId}
          practiceStatus={practiceData?.data?.status}
          lastCheckInDate={checkInIdToDateMap.get(checkInId) || null}
          startDate={practiceData?.data?.startDate || null}
          taskTitle={checkInData.practiceTitle}
          onComplete={handleCheckInComplete}
          progressPercentage={practiceData?.data?.progressPercentage ?? 0}
        />
      </footer>
    </div>
  );
}
