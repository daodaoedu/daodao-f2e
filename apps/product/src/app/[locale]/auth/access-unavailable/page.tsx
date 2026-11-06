"use client";

import { getSafeLoginRedirect } from "@daodao/auth/lib/safe-redirect";
import { useTranslations } from "@daodao/i18n";
import { Button } from "@daodao/ui/components/button";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

/** A temporary session lookup failure offers retry instead of asking an existing user to log in. */
export default function PrivateAccessUnavailablePage() {
  const t = useTranslations("auth.privateAccessUnavailable");
  const searchParams = useSearchParams();
  const destination = getSafeLoginRedirect(searchParams.get("redirect"));
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-4 px-5 py-12">
      <h1 className="text-xl font-semibold text-text-dark">{t("title")}</h1>
      <p className="text-text-gray">{t("description")}</p>
      <Button asChild variant="orange">
        <Link href={destination} prefetch={false}>
          {t("retry")}
        </Link>
      </Button>
    </main>
  );
}
