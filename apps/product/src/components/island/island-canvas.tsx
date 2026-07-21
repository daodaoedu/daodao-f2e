"use client";

import {
  getUserIsland,
  type IslandDataType,
  useConnections,
  useCurrentUser,
  usePersonaQuestionAnswers,
  usePersonaQuestions,
  useUsers,
} from "@daodao/api";
import { getEnv } from "@daodao/config";
import {
  degradeTier,
  type IIslandData,
  type IIslandDestination,
  IslandEngine,
  MAX_ROUTE_BEACONS,
  QualityTier,
} from "@daodao/features-island-engine";
import { useLocale, useTranslations } from "@daodao/i18n";
import { useRouter } from "@daodao/i18n/navigation";
import { useIsMobile } from "@daodao/shared";
import { Avatar, AvatarFallback, AvatarImage } from "@daodao/ui/components/avatar";
import { Button } from "@daodao/ui/components/button";
import { ArrowLeft, Flame, Sailboat, Sparkles } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { IIslandRouteItem } from "./archipelago-navigator";
import { ArchipelagoNavigator } from "./archipelago-navigator";
import { IslandDiagnostics } from "./island-diagnostics";
import { IslandLoading } from "./island-loading";
import { IslandOwnerPanel } from "./island-owner-panel";
import { PracticeCampCard } from "./practice-camp-card";
import { WebglFallback } from "./webgl-fallback";

/**
 * 3D 島嶼 canvas（tasks 4.2/4.3/4.4）：
 * - 掛載/銷毀 IslandEngine（React 不碰場景物件，只收事件 callback）
 * - WebGL 偵測失敗 → 2D fallback；fps 採樣過低 → 自動降品質
 * - 載入畫面（onWalkable 收掉）、跳過 intro、空島/未測驗 CTA、實踐營火札記
 */

/** fps 低於此門檻觸發降級 */
const DEGRADE_FPS_THRESHOLD = 24;
const DEGRADE_CHECK_INTERVAL_MS = 5000;

const isWebglAvailable = (): boolean => {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") ?? canvas.getContext("webgl"));
  } catch {
    return false;
  }
};

interface IslandCanvasProps {
  islandData: IslandDataType;
  identifier: string;
}

