"use client";

import {
  addSupport,
  getRoadmapItems,
  type RoadmapCategory,
  type RoadmapItemPublic,
  type RoadmapStats,
  useRoadmapItems,
  useRoadmapStats,
  useToggleSupport,
} from "@daodao/api";
import { useAuth } from "@daodao/auth";
import { useLocale, useTranslations } from "@daodao/i18n";
import { getPathname, useRouter } from "@daodao/i18n/navigation";
import { Badge } from "@daodao/ui/components/badge";
import { Button } from "@daodao/ui/components/button";
import { Tabs, TabsList, TabsTrigger } from "@daodao/ui/components/tabs";
import { cn } from "@daodao/ui/lib/utils";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { BOARD_TABS, categoryKey, ROADMAP_CATEGORIES, tabKey } from "./constants";
import { GuestGuidedState } from "./guest-guided-state";
import { RoadmapHero } from "./roadmap-hero";
import { RoadmapItemCard } from "./roadmap-item-card";
import { WishWizardModal } from "./wish-wizard-modal";

type BoardTabValue = (typeof BOARD_TABS)[number];

interface RoadmapBoardProps {
  initialStats: RoadmapStats | null;
  initialItems: RoadmapItemPublic[];
  initialNextCursor: string | null;
}

const ROADMAP_PATH = "/roadmap";

