import {
  ArrowLeft,
  BarChart3,
  Bell,
  BookOpen,
  Bot,
  Brain,
  Building2,
  Calendar,
  ChevronDown,
  ClipboardList,
  Cpu,
  FileText,
  Flag,
  Folder,
  HelpCircle,
  Inbox,
  LayoutDashboard,
  LineChart,
  List,
  ListTodo,
  LogOut,
  Mail,
  Medal,
  Menu,
  MessageSquare,
  Monitor,
  Settings,
  Shield,
  Sparkles,
  Target,
  TrendingUp,
  Trophy,
  UserCog,
  UserPlus,
  Users,
  X,
  Zap,
} from "lucide-react";
import { type ReactNode, useCallback, useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/auth/AuthContext";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface NavItem {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    title: "總覽",
    items: [{ to: "/dashboard", label: "Dashboard", icon: LayoutDashboard }],
  },
  {
    title: "用戶",
    items: [
      { to: "/user-management", label: "用戶管理", icon: UserCog },
      { to: "/organizations", label: "組織設定", icon: Building2 },
      { to: "/user-analytics", label: "用戶分析", icon: TrendingUp },
      { to: "/user-tags", label: "用戶標籤", icon: Users },
      { to: "/roles-permissions", label: "角色權限", icon: Shield },
      { to: "/user-quotas", label: "Token 配額", icon: Users },
    ],
  },
  {
    title: "AI 服務",
    items: [
      { to: "/query-logs", label: "查詢日誌", icon: List },
      { to: "/models", label: "模型管理", icon: Cpu },
      { to: "/system-prompts", label: "System Prompts", icon: FileText },
      { to: "/ai-configs", label: "服務設定", icon: Settings },
      { to: "/playground", label: "Playground", icon: MessageSquare },
    ],
  },
  {
    title: "內容",
    items: [
      { to: "/content-performance", label: "內容分析", icon: TrendingUp },
      { to: "/practices", label: "主題實踐", icon: Target },
      { to: "/feed-ranking", label: "Feed 演算法", icon: Settings },
    ],
  },
  {
    title: "共同挑戰",
    items: [
      { to: "/group-challenges", label: "挑戰管理", icon: Flag },
      { to: "/inspiration-decks", label: "靈感卡卡組", icon: Sparkles },
    ],
  },
  {
    title: "人物誌管理",
    items: [
      { to: "/persona-questions", label: "人物誌題目管理", icon: Brain },
      { to: "/persona-status", label: "人物誌填寫統計", icon: ClipboardList },
    ],
  },
  {
    title: "社群",
    items: [
      { to: "/onboarding-flows", label: "Onboarding", icon: UserPlus },
      { to: "/community-map", label: "社群地圖", icon: Users },
      { to: "/ai-assistant", label: "AI 助手", icon: Bot },
    ],
  },
  {
    title: "信件",
    items: [
      { to: "/email-management", label: "信件管理", icon: Mail },
      { to: "/email-templates", label: "模板管理", icon: FileText },
      { to: "/triggered-emails", label: "觸發式郵件", icon: Zap },
    ],
  },
  {
    title: "許願池",
    items: [
      { to: "/wishes", label: "許願池", icon: Inbox },
      { to: "/roadmap-items", label: "路線圖項目", icon: ListTodo },
      { to: "/roadmap-reports", label: "許願池報表", icon: LineChart },
    ],
  },
  {
    title: "問卷",
    items: [{ to: "/surveys", label: "問卷管理", icon: ClipboardList }],
  },
  {
    title: "溝通",
    items: [{ to: "/notifications", label: "站內通知", icon: Bell }],
  },
  {
    title: "報表",
    items: [
      { to: "/scheduled-reports", label: "排程報表", icon: FileText },
      { to: "/custom-reports", label: "自訂報表", icon: BarChart3 },
      { to: "/anomaly-alerts", label: "異常警報", icon: Monitor },
    ],
  },
  {
    title: "支援",
    items: [
      { to: "/feedback", label: "意見回饋", icon: MessageSquare },
      { to: "/faq", label: "FAQ 管理", icon: HelpCircle },
    ],
  },
  {
    title: "系統",
    items: [
      { to: "/system-monitor", label: "系統監控", icon: Monitor },
      { to: "/audit-log", label: "審計日誌", icon: Folder },
    ],
  },
  {
    title: "信任與審核",
    items: [
      { to: "/trust-levels", label: "信任等級", icon: Shield },
      { to: "/automod", label: "AutoMod", icon: Bot },
    ],
  },
  {
    title: "活動",
    items: [{ to: "/events", label: "活動管理", icon: Calendar }],
  },
  {
    title: "學習",
    items: [
      { to: "/learning-progress", label: "課程進度", icon: BookOpen },
      { to: "/drip-content", label: "內容滴灌", icon: BookOpen },
      { to: "/quizzes", label: "測驗管理", icon: BookOpen },
      { to: "/certificates", label: "證書管理", icon: Medal },
      { to: "/learning-paths", label: "學習路徑", icon: BookOpen },
    ],
  },
  {
    title: "遊戲化",
    items: [
      { to: "/badges", label: "徽章", icon: Trophy },
      { to: "/challenges", label: "挑戰", icon: Target },
      { to: "/leaderboards", label: "排行榜", icon: BarChart3 },
    ],
  },
];

