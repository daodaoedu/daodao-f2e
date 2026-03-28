"use client";

import { useAuth } from "@daodao/auth";
import { Link, usePathname } from "@daodao/i18n/navigation";
import { cn } from "@daodao/ui/lib/utils";
import {
  BarChart3,
  ExternalLink,
  LayoutDashboard,
  Mail,
  Menu,
  Monitor,
  Shield,
  Target,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  { label: "總覽", href: "/admin", icon: LayoutDashboard },
  { label: "使用者", href: "/admin/users", icon: Users },
  { label: "實踐", href: "/admin/practices", icon: Target },
  { label: "郵件", href: "/admin/email", icon: Mail },
  { label: "角色", href: "/admin/roles", icon: Shield },
  { label: "系統", href: "/admin/system", icon: Monitor },
];

function NavContent({ onItemClick }: { onItemClick?: () => void }) {
  const pathname = usePathname();
  const { user } = useAuth();

  const isActive = (href: string) => {
    if (href === "/admin") {
      return pathname === "/admin" || pathname === "/admin/";
    }
    return pathname.startsWith(href);
  };

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-border px-4 py-4">
        <BarChart3 className="size-6 text-primary-base" />
        <span className="text-lg font-semibold">Admin</span>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 space-y-1 p-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onItemClick}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-primary-base/10 text-primary-base"
                  : "text-basic-400 hover:bg-basic-100 hover:text-text-dark"
              )}
            >
              <Icon className="size-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-border p-3">
        <Link
          href="/"
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-basic-400 hover:bg-basic-100 hover:text-text-dark transition-colors"
        >
          <ExternalLink className="size-5" />
          返回前台
        </Link>
        {user && (
          <div className="mt-2 px-3 text-xs text-basic-300 truncate">{user.email || user.name}</div>
        )}
      </div>
    </div>
  );
}

export function AdminSidebar() {
  return (
    <aside className="hidden lg:flex lg:w-60 lg:flex-col lg:border-r lg:border-border bg-white">
      <NavContent />
    </aside>
  );
}

export function AdminMobileHeader() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile top bar */}
      <div className="flex items-center justify-between border-b border-border bg-white px-4 py-3 lg:hidden">
        <div className="flex items-center gap-2">
          <BarChart3 className="size-5 text-primary-base" />
          <span className="font-semibold">Admin</span>
        </div>
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="rounded-lg p-2 hover:bg-basic-100"
        >
          <Menu className="size-5" />
        </button>
      </div>

      {/* Mobile drawer overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* biome-ignore lint/a11y/useKeyWithClickEvents: overlay click to close */}
          {/* biome-ignore lint/a11y/noStaticElementInteractions: overlay click to close */}
          <div className="absolute inset-0 bg-black/40" onClick={() => setIsOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-64 bg-white shadow-xl">
            <div className="absolute top-3 right-3">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-1 hover:bg-basic-100"
              >
                <X className="size-5" />
              </button>
            </div>
            <NavContent onItemClick={() => setIsOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
}
