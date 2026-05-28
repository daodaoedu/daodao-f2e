"use client";

import {
  addSupport,
  getRoadmapItems,
  type RoadmapCategory,
  type RoadmapItemPublic,
  type RoadmapStats,
  usePublicWishes,
  useRoadmapItems,
  useRoadmapStats,
  useToggleSupport,
} from "@daodao/api";
import { useAuth } from "@daodao/auth";
import { useLocale, useTranslations } from "@daodao/i18n";
import { useRouter } from "@daodao/i18n/navigation";
import { Button } from "@daodao/ui/components/button";
import { toast } from "@daodao/ui/components/sonner";
import { Tabs, TabsList, TabsTrigger } from "@daodao/ui/components/tabs";
import { cn } from "@daodao/ui/lib/utils";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { BOARD_TABS, type BoardTab, categoryKey, ROADMAP_CATEGORIES, tabKey } from "./constants";
import { GuestGuidedState } from "./guest-guided-state";
import { RoadmapHero } from "./roadmap-hero";
import { RoadmapItemCard } from "./roadmap-item-card";
import { WishWizardModal } from "./wish-wizard-modal";

type BoardTabValue = BoardTab;

interface RoadmapBoardProps {
  initialStats: RoadmapStats | null;
  initialItems: RoadmapItemPublic[];
  initialNextCursor: string | null;
}

const ROADMAP_PATH = "/roadmap";
const ROADMAP_PATH_WITH_LOCALE = {
  "zh-TW": ROADMAP_PATH,
  en: "/en/roadmap",
} as const;

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
  const isWishTab = tab === "wishes";
  const isAllTab = tab === "all";

  const { data: statsData } = useRoadmapStats();
  const stats = statsData?.data ?? initialStats;

  // 預設視圖以 SSR 結果作為初始資料，避免首屏閃爍（見下方 page1Items）
  const roadmapTab = isWishTab ? undefined : tab;
  const { data, isLoading, error, mutate } = useRoadmapItems({ status: roadmapTab, category });
  const {
    data: wishData,
    isLoading: isWishesLoading,
    error: wishError,
    mutate: mutateWishes,
  } = usePublicWishes(
    { status: "pending", category, limit: 20 },
    { enabled: isAllTab || isWishTab }
  );

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

  const roadmapItems = data?.data ?? (isDefaultView ? initialItems : []);
  const baseNextCursor = data?.pagination?.nextCursor ?? (isDefaultView ? initialNextCursor : null);
  // 合併分頁結果並依 external_id 去重（page1 重新驗證後游標窗口位移可能與追加頁重疊）
  const dedup = (items: RoadmapItemPublic[]) => {
    const seen = new Set<string>();
    return items.filter((it) => {
      if (seen.has(it.external_id)) return false;
      seen.add(it.external_id);
      return true;
    });
  };
  const mergedRoadmapItems = dedup([...roadmapItems, ...extraPages.flat()]);
  const wishItems = wishData?.data ?? [];
  const allItems = dedup([...mergedRoadmapItems, ...wishItems]);
  const effectiveCursor = extraPages.length === 0 ? baseNextCursor : moreCursor;

  const loadMore = async () => {
    if (isWishTab) return;
    if (!effectiveCursor || loadingMore) return;
    setLoadingMore(true);
    try {
      const res = await getRoadmapItems({ status: roadmapTab, category, cursor: effectiveCursor });
      if (res.error || !res.data) {
        toast.error(t("toast_vote_failed"));
        return;
      }
      const body = res.data;
      setExtraPages((p) => [...p, body.data]);
      setMoreCursor(body.pagination?.nextCursor ?? null);
    } catch {
      toast.error(t("toast_vote_failed"));
    } finally {
      setLoadingMore(false);
    }
  };

  const { toggle } = useToggleSupport();

  const displayedItems = isWishTab ? wishItems : isAllTab ? allItems : mergedRoadmapItems;
  const isListLoading = isWishTab
    ? isWishesLoading
    : isAllTab
      ? isLoading || isWishesLoading
      : isLoading;
  const listError = isWishTab ? wishError : isAllTab ? (error ?? wishError) : error;
  const showEmpty = !isListLoading && displayedItems.length === 0;

  // 登入後返回需帶 locale 前綴（OAuth state 以原始 window 導向，非 locale-aware）
  const localizedRoadmap =
    ROADMAP_PATH_WITH_LOCALE[locale as keyof typeof ROADMAP_PATH_WITH_LOCALE] ?? ROADMAP_PATH;
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
      router.replace(localizedRoadmap);
      return;
    }

    if (intent?.startsWith("vote:")) {
      // 等 auth 解析完再決定，避免在 isAuthenticated 仍為 false 時誤判而提早 strip intent
      if (authLoading) return;
      restoredRef.current = true;
      const externalId = intent.slice("vote:".length);
      if (isAuthenticated) {
        void addSupport(externalId)
          .then((res) => {
            if (res.error) {
              toast.error(t("toast_vote_failed"));
            } else {
              void mutate();
            }
          })
          .catch(() => {
            toast.error(t("toast_vote_failed"));
          })
          .finally(() => router.replace(localizedRoadmap));
      } else {
        router.replace(localizedRoadmap);
      }
    }
  }, [searchParams, isAuthenticated, authLoading, router, mutate, localizedRoadmap, t]);

  const onTabChange = useCallback((value: string) => {
    setTab(value as BoardTabValue);
  }, []);

  const handleWishCreated = () => {
    void mutate();
    void mutateWishes();
  };

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
          <Button
            type="button"
            size="sm"
            variant={category === undefined ? "default" : "outline"}
            onClick={() => setCategory(undefined)}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm",
              category !== undefined ? "border-[#C1ECFF] text-text-dark" : ""
            )}
          >
            {t("tab_all")}
          </Button>
          {ROADMAP_CATEGORIES.map((c) => (
            <Button
              key={c}
              type="button"
              onClick={() => setCategory((prev) => (prev === c ? undefined : c))}
              size="sm"
              variant={category === c ? "default" : "outline"}
              className={cn(
                "rounded-full px-4 py-1.5 text-sm",
                category !== c ? "border-[#C1ECFF] text-text-dark" : ""
              )}
            >
              {t(categoryKey(c))}
            </Button>
          ))}
        </div>

        {/* 看板項目 */}
        <div className="mt-6 grid gap-4">
          {listError && displayedItems.length === 0 ? (
            <p className="py-10 text-center text-red">{t("load_failed")}</p>
          ) : isListLoading && displayedItems.length === 0 ? (
            <p className="py-10 text-center text-light-gray">{t("loading")}</p>
          ) : showEmpty ? (
            <div className="rounded-2xl border border-dashed border-light-gray/50 px-6 py-12 text-center">
              <p className="font-medium text-text-dark">{t("empty_title")}</p>
              <p className="mt-1 text-sm text-light-gray">{t("empty_desc")}</p>
            </div>
          ) : (
            displayedItems.map((item) => (
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

        {tab !== "wishes" && effectiveCursor ? (
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
        onCreated={handleWishCreated}
      />
    </div>
  );
}