export default function IslandCanvas({ islandData, identifier }: IslandCanvasProps) {
  const t = useTranslations("island");
  const locale = useLocale();
  const router = useRouter();
  const isMobile = useIsMobile();
  const containerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<IslandEngine | null>(null);
  const routesRef = useRef<readonly IIslandRouteItem[]>([]);
  const travelToRef = useRef<(route: IIslandRouteItem) => void | Promise<void>>(() => undefined);
  const selectRouteRef = useRef<(route: IIslandRouteItem) => void>(() => undefined);
  const sailFreelyRef = useRef<() => void | Promise<void>>(() => undefined);
  const selectedRouteRef = useRef<IIslandRouteItem | null>(null);
  const departingRef = useRef(false);
  const arrivalOriginRef = useRef<string | null>(null);
  const [activeIslandData, setActiveIslandData] = useState<IslandDataType>(islandData);
  const [activeIdentifier, setActiveIdentifier] = useState(identifier);
  const [returnRoute, setReturnRoute] = useState<IIslandRouteItem | null>(null);
  const [webglFailed, setWebglFailed] = useState(false);
  // 診斷覆蓋層：網址帶 ?diag=1 才顯示（追 iOS 貼圖全白用，一般使用者看不到）
  const [showDiag, setShowDiag] = useState(false);
  const [walkable, setWalkable] = useState(false);
  const [introPlaying, setIntroPlaying] = useState(true);
  const [selectedPracticeId, setSelectedPracticeId] = useState<string | null>(null);
  const [ownerPanelOpen, setOwnerPanelOpen] = useState(false);
  const [routesOpen, setRoutesOpen] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<IIslandRouteItem | null>(null);
  const [isSailing, setIsSailing] = useState(false);
  const [departingName, setDepartingName] = useState<string | null>(null);
  const { data: currentUserResponse, isLoading: currentUserLoading } = useCurrentUser();
  const { data: connectionsResponse, isLoading: connectionsLoading } = useConnections({
    limit: 100,
  });
  const { data: questionsResponse, isLoading: questionsLoading } = usePersonaQuestions(locale);
  const discoveryQuestionId = questionsResponse?.data?.questions[0]?.id ?? 0;
  const { data: answersResponse, isLoading: answersLoading } = usePersonaQuestionAnswers(
    discoveryQuestionId,
    {
      locale,
      limit: 50,
      enabled: discoveryQuestionId > 0,
    }
  );
  const { data: usersResponse, isLoading: usersLoading } = useUsers({
    page: 1,
    pageSize: 30,
    hasPractices: true,
  });

  // 空島/未測驗 CTA 只給島主本人（訪客不顯示，spec「訪客看空島」）
  const isOwner = activeIslandData.viewerRelation === "self";
  const showEmptyCta = isOwner && activeIslandData.practices.length === 0;
  const showQuizCta = isOwner && !activeIslandData.personaType;
  const connections = useMemo(
    () =>
      (connectionsResponse?.data ?? []).filter(
        (connection) =>
          connection.externalId !== activeIslandData.profile.id &&
          connection.externalId !== activeIslandData.profile.customId
      ),
    [activeIslandData.profile.customId, activeIslandData.profile.id, connectionsResponse]
  );
  const homeRoute = useMemo<IIslandRouteItem | null>(() => {
    const currentUser = currentUserResponse?.data;
    if (!currentUser?.id) return null;

    const homeIdentifiers = new Set(
      [currentUser.id, currentUser.customId].filter(
        (value): value is string => typeof value === "string" && value.length > 0
      )
    );
    const activeIdentifiers = [
      activeIdentifier,
      activeIslandData.profile.id,
      activeIslandData.profile.customId,
    ];
    if (activeIdentifiers.some((value) => value && homeIdentifiers.has(value))) return null;
    const customId =
      typeof currentUser.customId === "string" && currentUser.customId.length > 0
        ? currentUser.customId
        : null;

    return {
      key: `home:${currentUser.id}`,
      identifier: customId ?? currentUser.id,
      name: currentUser.name ?? t("routes_unknown_island"),
      photoUrl: currentUser.photoURL ?? null,
      kind: "home",
    };
  }, [
    activeIdentifier,
    activeIslandData.profile.customId,
    activeIslandData.profile.id,
    currentUserResponse?.data,
    t,
  ]);
  const routes = useMemo<IIslandRouteItem[]>(() => {
    const homeRoutes = homeRoute ? [homeRoute] : [];
    const homeIdentifiers = new Set(
      [
        homeRoute?.identifier,
        currentUserResponse?.data?.id,
        currentUserResponse?.data?.customId,
      ].filter((value): value is string => typeof value === "string" && value.length > 0)
    );
    const returnRoutes =
      returnRoute &&
      !homeIdentifiers.has(returnRoute.identifier) &&
      returnRoute.identifier !== activeIslandData.profile.id &&
      returnRoute.identifier !== activeIslandData.profile.customId
        ? [returnRoute]
        : [];
    const returnIdentifiers = new Set(returnRoutes.map((route) => route.identifier));
    const connectionRoutes = connections
      .filter(
        (connection) =>
          !homeIdentifiers.has(connection.externalId) &&
          !returnIdentifiers.has(connection.externalId)
      )
      .map((connection) => ({
        key: `connection:${connection.externalId}`,
        identifier: connection.externalId,
        name: connection.nickname ?? t("routes_unknown_island"),
        photoUrl: connection.photoUrl,
        kind: "connection" as const,
      }));
    const excludedIdentifiers = new Set([
      activeIslandData.profile.id,
      activeIslandData.profile.customId,
      ...homeIdentifiers,
      ...returnIdentifiers,
      ...connectionRoutes.map((route) => route.identifier),
    ]);
    const answerRoutes = (answersResponse?.data?.answers ?? [])
      .filter(
        (answer) =>
          answer.isPublic &&
          answer.userId !== null &&
          !excludedIdentifiers.has(answer.userId) &&
          !excludedIdentifiers.has(answer.customId)
      )
      .map((answer) => ({
        key: `explore:${answer.userId}`,
        identifier: answer.customId ?? answer.userId ?? "",
        name: answer.name ?? t("routes_unknown_island"),
        photoUrl: answer.photoURL,
        kind: "explore" as const,
      }));
    const answerIdentifiers = new Set(
      (answersResponse?.data?.answers ?? []).flatMap((answer) =>
        [answer.userId, answer.customId].filter((value): value is string => Boolean(value))
      )
    );
    const publicUserRoutes = (usersResponse?.data ?? [])
      .filter(
        (user) =>
          user.isOpenProfile &&
          !excludedIdentifiers.has(user.id) &&
          !excludedIdentifiers.has(user.customId) &&
          !answerIdentifiers.has(user.id) &&
          !answerIdentifiers.has(user.customId ?? "")
      )
      .map((user) => ({
        key: `explore-user:${user.id}`,
        identifier: user.customId ?? user.id,
        name: user.name ?? t("routes_unknown_island"),
        photoUrl: user.photoURL,
        kind: "explore" as const,
      }));

    return [
      ...homeRoutes,
      ...returnRoutes,
      ...connectionRoutes,
      ...answerRoutes,
      ...publicUserRoutes,
    ];
  }, [
    activeIslandData.profile.customId,
    activeIslandData.profile.id,
    answersResponse?.data?.answers,
    connections,
    currentUserResponse?.data?.customId,
    currentUserResponse?.data?.id,
    homeRoute,
    returnRoute,
    t,
    usersResponse?.data,
  ]);
  const visibleRoutes = useMemo(() => routes.slice(0, MAX_ROUTE_BEACONS), [routes]);
  const destinations = useMemo<IIslandDestination[]>(
    () =>
      visibleRoutes.map((route) => ({
        identifier: route.identifier,
        name: route.name,
        photoUrl: route.photoUrl,
      })),
    [visibleRoutes]
  );
  const closePracticeCard = useCallback(() => {
    setSelectedPracticeId(null);
    engineRef.current?.selectPractice(null);
  }, []);
  const openOwnerPanel = useCallback(() => {
    closePracticeCard();
    setOwnerPanelOpen(true);
  }, [closePracticeCard]);

  const travelTo = useCallback(
    async (route: IIslandRouteItem) => {
      selectedRouteRef.current = null;
      setSelectedRoute(null);
      closePracticeCard();
      try {
        const response = await getUserIsland(route.identifier);
        const destinationIsland = response.data?.data;
        if (!destinationIsland) throw new Error("Destination island unavailable");

        const originIdentifier = activeIslandData.profile.customId ?? activeIslandData.profile.id;
        arrivalOriginRef.current = originIdentifier;
        setReturnRoute({
          key: `return:${activeIslandData.profile.id}`,
          identifier: originIdentifier,
          name: activeIslandData.profile.name ?? t("routes_unknown_island"),
          photoUrl: activeIslandData.profile.photoURL,
          kind: "connection",
        });
        setWalkable(false);
        setIntroPlaying(true);
        setOwnerPanelOpen(false);
        setActiveIslandData(destinationIsland);
        setActiveIdentifier(route.identifier);

        const nextPath = window.location.pathname.replace(
          /\/island\/[^/]+$/,
          `/island/${route.identifier}`
        );
        window.history.replaceState(window.history.state, "", nextPath);
      } catch (error) {
        console.error("[island] travel failed", error);
        engineRef.current?.disembarkBoat();
        departingRef.current = false;
        setIsSailing(false);
        setDepartingName(null);
      }
    },
    [activeIslandData, closePracticeCard, t]
  );
  const selectRoute = useCallback((route: IIslandRouteItem) => {
    setRoutesOpen(false);
    selectedRouteRef.current = route;
    setSelectedRoute(route);
  }, []);
  const travelAutomatically = useCallback(
    async (route: IIslandRouteItem) => {
      if (departingRef.current) return;
      departingRef.current = true;
      selectedRouteRef.current = null;
      setSelectedRoute(null);
      setRoutesOpen(false);
      setIsSailing(true);
      setDepartingName(route.name);
      engineRef.current?.boardBoat();
      await travelTo(route);
    },
    [travelTo]
  );
  const sailFreely = useCallback(async () => {
    if (departingRef.current) return;
    const engine = engineRef.current;
    if (!engine?.boardBoat()) return;

    departingRef.current = true;
    selectedRouteRef.current = null;
    setSelectedRoute(null);
    setRoutesOpen(false);
    setIsSailing(true);
    const dockedIdentifier = await engine.sailFreely();
    if (!dockedIdentifier) {
      departingRef.current = false;
      setIsSailing(false);
      return;
    }

    const dockedRoute = routesRef.current.find((route) => route.identifier === dockedIdentifier);
    if (!dockedRoute) {
      engine.disembarkBoat();
      departingRef.current = false;
      setIsSailing(false);
      return;
    }
    setDepartingName(dockedRoute.name);
    await travelToRef.current(dockedRoute);
  }, []);
  routesRef.current = visibleRoutes;
  travelToRef.current = travelTo;
  selectRouteRef.current = selectRoute;
  sailFreelyRef.current = sailFreely;

  const getDiagnostics = useCallback(() => engineRef.current?.getDiagnostics() ?? null, []);

  useEffect(() => {
    setShowDiag(new URLSearchParams(window.location.search).get("diag") === "1");
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    if (!isWebglAvailable()) {
      setWebglFailed(true);
      return;
    }

    let engine: IslandEngine | null = null;
    try {
      engine = new IslandEngine({
        // IIslandData 與 API islandData 結構鏡射，僅收斂 enum 型別
        islandData: activeIslandData as IIslandData,
        container,
        events: {
          onWalkable: () => setWalkable(true),
          onIntroEnd: () => setIntroPlaying(false),
          onObjectClick: (payload) => {
            if (payload.kind === "practice") {
              setOwnerPanelOpen(false);
              setSelectedPracticeId(payload.practiceId);
              engineRef.current?.selectPractice(payload.practiceId);
            }
            if (payload.kind === "owner") openOwnerPanel();
            if (payload.kind === "harbor") {
              setOwnerPanelOpen(false);
              closePracticeCard();
              void sailFreelyRef.current();
            }
            if (payload.kind === "destination") {
              closePracticeCard();
              const route = routesRef.current.find(
                (item) => item.identifier === payload.identifier
              );
              if (route) selectRouteRef.current(route);
            }
          },
        },
      });
    } catch (error) {
      // WebGL context 建立失敗（如硬體加速被停用）
      console.error("[island] engine init failed", error);
      setWebglFailed(true);
      return;
    }
    engineRef.current = engine;

    // fps 採樣自動降品質（task 4.4）：低於門檻降一級，直到 low
    const degradeTimer = window.setInterval(() => {
      const current = engineRef.current;
      if (!current) return;
      const fps = current.getAverageFps();
      if (fps !== null && fps < DEGRADE_FPS_THRESHOLD && current.getQuality() !== QualityTier.low) {
        current.setQuality(degradeTier(current.getQuality()));
      }
    }, DEGRADE_CHECK_INTERVAL_MS);

    return () => {
      window.clearInterval(degradeTimer);
      engineRef.current = null;
      engine?.dispose();
    };
  }, [activeIslandData, closePracticeCard, openOwnerPanel]);

  useEffect(() => {
    const engine = engineRef.current;
    if (!engine) return;
    let cancelled = false;

    void engine.setDestinations(destinations).then(() => {
      if (cancelled || engineRef.current !== engine) return;
      const arrivalOrigin = arrivalOriginRef.current;
      if (!walkable || !arrivalOrigin) return;
      if (!destinations.some((destination) => destination.identifier === arrivalOrigin)) return;
      arrivalOriginRef.current = null;
      void engine.arriveFrom(arrivalOrigin).then(() => {
        departingRef.current = false;
        setIsSailing(false);
        setDepartingName(null);
        setIntroPlaying(false);
      });
    });

    return () => {
      cancelled = true;
    };
  }, [destinations, walkable]);

  if (webglFailed) {
    return <WebglFallback identifier={activeIdentifier} />;
  }

  return (
    <div className="fixed inset-0">
      <div ref={containerRef} className="size-full" />

      {!walkable && <IslandLoading message={t("loading")} />}

      {showDiag && <IslandDiagnostics getSnapshot={getDiagnostics} />}

      {/* 返回個人頁 */}
      <div className="absolute top-4 left-4 z-30">
        <Button
          variant="ghost"
          className="bg-white/70 backdrop-blur rounded-full"
          onClick={() => router.push(`/users/${activeIdentifier}`)}
        >
          <ArrowLeft className="size-4" />
          {t("back_to_profile")}
        </Button>
      </div>

      {/* 島主識別：換島後固定顯示目前所在島嶼 */}
      <div className="absolute top-16 sm:top-4 left-1/2 z-30 -translate-x-1/2">
        <Button
          variant="ghost"
          className="flex h-10 max-w-[min(18rem,calc(100vw-2rem))] items-center gap-2 rounded-lg border border-white/70 bg-white/80 px-2.5 pr-3 shadow-sm backdrop-blur-md hover:bg-white"
          onClick={openOwnerPanel}
          aria-label={t("owner_open_info", {
            name: activeIslandData.profile.name ?? t("routes_unknown_island"),
          })}
        >
          <Avatar className="size-7 border border-white">
            <AvatarImage
              src={activeIslandData.profile.photoURL ?? undefined}
              alt={activeIslandData.profile.name ?? t("routes_unknown_island")}
            />
            <AvatarFallback className="bg-[#E8FAF9] text-xs font-medium text-logo-cyan">
              {(activeIslandData.profile.name ?? t("routes_unknown_island")).slice(0, 1)}
            </AvatarFallback>
          </Avatar>
          <p className="truncate text-sm font-medium text-text-dark">
            {t("owner_label", {
              name: activeIslandData.profile.name ?? t("routes_unknown_island"),
            })}
          </p>
        </Button>
      </div>

      {/* 群島海圖只提供目的地參考；實際前往哪座島由自由航行時靠泊的碼頭決定 */}
      <div className="absolute top-4 right-4 z-30">
        <ArchipelagoNavigator
          routes={visibleRoutes}
          currentIslandName={activeIslandData.profile.name ?? t("routes_unknown_island")}
          isLoading={
            currentUserLoading ||
            connectionsLoading ||
            questionsLoading ||
            answersLoading ||
            usersLoading
          }
          open={routesOpen}
          onOpenChange={setRoutesOpen}
          onTravel={(route) => {
            void travelAutomatically(route);
          }}
        />
      </div>

      {/* 跳過環島空拍 intro */}
      {walkable && introPlaying && (
        <div className="absolute bottom-6 right-6 z-30">
          <Button
            variant="ghost"
            className="bg-white/70 backdrop-blur rounded-full"
            onClick={() => engineRef.current?.skipIntro()}
          >
            {t("skip_intro")}
          </Button>
        </div>
      )}

      {/* 操作提示 */}
      {walkable && !introPlaying && !selectedPracticeId && !isSailing && (
        <p className="absolute bottom-4 left-1/2 z-20 max-w-[calc(100vw-1.5rem)] -translate-x-1/2 text-balance rounded-full bg-white/50 px-4 py-1.5 text-center text-xs text-text-dark/70 backdrop-blur pointer-events-none">
          {isMobile ? t("hint_mobile") : t("hint_desktop")}
        </p>
      )}

      {/* 空島：島主見「點燃營火」CTA（task 4.3） */}
      {showEmptyCta && !introPlaying && (
        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-30">
          <Button variant="orange" onClick={() => router.push("/practices/create")}>
            <Flame className="size-4" />
            {t("empty_cta")}
          </Button>
        </div>
      )}

      {/* 未完成 quiz：中性島＋導流入口（task 4.3） */}
      {showQuizCta && !introPlaying && (
        <div className="absolute top-16 right-4 z-30">
          <Button
            variant="ghost"
            className="bg-white/70 backdrop-blur rounded-full"
            onClick={() => router.push(`${getEnv("NEXT_PUBLIC_WEBSITE_URL")}/quiz`)}
          >
            <Sparkles className="size-4" />
            {t("quiz_cta")}
          </Button>
        </div>
      )}

      {/* 實踐營火札記：保留島嶼全景，只顯示選取實踐摘要 */}
      <PracticeCampCard
        key={selectedPracticeId ?? "closed"}
        practiceId={selectedPracticeId}
        practices={activeIslandData.practices}
        onClose={closePracticeCard}
      />

      <IslandOwnerPanel
        islandData={activeIslandData}
        open={ownerPanelOpen}
        onClose={() => setOwnerPanelOpen(false)}
        onViewProfile={() => router.push(`/users/${activeIdentifier}`)}
      />

      {selectedRoute && !isSailing && (
        <div className="pointer-events-none absolute bottom-8 left-1/2 z-40 w-[min(24rem,calc(100vw-1.5rem))] -translate-x-1/2">
          <div className="flex w-full items-center gap-2 rounded-lg border border-white/70 bg-white/85 px-4 py-2 text-text-dark shadow-md backdrop-blur-md">
            <Sailboat className="size-5 shrink-0 text-logo-cyan" />
            <p className="text-sm font-medium">
              {t(isMobile ? "routes_boarding_hint_mobile" : "routes_boarding_hint", {
                name: selectedRoute.name,
              })}
            </p>
          </div>
        </div>
      )}

      {isSailing && !departingName && (
        <div className="absolute bottom-8 left-1/2 z-50 w-[min(26rem,calc(100vw-1.5rem))] -translate-x-1/2">
          <div className="flex w-full items-center gap-2 rounded-lg border border-white/70 bg-white/85 px-4 py-2 text-text-dark shadow-md backdrop-blur-md">
            <Sailboat className="size-5 shrink-0 text-logo-cyan" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">{t("routes_free_sailing")}</p>
              <p className="text-xs text-text-dark/65">
                {isMobile ? t("routes_sailing_hint_mobile") : t("routes_sailing_hint_desktop")}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="ml-2 shrink-0 bg-white/70"
              onClick={() => engineRef.current?.disembarkBoat()}
            >
              {t("routes_disembark")}
            </Button>
          </div>
        </div>
      )}

      {departingName && (
        <div className="pointer-events-none absolute bottom-8 left-1/2 z-50 w-[min(26rem,calc(100vw-1.5rem))] -translate-x-1/2">
          <div className="flex w-full items-center gap-2 rounded-lg border border-white/70 bg-white/85 px-4 py-2 text-text-dark shadow-md backdrop-blur-md">
            <Sailboat className="size-5 shrink-0 text-logo-cyan" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">
                {t("routes_departing", { name: departingName })}
              </p>
              <p className="text-xs text-text-dark/65">
                {isMobile ? t("routes_sailing_hint_mobile") : t("routes_sailing_hint_desktop")}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
