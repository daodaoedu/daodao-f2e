"use client";

import {
  defaultSwrConfig,
  type LighthouseOrganizationType,
  SwrConfigProvider,
  updateLighthousePreferences,
  useLighthouseCohort,
  useLighthouseOrganizations,
  useLighthousePreferences,
} from "@daodao/api";
import { useAuth } from "@daodao/auth";
import { useTranslations } from "@daodao/i18n";
import { usePathname, useRouter } from "@daodao/i18n/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@daodao/ui/components/select";
import { toast } from "@daodao/ui/components/sonner";
import { useNavigationBlocker } from "@daodao/ui/hooks/navigation-blocker";
import { useSearchParams } from "next/navigation";
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  createLighthousePreferenceWriter,
  interceptLighthouseTraversal,
  type LighthouseTraversalEventType,
  lighthouseOrganizationHref,
  lighthouseRouterHref,
  lighthouseScopedHistoryRestore,
  resolveLighthouseOrganization,
} from "@/utils/lighthouse-organization";
import { CohortErrorState } from "./cohort-error-state";
import { ConfirmDialog } from "./confirm-dialog";

type Guard = { dirty: boolean; busy: boolean };
type OrganizationContextValue = {
  organization?: LighthouseOrganizationType;
  organizationsQuery: ReturnType<typeof useLighthouseOrganizations>;
  href: (href: string, organizationId?: number) => string;
  registerGuard: (key: symbol, guard?: Guard) => void;
  statusContent: ReactNode;
};
const OrganizationContext = createContext<OrganizationContextValue | null>(null);

/** A fresh SWR cache for each authenticated account prevents cross-account private data reuse. */
export function LighthouseOrganizationProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated, isLoading, authCheckUnavailable, refreshAuth } = useAuth();
  const t = useTranslations("lighthouse");
  const cacheConfig = useMemo(
    () => ({ ...defaultSwrConfig, keepPreviousData: false, provider: () => new Map() }),
    []
  );
  if (isLoading) return <p className="px-5 py-12 text-sm">{t("loading")}</p>;
  if (authCheckUnavailable)
    return (
      <CohortErrorState
        message={t("load_failed")}
        retryLabel={t("retry")}
        onRetry={() => void refreshAuth()}
      />
    );
  if (!isAuthenticated || !user) return null;
  return (
    <SwrConfigProvider key={user.id} value={cacheConfig}>
      <OrganizationState key={user.id}>{children}</OrganizationState>
    </SwrConfigProvider>
  );
}

