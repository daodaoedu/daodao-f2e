"use client";

import { createContext, useContext, useId, useState } from "react";
import useSWR from "swr";
import {
  advanceFeatureFlagSelection,
  getFeatureFlags,
  getFeatureFlagsQueryKey,
  resolveFeatureFlags,
} from "./feature-flags";

/** AuthProvider supplies a fresh identity for each verified authentication session. */
export const FeatureFlagSessionContext = createContext<string | null>(null);

/** Effective server decisions only: consumers never infer stage or organization eligibility. */
export const useFeatureFlags = (organizationId?: number) => {
  const session = useContext(FeatureFlagSessionContext);
  const instanceId = useId();
  const [selection, setSelection] = useState({ session, organizationId, revision: 0 });
  const currentSelection = advanceFeatureFlagSelection(selection, session, organizationId);
  // Adjust during render so no stale organization snapshot can commit before an effect runs.
  if (currentSelection !== selection) setSelection(currentSelection);
  const contextKey = getFeatureFlagsQueryKey(session, organizationId);
  const key = contextKey ? [...contextKey, instanceId, currentSelection.revision] : null;
  const query = useSWR(
    key,
    async () => {
      const response = await getFeatureFlags(organizationId);
      if (response.error) throw response.error;
      return response.data;
    },
    { revalidateOnFocus: true, keepPreviousData: false, revalidateOnMount: true }
  );
  return resolveFeatureFlags(query.data?.data, !key || query.isLoading || Boolean(query.error));
};

export const useFeatureFlag = (key: string, organizationId?: number): boolean =>
  useFeatureFlags(organizationId)[key] === true;
