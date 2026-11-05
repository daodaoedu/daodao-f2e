"use client";

import { client } from "../client";
import type { paths } from "../types";

type AcceptResponseType =
  paths["/api/v1/lighthouse/organization-invitations/accept"]["post"]["responses"][200]["content"]["application/json"];
export type OrganizationInvitationAcceptResultType = AcceptResponseType["data"];

/** Accept only after an explicit recipient action; the server verifies the logged-in identity. */
export const acceptOrganizationInvitation = (token: string) =>
  client.POST("/api/v1/lighthouse/organization-invitations/accept", { body: { token } });