/** Shared state for all Lighthouse pages, including authorized cohort deep links. */
function OrganizationState({ children }: { children: ReactNode }) {
  const t = useTranslations("lighthouse");
  const pathname = usePathname();
  const search = useSearchParams();
  const router = useRouter();
  const organizationsQuery = useLighthouseOrganizations();
  const preferences = useLighthousePreferences();
  const resourceMatch = pathname.match(/^\/lighthouse\/programs\/(\d+)\/cohorts\/(\d+)(?:\/|$)/);
  const cohort = useLighthouseCohort(
    resourceMatch ? Number(resourceMatch[1]) : undefined,
    resourceMatch ? Number(resourceMatch[2]) : undefined
  );
  const resourceOrganizationId = resourceMatch ? cohort.data?.data.organizationId : undefined;
  const requested = search.get("organizationId");
  const organizations = organizationsQuery.organizations ?? [];
  const resolution = resolveLighthouseOrganization(
    organizations,
    requested,
    preferences.data?.data.organizationId ?? null,
    resourceOrganizationId
  );
  const ready =
    !organizationsQuery.isLoading &&
    Boolean(organizationsQuery.data) &&
    (resourceMatch ? Boolean(cohort.data) : requested !== null || Boolean(preferences.data));
  const organizationId =
    ready && resolution.status === "ready" ? resolution.organizationId : undefined;
  const organization = organizations.find((item) => item.id === organizationId);
  const guards = useRef(new Map<symbol, Guard>());
  const [blocked, setBlocked] = useState(false);
  const [writing, setWriting] = useState(false);
  const { setIsBlocked } = useNavigationBlocker();
  const [pendingHref, setPendingHref] = useState<string | null>(null);
  const mounted = useRef(true);
  const preferenceMutation = useRef(preferences.mutate);
  preferenceMutation.current = preferences.mutate;
  const writer = useRef<ReturnType<typeof createLighthousePreferenceWriter> | null>(null);
  useEffect(() => {
    mounted.current = true;
    const accountWriter = createLighthousePreferenceWriter(
      async (id) => {
        const response = await updateLighthousePreferences(id);
        if (response.error) throw response.error;
        if (mounted.current) await preferenceMutation.current(response.data, { revalidate: false });
      },
      () => toast.error(t("save_failed"))
    );
    writer.current = accountWriter;
    return () => {
      mounted.current = false;
      accountWriter.dispose();
    };
  }, [t]);
  const historyIndex = useRef(0);
  const historySource = useRef<{ href: string; state: unknown } | null>(null);
  const pendingHistoryDelta = useRef<number | null>(null);
  const pendingNavigationKey = useRef<string | null>(null);
  const restoringHistory = useRef(false);
  const allowingHistory = useRef(false);

  const registerGuard = useCallback((key: symbol, guard?: Guard) => {
    if (guard) guards.current.set(key, guard);
    else guards.current.delete(key);
    const values = [...guards.current.values()];
    setBlocked(values.some((item) => item.dirty || item.busy));
    setWriting(values.some((item) => item.busy));
  }, []);

  useEffect(() => {
    setIsBlocked(blocked);
    return () => setIsBlocked(false);
  }, [blocked, setIsBlocked]);

  const href = useCallback(
    (value: string, id = organizationId) => lighthouseOrganizationHref(value, id),
    [organizationId]
  );
  const navigate = useCallback(
    (value: string) => {
      if ([...guards.current.values()].some((item) => item.busy)) return;
      pendingHistoryDelta.current = null;
      pendingNavigationKey.current = null;
      if ([...guards.current.values()].some((item) => item.dirty)) setPendingHref(value);
      else router.push(value);
    },
    [router]
  );

  useEffect(() => {
    const indexKey = "__lighthouseOrganizationHistoryIndex";
    const scopeKey = "__lighthouseOrganizationHistoryScope";
    const historyScope = crypto.randomUUID();
    restoringHistory.current = false;
    allowingHistory.current = false;
    pendingHistoryDelta.current = null;
    pendingNavigationKey.current = null;
    setPendingHref(null);
    const originalPush = window.history.pushState;
    const originalReplace = window.history.replaceState;
    const rememberSource = () => {
      historySource.current = {
        href: `${window.location.pathname}${window.location.search}${window.location.hash}`,
        state: window.history.state,
      };
    };
    const stateRecord = (state: unknown): Record<string, unknown> =>
      state !== null && typeof state === "object" ? (state as Record<string, unknown>) : {};
    // A reload or provider remount starts a new scope; old numeric markers are unrelated.
    historyIndex.current = 0;
    originalReplace.call(
      window.history,
      {
        ...stateRecord(window.history.state),
        [indexKey]: historyIndex.current,
        [scopeKey]: historyScope,
      },
      ""
    );
    rememberSource();
    const taggedPush: History["pushState"] = (
      data: unknown,
      unused: string,
      url?: string | URL | null
    ) => {
      const nextIndex = historyIndex.current + 1;
      originalPush.call(
        window.history,
        { ...stateRecord(data), [indexKey]: nextIndex, [scopeKey]: historyScope },
        unused,
        url
      );
      historyIndex.current = nextIndex;
      rememberSource();
    };
    const taggedReplace: History["replaceState"] = (
      data: unknown,
      unused: string,
      url?: string | URL | null
    ) => {
      originalReplace.call(
        window.history,
        { ...stateRecord(data), [indexKey]: historyIndex.current, [scopeKey]: historyScope },
        unused,
        url
      );
      rememberSource();
    };
    window.history.pushState = taggedPush;
    window.history.replaceState = taggedReplace;
    const onBack = (event: PopStateEvent) => {
      const targetState = stateRecord(event.state);
      const targetIndex = targetState[indexKey];
      const targetScope = targetState[scopeKey];
      if (restoringHistory.current) {
        restoringHistory.current = false;
        event.stopImmediatePropagation();
        return;
      }
      if (
        allowingHistory.current ||
        ![...guards.current.values()].some((item) => item.dirty || item.busy)
      ) {
        allowingHistory.current = false;
        if (targetScope === historyScope && typeof targetIndex === "number")
          historyIndex.current = targetIndex;
        rememberSource();
        return;
      }
      const target = `${window.location.pathname}${window.location.search}${window.location.hash}`;
      const restore = lighthouseScopedHistoryRestore(historyIndex.current, historyScope, {
        scope: targetScope,
        index: targetIndex,
      });
      event.stopImmediatePropagation();
      if (restore.kind === "traverse") {
        restoringHistory.current = true;
        // Known entries preserve their original state and Forward history.
        window.history.go(-restore.delta);
        pendingHistoryDelta.current = restore.delta;
      } else {
        // An unmarked outside entry has no reliable direction or distance. Restore
        // the source in place, then use the captured target only after confirmation.
        restoringHistory.current = false;
        pendingHistoryDelta.current = null;
        const source = historySource.current;
        if (source) originalReplace.call(window.history, source.state, "", source.href);
      }
      if (![...guards.current.values()].some((item) => item.busy)) {
        setPendingHref(lighthouseRouterHref(target));
      }
    };
    const browserNavigation = (
      window as unknown as { navigation?: EventTarget & { traverseTo: (key: string) => unknown } }
    ).navigation;
    const onNavigate = (event: Event) => {
      const values = [...guards.current.values()];
      const decision = interceptLighthouseTraversal(
        event as LighthouseTraversalEventType,
        {
          dirty: values.some((item) => item.dirty),
          busy: values.some((item) => item.busy),
        },
        allowingHistory.current
      );
      if (decision?.kind !== "confirm") return;
      pendingHistoryDelta.current = null;
      pendingNavigationKey.current = decision.key;
      setPendingHref(decision.href);
    };
    browserNavigation?.addEventListener("navigate", onNavigate);
    window.addEventListener("popstate", onBack, true);
    return () => {
      browserNavigation?.removeEventListener("navigate", onNavigate);
      window.removeEventListener("popstate", onBack, true);
      if (window.history.pushState === taggedPush) window.history.pushState = originalPush;
      if (window.history.replaceState === taggedReplace)
        window.history.replaceState = originalReplace;
    };
  }, []);

  useEffect(() => {
    if (!organizationId) return;
    if (requested !== String(organizationId)) {
      router.replace(
        href(`${pathname}?${search.toString()}${window.location.hash}`, organizationId)
      );
    }
  }, [organizationId, requested, pathname, search, router, href]);

  useEffect(() => {
    if (
      organizationId &&
      preferences.data &&
      preferences.data.data.organizationId !== organizationId
    ) {
      writer.current?.request(organizationId);
    }
  }, [organizationId, preferences.data]);

  useEffect(() => {
    const retry = () => {
      if (organizationId && document.visibilityState === "visible")
        writer.current?.request(organizationId);
    };
    window.addEventListener("focus", retry);
    return () => window.removeEventListener("focus", retry);
  }, [organizationId]);

  const hasError =
    organizationsQuery.error ||
    organizationsQuery.validationError ||
    (resourceMatch
      ? cohort.error || cohort.validationError
      : requested === null && (preferences.error || preferences.validationError));
  let content: ReactNode = null;
  if (hasError)
    content = (
      <CohortErrorState
        message={t("load_failed")}
        retryLabel={t("retry")}
        onRetry={() => {
          void organizationsQuery.mutate();
          void preferences.mutate();
          void cohort.mutate();
        }}
      />
    );
  else if (!ready)
    content = (
      <p className="px-5 py-12 text-sm text-[#5A7B79]" aria-live="polite">
        {t("loading")}
      </p>
    );
  else if (!organization)
    content = (
      <div className="px-5 py-12">
        <p role="alert" className="text-sm text-[#5A7B79]">
          {t("organization_unavailable")}
        </p>
      </div>
    );

  const value = useMemo(
    () => ({ organization, organizationsQuery, href, registerGuard, statusContent: content }),
    [organization, organizationsQuery, href, registerGuard, content]
  );

  return (
    <OrganizationContext.Provider value={value}>
      <div
        onClickCapture={(event) => {
          if (writing && event.target instanceof Element && event.target.closest("a[href]")) {
            event.preventDefault();
            event.stopPropagation();
          }
        }}
      >
        <div className="border-b border-[#CDEBE8] bg-white px-5 py-3 md:ml-64 md:px-10">
          <div className="mx-auto max-w-6xl">
            {organizations.length > 1 ||
            (!organization && organizations.some((item) => item.status === "active")) ? (
              <Select
                value={organizationId ? String(organizationId) : ""}
                disabled={writing}
                onValueChange={(id) =>
                  navigate(href(resourceMatch ? "/lighthouse" : pathname, Number(id)))
                }
              >
                <SelectTrigger
                  aria-label={t("organization_switch")}
                  className="w-full max-w-sm border-[#CDEBE8]"
                >
                  <SelectValue placeholder={t("organization_switch")} />
                </SelectTrigger>
                <SelectContent>
                  {organizations.map((item) => (
                    <SelectItem
                      key={item.id}
                      value={String(item.id)}
                      disabled={item.status !== "active"}
                    >
                      {item.name}
                      {item.status !== "active" ? ` (${t("organization_suspended")})` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <p className="truncate text-sm font-medium text-[#0D3036]">{organization?.name}</p>
            )}
          </div>
        </div>
        {children}
      </div>
      <ConfirmDialog
        open={pendingHref !== null}
        title={t("organization_unsaved_title")}
        description={t("organization_unsaved_description")}
        confirmLabel={t("organization_discard")}
        onOpenChange={(open) => {
          if (!open) {
            pendingHistoryDelta.current = null;
            setPendingHref(null);
          }
        }}
        onConfirm={() => {
          if (!pendingHref || writing) return;
          const destination = pendingHref;
          setPendingHref(null);
          const delta = pendingHistoryDelta.current;
          const navigationKey = pendingNavigationKey.current;
          pendingHistoryDelta.current = null;
          pendingNavigationKey.current = null;
          const navigation = (
            window as unknown as { navigation?: { traverseTo: (key: string) => unknown } }
          ).navigation;
          if (navigationKey && navigation) {
            allowingHistory.current = true;
            navigation.traverseTo(navigationKey);
          } else if (delta !== null) {
            allowingHistory.current = true;
            window.history.go(delta);
          } else router.push(lighthouseRouterHref(destination));
        }}
      />
    </OrganizationContext.Provider>
  );
}

/** Read the one organization selected by the shell; consumers never choose the first membership. */
export function useLighthouseOrganization() {
  const value = useContext(OrganizationContext);
  if (!value) throw new Error("Lighthouse organization provider is missing");
  return value;
}

/** Keep org switching and existing CustomLink navigation aware of dirty or writing forms. */
export function useLighthouseOrganizationGuard(dirty: boolean, busy = false) {
  const { registerGuard } = useLighthouseOrganization();
  const key = useRef(Symbol("organization-form"));
  useEffect(() => {
    registerGuard(key.current, { dirty, busy });
    return () => registerGuard(key.current);
  }, [dirty, busy, registerGuard]);
}

/** Keep the navigation available while withholding stale or unauthorized page content. */
export function LighthouseOrganizationContent({ children }: { children: ReactNode }) {
  const { organization, statusContent } = useLighthouseOrganization();
  return statusContent ?? <div key={organization?.id}>{children}</div>;
}
