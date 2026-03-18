"use client";
import useSWR from "swr";
import { unauthorizedHandler } from "../client";
import { getRequiredEnv } from "@daodao/config";

export interface IFootprintItem {
  id: number;
  content: string;
  createdAt: string;
  practiceId: string;
  practiceTitle: string;
  practiceDeleted: boolean;
}

interface IFootprintsResponse {
  data: IFootprintItem[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    hasNextPage: boolean;
  };
}

const getMyFootprints = async (page = 1, limit = 20): Promise<IFootprintsResponse> => {
  const baseUrl = getRequiredEnv("NEXT_PUBLIC_API_URL");
  const res = await unauthorizedHandler.wrapFetch(
    `${baseUrl}/api/v1/me/footprints?page=${page}&limit=${limit}`
  );
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message ?? "載入足跡失敗");
  }
  return res.json() as Promise<IFootprintsResponse>;
};

export const useMyFootprints = (page = 1) => {
  return useSWR(
    ["/api/v1/me/footprints", page],
    () => getMyFootprints(page),
    { revalidateOnFocus: false }
  );
};