export function RoadmapBoard({ initialStats, initialItems, initialNextCursor }: RoadmapBoardProps) {
  const t = useTranslations("roadmap");
  const locale = useLocale();
  const { isAuthenticated, isLoading: authLoading, openLoginDialog } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [tab, setTab] = useState<BoardTabValue>("all");
  const [category, setCategory] = useState<RoadmapCategory | undefined>(undefined);
  const [wizardOpen, setWizardOpen] = useState(false);

  const isDefaultView = tab === "all" && category === undefined;

  const { data: statsData } = useRoadmapStats();
  const stats = statsData?.data ?? initialStats;

  // 預設視圖以 SSR 結果作為初始資料，避免首屏閃爍（見下方 page1Items）
  const { data, isLoading, mutate } = useRoadmapItems({ status: tab, category });

  // 載入更多（cursor 分頁，於既有頁面後追加）
  const [extraPages, setExtraPages] = useState<RoadmapItemPublic[][]>([]);
  const [moreCursor, setMoreCursor] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);

  // 切換分頁／分類時重置追加頁（依賴 tab/category 作為重置觸發）
  // biome-ignore lint/correctness/useExhaustiveDependencies: 僅作為過濾條件變更的重置觸發
  useEffect(() => {
    setExtraPages([]);
    setMoreCursor(null);
  }, [tab, category]);

  const page1Items = data?.data ?? (isDefaultView ? initialItems : []);
  const baseNextCursor = data?.pagination?.nextCursor ?? (isDefaultView ? initialNextCursor : null);
  const items = [...page1Items, ...extraPages.flat()];
  const effectiveCursor = extraPages.length === 0 ? baseNextCursor : moreCursor;

  const loadMore = async () => {
    if (!effectiveCursor || loadingMore) return;
    setLoadingMore(true);
    try {
      const res = await getRoadmapItems({ status: tab, category, cursor: effectiveCursor });
      const body = res.data;
      if (body) {
        setExtraPages((p) => [...p, body.data]);
        setMoreCursor(body.pagination?.nextCursor ?? null);
      }
    } finally {
      setLoadingMore(false);
    }
  };

  const { toggle } = useToggleSupport();

  // 登入後返回需帶 locale 前綴（OAuth state 以原始 window 導向，非 locale-aware）
  const localizedRoadmap = getPathname({ href: ROADMAP_PATH, locale });
  const buildReturnTo = (intent?: string) =>
    intent
      ? `${localizedRoadmap}?intent=${encodeURIComponent(intent)}`
      : `${localizedRoadmap}?openWish=1`;

  const handleUnauthVote = (externalId: string) => {
    openLoginDialog({ redirectUrl: buildReturnTo(`vote:${externalId}`) });
  };

  const handleWishCta = () => {
    if (!isAuthenticated) {
      openLoginDialog({ redirectUrl: buildReturnTo() });
      return;
    }
    setWizardOpen(true);
  };

  // ── 登入返回後的 intent / openWish 還原 ─────────────────────────────────────
  const restoredRef = useRef(false);
  useEffect(() => {
    if (restoredRef.current) return;
    const intent = searchParams.get("intent");
    const openWish = searchParams.get("openWish");

    if (openWish === "1") {
      restoredRef.current = true;
      setWizardOpen(true);
      router.replace(ROADMAP_PATH);
      return;
    }

    if (intent?.startsWith("vote:")) {
      // 等 auth 解析完再決定，避免在 isAuthenticated 仍為 false 時誤判而提早 strip intent
      if (authLoading) return;
      restoredRef.current = true;
      const externalId = intent.slice("vote:".length);
      if (isAuthenticated) {
        void addSupport(externalId)
          .then(() => mutate())
          .finally(() => router.replace(ROADMAP_PATH));
      } else {
        router.replace(ROADMAP_PATH);
      }
    }
  }, [searchParams, isAuthenticated, authLoading, router, mutate]);

  const showEmpty = !isLoading && items.length === 0;

  const onTabChange = useCallback((value: string) => {
    setTab(value as BoardTabValue);
  }, []);

  return (
    <div className="min-h-screen bg-basic-white pb-20">
      <RoadmapHero stats={stats} />

      <div className="mx-auto max-w-3xl px-5">
        {/* 狀態分頁 */}
        <Tabs value={tab} onValueChange={onTabChange} className="mt-8">
          <TabsList className="w-full">
            {BOARD_TABS.map((value) => (
              <TabsTrigger key={value} value={value} className="flex-1">
                {t(tabKey(value))}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* 分類過濾 */}
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setCategory(undefined)}
            className={cn(category === undefined && "ring-2 ring-logo-cyan rounded-full")}
          >
            <Badge variant={category === undefined ? "default" : "outline-ghost"} size="sm">
              {t("tab_all")}
            </Badge>
          </button>
          {ROADMAP_CATEGORIES.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCategory((prev) => (prev === c ? undefined : c))}
              className={cn(category === c && "ring-2 ring-logo-cyan rounded-full")}
            >
              <Badge variant={category === c ? "default" : "outline-ghost"} size="sm">
                {t(categoryKey(c))}
              </Badge>
            </button>
          ))}
        </div>

        {/* 看板項目 */}
        <div className="mt-6 grid gap-4">
          {isLoading && items.length === 0 ? (
            <p className="py-10 text-center text-light-gray">{t("loading")}</p>
          ) : showEmpty ? (
            <div className="rounded-2xl border border-dashed border-light-gray/50 px-6 py-12 text-center">
              <p className="font-medium text-text-dark">{t("empty_title")}</p>
              <p className="mt-1 text-sm text-light-gray">{t("empty_desc")}</p>
            </div>
          ) : (
            items.map((item) => (
              <RoadmapItemCard
                key={item.external_id}
                item={item}
                isAuthenticated={isAuthenticated}
                onToggle={toggle}
                onUnauthenticated={handleUnauthVote}
              />
            ))
          )}
        </div>

        {effectiveCursor ? (
          <div className="mt-6 text-center">
            <Button type="button" variant="light" onClick={loadMore} disabled={loadingMore}>
              {loadingMore ? t("loading") : t("load_more")}
            </Button>
          </div>
        ) : null}

        {/* 許願 CTA */}
        <div className="mt-12 flex flex-col items-center gap-2 rounded-2xl bg-light-blue/50 px-6 py-8 text-center">
          <p className="text-sm text-light-gray">{t("wish_cta_sub")}</p>
          <Button type="button" variant="ctaPrimary" size="huge" onClick={handleWishCta}>
            {t("wish_cta")}
          </Button>
        </div>

        {/* 訪客引導（需登入區塊不空白） */}
        {!isAuthenticated ? (
          <div className="mt-10">
            <GuestGuidedState onLogin={() => openLoginDialog({ redirectUrl: localizedRoadmap })} />
          </div>
        ) : null}
      </div>

      <WishWizardModal
        open={wizardOpen}
        onOpenChange={setWizardOpen}
        isAuthenticated={isAuthenticated}
        onRequireLogin={() => {
          setWizardOpen(false);
          openLoginDialog({ redirectUrl: buildReturnTo() });
        }}
      />
    </div>
  );
}
