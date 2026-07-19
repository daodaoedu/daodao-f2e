"use client";

import { useTranslations } from "@daodao/i18n";
import { Avatar, AvatarFallback, AvatarImage } from "@daodao/ui/components/avatar";
import { Button } from "@daodao/ui/components/button";
import { Popover, PopoverContent, PopoverTrigger } from "@daodao/ui/components/popover";
import { Anchor, ChevronRight, LoaderCircle, ShipWheel } from "lucide-react";

interface ArchipelagoNavigatorProps {
  routes: readonly IIslandRouteItem[];
  currentIslandName: string;
  isLoading: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTravel: (route: IIslandRouteItem) => void;
}

export interface IIslandRouteItem {
  key: string;
  identifier: string;
  name: string;
  photoUrl: string | null;
  kind: "home" | "connection" | "explore";
}

export function ArchipelagoNavigator({
  routes,
  currentIslandName,
  isLoading,
  open,
  onOpenChange,
  onTravel,
}: ArchipelagoNavigatorProps) {
  const t = useTranslations("island");

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          className="h-10 gap-2 rounded-lg border border-white/70 bg-white/80 px-3 shadow-sm backdrop-blur-md hover:bg-white"
          aria-label={t("routes_open")}
        >
          <ShipWheel className="size-4 text-logo-cyan" />
          <span className="hidden sm:inline">{t("routes_title")}</span>
          {!isLoading && routes.length > 0 && (
            <span className="min-w-5 rounded-full bg-logo-cyan px-1.5 text-xs text-white">
              {routes.length}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-[min(22rem,calc(100vw-2rem))] border-white/70 bg-white/95 p-0 shadow-lg backdrop-blur-xl"
      >
        <div className="border-b border-[#DDEDEC] px-4 py-3">
          <div className="flex items-center gap-2 text-xs font-medium text-logo-cyan">
            <Anchor className="size-3.5" />
            {t("routes_current")}
          </div>
          <p className="mt-1 truncate text-sm font-medium text-text-dark">{currentIslandName}</p>
        </div>

        <div className="max-h-[min(24rem,60vh)] overflow-y-auto p-2">
          {isLoading ? (
            <div className="flex items-center justify-center gap-2 px-3 py-10 text-sm text-text-dark/60">
              <LoaderCircle className="size-4 animate-spin" />
              {t("routes_loading")}
            </div>
          ) : routes.length === 0 ? (
            <div className="px-4 py-10 text-center">
              <ShipWheel className="mx-auto size-6 text-logo-cyan/60" />
              <p className="mt-3 text-sm font-medium text-text-dark">{t("routes_empty")}</p>
              <p className="mt-1 text-xs leading-5 text-text-dark/60">{t("routes_empty_desc")}</p>
            </div>
          ) : (
            <div className="flex flex-col">
              {routes.map((route) => {
                let descriptionKey = "routes_explore_destination";
                if (route.kind === "home") descriptionKey = "routes_home_destination";
                if (route.kind === "connection") descriptionKey = "routes_connection_destination";
                return (
                  <button
                    type="button"
                    key={route.key}
                    className="flex min-h-14 w-full items-center gap-3 rounded-md px-2.5 py-2 text-left transition-colors hover:bg-[#EAF8F7] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-logo-cyan"
                    onClick={() => onTravel(route)}
                  >
                    <Avatar className="size-9 border border-[#DDEDEC] bg-white">
                      <AvatarImage src={route.photoUrl ?? undefined} alt={route.name} />
                      <AvatarFallback className="bg-[#E8FAF9] text-sm font-medium text-logo-cyan">
                        {route.name.slice(0, 1)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-text-dark">
                        {route.name}
                      </span>
                      <span className="block text-xs text-text-dark/55">{t(descriptionKey)}</span>
                    </span>
                    <ChevronRight className="size-4 shrink-0 text-text-dark/40" />
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
