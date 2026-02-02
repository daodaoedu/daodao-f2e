"use client";

import { Link } from "../i18n/navigation";
import { useNavigationBlocker } from "../lib/navigation-blocker";

export type CustomLinkProps = React.ComponentProps<typeof Link>;

export function CustomLink({
  children,
  href,
  prefetch = false,
  onNavigate,
  ...props
}: CustomLinkProps) {
  const { isBlocked } = useNavigationBlocker();

  const handleNavigate: CustomLinkProps["onNavigate"] = (e) => {
    if (
      isBlocked &&
      // eslint-disable-next-line no-alert
      !window.confirm("You have unsaved changes. Leave anyway?")
    ) {
      e.preventDefault();
      return;
    }
    onNavigate?.(e);
  };

  return (
    <Link href={href} prefetch={prefetch} onNavigate={handleNavigate} {...props}>
      {children}
    </Link>
  );
}
