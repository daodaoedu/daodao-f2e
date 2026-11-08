"use client";

import {
  acceptOrganizationInvitation,
  type OrganizationInvitationAcceptResultType,
} from "@daodao/api";
import { useAuth } from "@daodao/auth";
import { useLocale, useTranslations } from "@daodao/i18n";
import { Link } from "@daodao/i18n/navigation";
import { Button } from "@daodao/ui/components/button";
import { Building2, CheckCircle2, Clock3, Link2Off } from "lucide-react";
import { useRef, useState } from "react";
import { useLogoutAndRedirect } from "@/hooks/use-logout-redirect";
import { parseServerError } from "@/lib/server-error/server-error-message";
import { useServerErrorMessage } from "@/lib/server-error/use-server-error-message";

const InvitationStatus = {
  accepted: "accepted",
  needsConfirmation: "needs_confirmation",
  expired: "expired",
  revoked: "revoked",
  used: "used",
  invalid: "invalid",
} as const;

export function OrganizationInvitationPage({ token }: { token: string }) {
  return <InvitationContent key={token} token={token} />;
}

function InvitationContent({ token }: { token: string }) {
  const t = useTranslations("lighthouse.organization_invitation");
  const locale = useLocale();
  const { isAuthenticated, isLoading, isTemporary, openLoginDialog } = useAuth();
  const { errorMessage } = useServerErrorMessage();
  const [result, setResult] = useState<OrganizationInvitationAcceptResultType | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needsLogin, setNeedsLogin] = useState(false);
  const submitting = useRef(false);
  const returnPath = `${locale === "en" ? "/en" : ""}/organization-invitation`;

  const logoutAndRedirect = useLogoutAndRedirect(returnPath);

  async function accept() {
    if (submitting.current || !isAuthenticated || isTemporary || !token) return;
    submitting.current = true;
    setBusy(true);
    setError(null);
    try {
      const response = await acceptOrganizationInvitation(token);
      if (response.error) {
        if (response.response.status === 401) setNeedsLogin(true);
        setError(errorMessage(response.error, t("error"), { status: response.response.status }));
        return;
      }
      setResult(response.data.data);
    } catch (caught) {
      if (parseServerError(caught).status === 401) setNeedsLogin(true);
      setError(errorMessage(caught, t("error")));
    } finally {
      submitting.current = false;
      setBusy(false);
    }
  }

  const status = token ? result?.status : InvitationStatus.invalid;
  const isAccepted = status === InvitationStatus.accepted;
  const isWaiting = status === InvitationStatus.needsConfirmation;
  const isFinished = status !== undefined;
  let Icon = Building2;
  if (isAccepted) Icon = CheckCircle2;
  else if (isWaiting) Icon = Clock3;
  else if (isFinished) Icon = Link2Off;

  let title = t("title");
  let description = t("description");
  if (isFinished) {
    title = t(`${status}.title`);
    description = t(`${status}.description`);
  }

  return (
    <main className="flex min-h-dvh items-center justify-center bg-very-light-gray px-5 py-12 text-text-dark">
      <section
        className="w-full max-w-lg rounded-3xl border border-light-gray bg-white p-6 shadow-sm sm:p-10"
        aria-labelledby="invitation-title"
      >
        <div className="mb-6 flex size-14 items-center justify-center rounded-full bg-very-light-gray text-logo-cyan">
          <Icon className="size-7" aria-hidden="true" />
        </div>
        <p className="mb-2 text-sm font-medium text-logo-cyan">{t("eyebrow")}</p>
        <div aria-live="polite">
          <h1 id="invitation-title" className="text-2xl font-semibold leading-tight">
            {title}
          </h1>
          {isAccepted && result?.organizationName && (
            <p className="mt-3 break-words font-medium">{result.organizationName}</p>
          )}
          <p className="mt-4 text-base leading-relaxed text-basic-400">{description}</p>
        </div>
        {!isFinished && (
          <p className="mt-4 text-sm leading-relaxed text-basic-400">{t("email_hint")}</p>
        )}
        {error && (
          <p className="mt-5 text-sm text-alert" role="alert">
            {error}
          </p>
        )}
        <div className="mt-8">
          {isLoading && <output className="text-sm">{t("loading")}</output>}
          {!isLoading && !isFinished && (!isAuthenticated || needsLogin) && (
            <Button
              className="w-full"
              size="huge"
              onClick={async () => {
                if (needsLogin) {
                  await logoutAndRedirect();
                  return;
                }
                openLoginDialog({ redirectUrl: returnPath, source: "app" });
              }}
            >
              {t("login")}
            </Button>
          )}
          {!isLoading && !isFinished && isAuthenticated && !isTemporary && !needsLogin && (
            <Button
              className="w-full"
              size="huge"
              onClick={accept}
              disabled={busy}
              aria-busy={busy}
            >
              {busy ? t("accepting") : t("accept")}
            </Button>
          )}
          {isAccepted && (
            <Button asChild className="w-full" size="huge">
              <Link href="/lighthouse">{t("open_lighthouse")}</Link>
            </Button>
          )}
          {isFinished && !isAccepted && (
            <Button asChild variant="outline" className="w-full">
              <Link href="/">{t("home")}</Link>
            </Button>
          )}
        </div>
      </section>
    </main>
  );
}
