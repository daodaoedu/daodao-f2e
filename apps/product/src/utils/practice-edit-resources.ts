import type { ManualPracticeFormValues } from "@/components/practice/create/manual/schema";

type FormResource = NonNullable<ManualPracticeFormValues["resources"]>[number];

interface ApiPracticeResource {
  id: string;
  name: string;
  url?: string | null;
  dayNumber?: number | null;
  isLocked?: boolean;
  relevantDate?: string | null;
}

/**
 * 編輯頁載入資源：dayNumber 要帶進表單。server 存檔時會整批重建資源關聯，
 * 表單沒帶天數的資源會被清成「整段期間」（daodao#332）。
 */
export const toEditFormResources = (resources: ApiPracticeResource[]): FormResource[] =>
  resources.map((resource) => ({
    id: resource.id,
    persistedId: resource.id,
    name: resource.name,
    url: resource.url || "",
    isLocked: resource.isLocked === true,
    dayNumber: resource.dayNumber ?? null,
    ...(resource.isLocked ? { relevantDate: resource.relevantDate ?? null } : {}),
  }));

/**
 * 個人資源帶 persisted ID 後，省略日期代表沿用，因此整段期間必須明確送 null。
 * 教練鎖定資源沿用省略日期的相容契約，使用 relevantDate 保留活動日期。
 */
export const toUpdateResourcesPayload = (resources: FormResource[]) =>
  resources.map((resource) => ({
    name: resource.name,
    url: resource.url || undefined,
    ...(resource.persistedId ? { id: resource.persistedId } : {}),
    ...(resource.isLocked ? { id: resource.id, relevantDate: resource.relevantDate ?? null } : {}),
    ...(!resource.isLocked || resource.dayNumber != null
      ? { dayNumber: resource.dayNumber ?? null }
      : {}),
  }));
