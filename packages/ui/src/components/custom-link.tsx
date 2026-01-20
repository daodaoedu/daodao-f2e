"use client";

import { Link, useRouter } from "@daodao/i18n/navigation";
import { useNavigationBlocker } from "../hooks/navigation-blocker";
import { useUnsavedChangesConfirm } from "../hooks/use-unsaved-changes-confirm";

export type CustomLinkProps = React.ComponentProps<typeof Link>;

export function CustomLink({
  children,
  href,
  prefetch = false,
  onNavigate,
  ...props
}: CustomLinkProps) {
  const { isBlocked } = useNavigationBlocker();
  const confirmUnsavedChanges = useUnsavedChangesConfirm();
  const router = useRouter();

  const handleNavigate: CustomLinkProps["onNavigate"] = async (e) => {
    if (isBlocked) {
      e.preventDefault();
      const shouldLeave = await confirmUnsavedChanges();
      if (shouldLeave) {
        // 使用 router 來導航，router.push 接受與 Link href 相同的型別
        router.push(href as Parameters<typeof router.push>[0]);
      }
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
