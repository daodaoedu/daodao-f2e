"use client";

/** Space SWR hooks for client components (issue #151 空間頁面). */

import { useQuery } from "../hooks";

export const useMySpaces = () => useQuery("/api/v1/spaces", {}, { revalidateOnFocus: false });

export const useSpaceDetail = (id: string | undefined) =>
  useQuery("/api/v1/spaces/{id}", id ? { params: { path: { id } } } : null, {
    revalidateOnFocus: false,
  });

export const useSpaceMembers = (id: string | undefined) =>
  useQuery("/api/v1/spaces/{id}/members", id ? { params: { path: { id } } } : null, {
    revalidateOnFocus: false,
  });

export const useSpacePractices = (id: string | undefined) =>
  useQuery("/api/v1/spaces/{id}/practices", id ? { params: { path: { id } } } : null, {
    revalidateOnFocus: false,
  });

export const useSpaceHomePage = (id: string | undefined) =>
  useQuery("/api/v1/spaces/{id}/home-page", id ? { params: { path: { id } } } : null, {
    revalidateOnFocus: false,
  });

export const usePublicSpace = (token: string | undefined) =>
  useQuery("/api/v1/spaces/public/{token}", token ? { params: { path: { token } } } : null, {
    revalidateOnFocus: false,
  });