const STORAGE_KEY = "admin-sidebar-collapsed";

function getInitialCollapsed(): Record<string, boolean> {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return {};
}

function SidebarGroup({
  group,
  collapsed,
  onToggle,
  onNavigate,
}: {
  group: NavGroup;
  collapsed: boolean;
  onToggle: () => void;
  onNavigate?: () => void;
}) {
  const location = useLocation();

  return (
    <div>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={onToggle}
        className="rounded-lg border border-[var(--admin-panel-border)] bg-background/70 p-2.5 shadow-sm w-full justify-between rounded-md border border-transparent px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70 transition-colors hover:border-border hover:text-foreground"
      >
        {group.title}
        <ChevronDown
          className={cn("h-3 w-3 transition-transform duration-200", collapsed && "-rotate-90")}
        />
      </Button>
      <div
        className={cn(
          "mt-0.5 space-y-0.5 overflow-hidden transition-all duration-200",
          collapsed ? "max-h-0 opacity-0" : "max-h-[500px] opacity-100"
        )}
      >
        {group.items.map(({ to, label, icon: Icon }) => {
          const active = location.pathname === to;
          return (
            <Link
              key={to}
              to={to}
              onClick={onNavigate}
              className={cn(
                "rounded-lg border border-[var(--admin-panel-border)] bg-background/70 p-2.5 shadow-sm group relative flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all duration-150",
                active
                  ? "border-primary/35 bg-primary/10 text-primary"
                  : "text-muted-foreground hover:border-border hover:bg-background/90 hover:text-foreground"
              )}
            >
              {active && (
                <span className="absolute inset-y-1 left-0 w-[3px] rounded-full bg-sidebar-primary" />
              )}
              <Icon className={cn("h-4 w-4 shrink-0", active && "text-sidebar-primary")} />
              {label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function SidebarContent({
  onNavigate,
  onClose,
}: {
  onNavigate?: () => void;
  onClose?: () => void;
}) {
  const { adminInfo, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(getInitialCollapsed);

  const toggle = useCallback((title: string) => {
    setCollapsed((prev) => {
      const next = { ...prev, [title]: !prev[title] };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const initials = adminInfo?.nickname ? adminInfo.nickname.slice(0, 2).toUpperCase() : "AD";

  return (
    <>
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b border-sidebar-border/70 px-4 shrink-0">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary-lighter text-sm font-bold text-primary-foreground shadow-sm">
          <span className="text-sm font-bold text-primary-foreground">D</span>
        </div>
        <div className="flex flex-col leading-tight">
          <span className="text-sm font-bold text-foreground">DaoDao Admin</span>
          <span className="text-[10px] text-muted-foreground">管理後台</span>
        </div>
        {onClose && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="ml-auto rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
            title="隱藏側邊欄"
            aria-label="隱藏側邊欄"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-3 scrollbar-hide">
        {navGroups.map((group) => (
          <SidebarGroup
            key={group.title}
            group={group}
            collapsed={!!collapsed[group.title]}
            onToggle={() => toggle(group.title)}
            onNavigate={onNavigate}
          />
        ))}
      </nav>

      {/* User profile */}
      <div className="border-t border-sidebar-border/80 bg-background/50 p-3 shrink-0">
        <div className="flex items-center gap-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
            {initials}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-foreground">
              {adminInfo?.nickname ?? "Admin"}
            </p>
            <p className="truncate text-xs text-muted-foreground">管理員</p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={logout}
            title="登出"
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </>
  );
}

export function Sidebar({ onClose }: { onClose: () => void }) {
  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-72 bg-sidebar/90 lg:backdrop-blur xl:w-80 h-screen sticky top-0 border-r border-sidebar-border/80">
      <SidebarContent onClose={onClose} />
    </aside>
  );
}

export function MobileHeader({
  children,
  showBackButton = false,
  onBack,
}: {
  children?: ReactNode;
  showBackButton?: boolean;
  onBack?: () => void;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [open]);

  return (
    <>
      <header className="flex lg:hidden h-14 items-center gap-3 border-b border-border bg-background px-4">
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => setOpen(true)}
          className="text-foreground"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <div className="flex shrink-0 items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
            <span className="text-xs font-bold text-primary-foreground">D</span>
          </div>
          <span className="text-sm font-bold text-foreground">DaoDao Admin</span>
        </div>
        {showBackButton && (
          <Button
            type="button"
            size="icon"
            variant="ghost"
            onClick={onBack}
            className="ml-auto shrink-0"
            title="返回問卷管理"
            aria-label="返回問卷管理"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
        )}
        {children}
      </header>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close sidebar"
            className="fixed inset-0 bg-black/40 backdrop-blur-sm cursor-default p-0"
            onClick={() => setOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 z-10 flex w-72 flex-col bg-sidebar backdrop-blur-xl animate-in slide-in-from-left duration-200">
            <div className="h-14 border-b border-sidebar-border/70" />
            <div className="absolute right-3 top-3.5 z-10">
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => setOpen(false)}
                className="rounded-md p-1 text-muted-foreground hover:bg-accent"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <SidebarContent onNavigate={() => setOpen(false)} />
          </aside>
        </div>
      )}
    </>
  );
}
