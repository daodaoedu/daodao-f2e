"use client";

import { useAuthContext } from "@daodao/auth";
import { useIsMobile } from "@daodao/shared";
import { Image } from "@daodao/ui/components/image";

export function SettingsUserCard() {
  const { user } = useAuthContext();
  const isMobile = useIsMobile();

  if (!isMobile || !user) return null;

  const displayName = user.name || user.email?.split("@")[0] || "";
  const initial = displayName.charAt(0).toUpperCase();
  const email = user.email || "";

  return (
    <div className="flex items-center gap-3 px-3 py-4 mb-4 rounded-xl bg-white">
      {user.photoUrl ? (
        <Image
          src={user.photoUrl}
          alt=""
          width={48}
          height={48}
          className="size-12 rounded-full object-cover shrink-0"
        />
      ) : (
        <span className="flex size-12 items-center justify-center rounded-full bg-logo-cyan text-white text-lg font-semibold shrink-0">
          {initial}
        </span>
      )}
      <div className="min-w-0">
        <p className="text-base font-medium text-text-dark truncate">{displayName}</p>
        {email && <p className="text-sm text-light-gray truncate">{email}</p>}
      </div>
    </div>
  );
}
