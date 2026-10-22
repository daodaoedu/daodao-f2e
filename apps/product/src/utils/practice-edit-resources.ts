import type { ManualPracticeFormValues } from "@/components/practice/create/manual/schema";

type FormResource = NonNullable<ManualPracticeFormValues["resources"]>[number];

interface ApiPracticeResource {
  id: string;
  name: string;
  url?: string | null;
  dayNumber?: number | null;
  isLocked?: boolean;
}

/**
 * 編輯頁載入資源：dayNumber 要帶進表單。server 存檔時會整批重建資源關聯，
 * 表單沒帶天數的資源會被清成「整段期間」（daodao#332）。
 */
export const toEditFormResources = (resources: ApiPracticeResource[]): FormResource[] =>
  resources.map((resource) => ({
    id: resource.id,
    name: resource.name,
    url: resource.url || "",
    isLocked: resource.isLocked === true,
    dayNumber: resource.dayNumber ?? null,
  }));

/**
 * 編輯頁送出資源：有天數才帶 dayNumber。沒天數時不帶，server 對教練鎖定資源維持寬鬆比對
 * （見 daodao-server coach-resource-lock 的 lenient 模式）。
 */
export const toUpdateResourcesPayload = (resources: FormResource[]) =>
  resources.map((resource) => ({
    name: resource.name,
    url: resource.url || undefined,
    ...(resource.dayNumber != null ? { dayNumber: resource.dayNumber } : {}),
  }));
