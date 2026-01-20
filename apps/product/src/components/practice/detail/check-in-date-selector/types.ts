import type { MoodType } from "@/constants/mood";

export interface CheckInDate {
  id: string;
  date: string;
  hasCheckIn?: boolean;
}

export interface CheckInData {
  id: string;
  date: string;
  mood: MoodType;
  content: string;
  tags: string[];
  images?: string[];
  practiceTitle: string;
}

export interface CheckInDateSelectorProps {
  checkInDates: CheckInDate[];
  checkIns: Record<string, CheckInData>;
  practiceId: string;
  activeCheckInId: string;
}
