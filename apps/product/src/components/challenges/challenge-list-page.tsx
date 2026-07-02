"use client";

import { Link, useRouter } from "@daodao/i18n/navigation";
import { Badge } from "@daodao/ui/components/badge";
import { Button } from "@daodao/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@daodao/ui/components/card";
import { Carousel, CarouselContent, CarouselItem } from "@daodao/ui/components/carousel";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemSeparator,
  ItemTitle,
} from "@daodao/ui/components/item";
import { toast } from "@daodao/ui/components/sonner";
import { differenceInCalendarDays, format, parseISO } from "date-fns";
import { Clock, Users } from "lucide-react";
import { Fragment, useState } from "react";
import { CategoryIconTile, getCategoryStyle } from "./category-icon";
import { CATEGORY_LABELS, MOCK_CHALLENGES } from "./mock-data";
import { pocChallengeActions, usePocChallengeStore } from "./poc-store";
import type { Challenge, ChallengeSeason } from "./types";

function daysLeft(endDate: string): number {
  return Math.max(0, differenceInCalendarDays(parseISO(endDate), new Date()));
}

interface ChallengeWithSeason {
  challenge: Challenge;
  season: ChallengeSeason;
}

/** 進行中的挑戰：橫向滑動的大卡（Carousel） */
function ActiveChallengeCarousel({ items }: { items: ChallengeWithSeason[] }) {
  const router = useRouter();
  const store = usePocChallengeStore();
  if (items.length === 0) return null;

  return (
    <Carousel opts={{ align: "start" }} className="-mx-5">
      <CarouselContent className="ml-1 mr-5">
        {items.map(({ challenge, season }) => {
          const accent = getCategoryStyle(challenge.category);
          return (
            <CarouselItem key={challenge.id} className="basis-[85%] pl-4">
              <Link href={`/challenges/${challenge.id}`}>
                <Card
                  className="h-full border-[#E4EAE9] shadow-sm transition-shadow hover:shadow-md"
                  style={{ borderTopWidth: 3, borderTopColor: accent.color }}
                >
                  <CardHeader className="flex-row items-center gap-3 space-y-0 pb-2">
                    <CategoryIconTile
                      category={challenge.category}
                      className="size-11"
                      iconClassName="size-5"
                    />
                    <div className="min-w-0">
                      <CardTitle className="truncate text-base text-text-dark">
                        {challenge.title}
                      </CardTitle>
                      <CardDescription className="text-xs">
                        {CATEGORY_LABELS[challenge.category]} · 第 {season.seasonNumber} 期
                      </CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-3">
                    <p className="line-clamp-2 text-sm text-text-secondary">
                      {challenge.description}
                    </p>
                  </CardContent>
                  <CardFooter className="justify-between pt-0">
                    <span className="flex items-center gap-3 text-xs text-text-secondary">
                      <span className="flex items-center gap-1">
                        <Users className="size-3.5" />
                        {season.memberCount}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="size-3.5" />剩 {daysLeft(season.endDate)} 天
                      </span>
                    </span>
                    <Button
                      size="sm"
                      variant={store.seasons[season.id]?.joined ? "outline" : "default"}
                      className="rounded-full"
                      onClick={(e) => {
                        // 直接前往本期頁（外層卡片連到主題頁）
                        e.preventDefault();
                        router.push(`/challenges/${challenge.id}/seasons/${season.id}`);
                      }}
                    >
                      {store.seasons[season.id]?.joined ? "前往打卡" : "加入本期"}
                    </Button>
                  </CardFooter>
                </Card>
              </Link>
            </CarouselItem>
          );
        })}
      </CarouselContent>
    </Carousel>
  );
}

/** 即將開始的挑戰：Item 列表 + 預先報名 */
function UpcomingChallengeList({ items }: { items: ChallengeWithSeason[] }) {
  const store = usePocChallengeStore();
  if (items.length === 0) return null;

  return (
    <ItemGroup className="rounded-2xl border border-[#E4EAE9] bg-white">
      {items.map(({ challenge, season }, index) => (
        <Fragment key={challenge.id}>
          {index > 0 && <ItemSeparator />}
          <Item asChild>
            <Link href={`/challenges/${challenge.id}`}>
              <ItemMedia>
                <CategoryIconTile
                  category={challenge.category}
                  className="size-10"
                  iconClassName="size-5"
                />
              </ItemMedia>
              <ItemContent>
                <ItemTitle className="text-text-dark">{challenge.title}</ItemTitle>
                <ItemDescription>
                  {format(parseISO(season.startDate), "MM/dd")} 開始 · {season.memberCount} 人已報名
                </ItemDescription>
              </ItemContent>
              <ItemActions>
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-full"
                  disabled={store.seasons[season.id]?.registered ?? false}
                  onClick={(e) => {
                    e.preventDefault();
                    pocChallengeActions.registerSeason(season.id);
                    toast.success("已預先報名，開始時會通知你");
                  }}
                >
                  {store.seasons[season.id]?.registered ? "已報名 ✓" : "預先報名"}
                </Button>
              </ItemActions>
            </Link>
          </Item>
        </Fragment>
      ))}
    </ItemGroup>
  );
}

export function ChallengeListPage() {
  const [category, setCategory] = useState<string>("all");

  const filtered =
    category === "all" ? MOCK_CHALLENGES : MOCK_CHALLENGES.filter((c) => c.category === category);

  const active: ChallengeWithSeason[] = [];
  const upcoming: ChallengeWithSeason[] = [];
  for (const challenge of filtered) {
    const activeSeason = challenge.seasons.find((s) => s.status === "active");
    if (activeSeason) {
      active.push({ challenge, season: activeSeason });
      continue;
    }
    const upcomingSeason = challenge.seasons.find((s) => s.status === "upcoming");
    if (upcomingSeason) upcoming.push({ challenge, season: upcomingSeason });
  }

  return (
    <div className="flex flex-col gap-5 px-5 pt-4">
      <div className="text-center">
        <h1 className="text-xl font-bold text-text-dark">共同挑戰</h1>
        <p className="mt-1 text-sm text-text-secondary">找一群人，一起完成同一件事</p>
      </div>

      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
        {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
          <Button
            key={value}
            size="sm"
            variant={category === value ? "default" : "outline"}
            className="shrink-0 rounded-full"
            onClick={() => setCategory(value)}
          >
            {label}
          </Button>
        ))}
      </div>

      {active.length > 0 && (
        <section>
          <h2 className="mb-2 text-base font-bold text-text-dark">進行中</h2>
          <ActiveChallengeCarousel items={active} />
        </section>
      )}

      {upcoming.length > 0 && (
        <section>
          <h2 className="mb-2 text-base font-bold text-text-dark">即將開始</h2>
          <UpcomingChallengeList items={upcoming} />
        </section>
      )}

      {active.length === 0 && upcoming.length === 0 && (
        <p className="py-12 text-center text-sm text-text-secondary">這個分類還沒有挑戰</p>
      )}
    </div>
  );
}
