import type { Metadata } from "next";
import { cookies } from "next/headers";
import { OrganizationInvitationPage } from "@/components/organization-invitation/organization-invitation-page";
import { ORGANIZATION_INVITATION_COOKIE } from "@/lib/organization-invitation-token";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

export default async function Page() {
  const cookieStore = await cookies();
  return (
    <OrganizationInvitationPage
      token={cookieStore.get(ORGANIZATION_INVITATION_COOKIE)?.value ?? ""}
    />
  );
}
