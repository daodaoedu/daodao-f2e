"use client";

import { useMemo } from "react";
import type { z } from "zod";
import { EMPTY_QUERY_INIT, useQuery } from "../hooks";
import {
  cohortJoinInfoResponseSchema,
  cohortMemberHomeResponseSchema,
  learnerCohortFeedResponseSchema,
  myCohortsResponseSchema,
  lighthouseCoachFeedResponseSchema,
  lighthouseCohortEnrollmentsResponseSchema,
  lighthouseCohortListResponseSchema,
  lighthouseCohortMembersResponseSchema,
  lighthouseCohortResponseSchema,
  lighthouseDashboardResponseSchema,
  lighthouseFocusResponseSchema,
  lighthouseOrganizationListResponseSchema,
  lighthouseOrganizationMembersResponseSchema,
  lighthouseOrganizationResponseSchema,
  lighthouseOutcomeResponseSchema,
  lighthouseProgramListResponseSchema,
  lighthouseTemplatesResponseSchema,
} from "./cohort";

function useValidatedResponse<TQuery extends { data?: unknown }, TSchema extends z.ZodTypeAny>(
  query: TQuery,
  schema: TSchema
): Omit<TQuery, "data"> & {
  data: z.output<TSchema> | undefined;
  validationError: z.ZodError | undefined;
} {
  const parsed = useMemo(
    () => (query.data ? schema.safeParse(query.data) : null),
    [query.data, schema]
  );
  return {
    ...query,
    data: parsed?.success ? (parsed.data as z.output<TSchema>) : undefined,
    validationError: parsed && !parsed.success ? parsed.error : undefined,
  };
}

export const useLighthouseOrganizations = () => {
  const query = useQuery("/api/v1/lighthouse/organizations", EMPTY_QUERY_INIT);
  const validated = useValidatedResponse(query, lighthouseOrganizationListResponseSchema);
  return {
    ...validated,
    organizations: validated.data?.data,
  };
};

export const useLighthousePrograms = (organizationId?: number) => {
  const query = useQuery(
    "/api/v1/lighthouse/programs",
    organizationId ? { params: { query: { organizationId } } } : null
  );
  const validated = useValidatedResponse(query, lighthouseProgramListResponseSchema);
  return {
    ...validated,
    programs: validated.data?.data,
  };
};

export const useLighthouseCohorts = (programId?: number) => {
  const query = useQuery(
    "/api/v1/lighthouse/programs/{programId}/cohorts",
    programId ? { params: { path: { programId } } } : null
  );
  const validated = useValidatedResponse(query, lighthouseCohortListResponseSchema);
  return {
    ...validated,
    cohorts: validated.data?.data,
  };
};

export const useLighthouseCohort = (programId?: number, cohortId?: number) => {
  const query = useQuery(
    "/api/v1/lighthouse/programs/{programId}/cohorts/{cohortId}",
    programId && cohortId ? { params: { path: { programId, cohortId } } } : null
  );
  return useValidatedResponse(query, lighthouseCohortResponseSchema);
};

export const useLighthouseCohortMembers = (programId?: number, cohortId?: number) => {
  const query = useQuery(
    "/api/v1/lighthouse/programs/{programId}/cohorts/{cohortId}/members",
    programId && cohortId ? { params: { path: { programId, cohortId } } } : null
  );
  return useValidatedResponse(query, lighthouseCohortMembersResponseSchema);
};

export const useLighthouseCohortEnrollments = (programId?: number, cohortId?: number) => {
  const query = useQuery(
    "/api/v1/lighthouse/programs/{programId}/cohorts/{cohortId}/enrollments",
    programId && cohortId ? { params: { path: { programId, cohortId } } } : null
  );
  return useValidatedResponse(query, lighthouseCohortEnrollmentsResponseSchema);
};

export const useLighthouseDashboard = (programId?: number, cohortId?: number) => {
  const query = useQuery(
    "/api/v1/lighthouse/programs/{programId}/cohorts/{cohortId}/dashboard",
    programId && cohortId ? { params: { path: { programId, cohortId } } } : null
  );
  return useValidatedResponse(query, lighthouseDashboardResponseSchema);
};

export const useLighthouseFocus = (programId?: number, cohortId?: number) => {
  const query = useQuery(
    "/api/v1/lighthouse/programs/{programId}/cohorts/{cohortId}/focus",
    programId && cohortId ? { params: { path: { programId, cohortId } } } : null
  );
  return useValidatedResponse(query, lighthouseFocusResponseSchema);
};

export const useLighthouseOutcome = (programId?: number, cohortId?: number) => {
  const query = useQuery(
    "/api/v1/lighthouse/programs/{programId}/cohorts/{cohortId}/outcome",
    programId && cohortId ? { params: { path: { programId, cohortId } } } : null
  );
  return useValidatedResponse(query, lighthouseOutcomeResponseSchema);
};

export const useLighthouseCoachFeed = (programId?: number, cohortId?: number) => {
  const query = useQuery(
    "/api/v1/lighthouse/programs/{programId}/cohorts/{cohortId}/feed",
    programId && cohortId
      ? { params: { path: { programId, cohortId }, query: { limit: 50 } } }
      : null
  );
  return useValidatedResponse(query, lighthouseCoachFeedResponseSchema);
};

export const useLighthouseOrganization = (organizationId?: number) => {
  const query = useQuery(
    "/api/v1/lighthouse/organizations/{organizationId}",
    organizationId ? { params: { path: { organizationId } } } : null
  );
  return useValidatedResponse(query, lighthouseOrganizationResponseSchema);
};

export const useLighthouseOrganizationMembers = (organizationId?: number) => {
  const query = useQuery(
    "/api/v1/lighthouse/organizations/{organizationId}/members",
    organizationId ? { params: { path: { organizationId } } } : null
  );
  return useValidatedResponse(query, lighthouseOrganizationMembersResponseSchema);
};

export const useLighthouseTemplates = (organizationId?: number) => {
  const query = useQuery(
    "/api/v1/lighthouse/organizations/{organizationId}/templates",
    organizationId ? { params: { path: { organizationId } } } : null
  );
  return useValidatedResponse(query, lighthouseTemplatesResponseSchema);
};

export const useMyCohorts = () => {
  const query = useQuery("/api/v1/me/cohorts", EMPTY_QUERY_INIT);
  return useValidatedResponse(query, myCohortsResponseSchema);
};

export const useCohortJoinInfo = (joinToken: string) => {
  const query = useQuery("/api/v1/cohorts/join/{joinToken}", {
    params: { path: { joinToken } },
  });
  return useValidatedResponse(query, cohortJoinInfoResponseSchema);
};

export const useCohortMemberHome = (cohortId: number) => {
  const query = useQuery("/api/v1/cohorts/{cohortId}", { params: { path: { cohortId } } });
  return useValidatedResponse(query, cohortMemberHomeResponseSchema);
};

export const useLearnerCohortFeed = (cohortId: number) => {
  const query = useQuery("/api/v1/cohorts/{cohortId}/feed", {
    params: { path: { cohortId }, query: { limit: 50 } },
  });
  return useValidatedResponse(query, learnerCohortFeedResponseSchema);
};
