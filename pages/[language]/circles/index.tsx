import type { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { useReducer } from "react";
import { toast } from "sonner";
import { SWRConfig } from "swr";
import { useRouter } from "next/navigation";
import { CustomLink } from '@/shared/ui/custom-link';
import { MapPin, SearchIcon } from "lucide-react";
import groupBannerPng from "@/public/assets/circles/banner.png";
import emptyCoverPng from "@/public/assets/images/empty-cover.png";
import SEOConfig, { JsonLdType } from "@/components/SEOConfig";
import useMediaQuery from "@/shared/lib/use-media-query";
import {
  createCircleJsonLd,
  getSerializeCircleInfiniteKey,
  useCircleList,
} from "@/features/circles";
import { AuthButton } from "@/features/auth";
import { Text, Title } from "@/shared/ui/typography";
import { Background, Container, Paper } from "@/shared/ui/wrapper";
import { ALL_AREAS, TBD_OPTION } from "@/constants/areas";
import { Checkbox, Input, Label, Button } from "@/shared/ui";
import { ACTIVITY_CATEGORIES, CATEGORIES } from "@/constants/category";
import { EDUCATION } from "@/constants/member";
import { MultipleSelector } from "@/shared/ui/multiple-selector";
import { Badge } from "@/shared/ui/badge";
import { Image } from "@/shared/ui/image";
import { Separator } from "@/shared/ui/separator";
import { timeDuration } from "@/utils/date";
import { OptionProps } from "@/shared/ui/option";
import { AspectRatio } from "@/shared/ui/aspect-ratio";
import {
  circleAPI,
  CircleListResponseSchema,
  CircleSchema,
  CircleSearchParamsSchema,
  circleSearchParamsSchema,
} from "@/services/circles";
import { cn } from "@/utils/cn";
import { Skeleton } from "@/shared/ui/skeleton";
import dynamic from "next/dynamic";
import JsonLdFactory from "@/utils/jsonLd";

const MarkdownEditor = dynamic(
  () => import("@/shared/ui/markdown-editor").then(mod => ({ default: mod.MarkdownEditor })),
  {
    ssr: false,
    loading: () => <div className="line-clamp-2 body-sm h-10 animate-pulse bg-gray-100 rounded" />,
  }
);
import useQueryState from "@/shared/lib/use-query-state";
import { getOptionLabel } from "@/utils/option";
import { Speech } from "@/shared/ui/speech";

function Banner() {
  const router = useRouter();
  return (
    <div className="relative">
      <Image
        src={groupBannerPng}
        alt="揪團封面"
        className="min-w-full h-96 object-cover bg-[linear-gradient(#fcfefe_10%,#e0f1f2_40%)]"
      />
      <Container className="absolute inset-0 z-10 flex flex-col items-center justify-center text-basic-400 text-center">
        <Title as="h1" size="xl" className="mb-2">
          揪團
        </Title>
        <div className="mb-8">
          <Text size="sm" className="text-balance">
            想一起組織有趣的活動或學習小組嗎？
          </Text>
          <Text size="sm" className="text-balance">
            註冊並加入我們，然後創建你的活動，讓更多人一起參加！
          </Text>
        </div>
        <AuthButton size="lg" onClick={() => router.push("/circles/create")}>
          我想揪團
        </AuthButton>
      </Container>
    </div>
  );
}

function SearchForm() {
  const [query, setQuery] = useQueryState(circleSearchParamsSchema);
  const [inputKey, forceUpdateInputKey] = useReducer((prev) => prev + 1, 0);

  const handleMultipleChange =
    (key: keyof CircleSearchParamsSchema) => (options: OptionProps[]) => {
      setQuery({ ...query, [key]: options.map((item) => item.value) });
    };

  const formatOptions = (
    options: string[] | undefined,
    mapping: OptionProps[]
  ) => {
    if (!options) return [];
    return options.map((item) => ({
      value: item,
      label: mapping.find(({ value }) => value === item)?.label ?? item,
    }));
  };

  return (
    <>
      <div className="relative">
        <Input
          key={inputKey}
          type="search"
          name="search"
          placeholder="想尋找甚麼類型的揪團呢？"
          inputClassName="rounded-full pr-24"
          defaultValue={query.search}
          suffixIcon={<SearchIcon size={16} />}
          onSuffixIconClick={(search) => setQuery({ ...query, search })}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              setQuery({ ...query, search: e.currentTarget.value });
            }
          }}
        />
        <Speech
          variant="ghost"
          size="icon"
          className="absolute right-11 top-1/2 -translate-y-1/2 text-basic-300"
          onTranscriptEnd={(transcript) => {
            setQuery({ ...query, search: transcript });
            forceUpdateInputKey();
          }}
        />
      </div>
      <div className="flex flex-col items-center gap-2 md:flex-row">
        <MultipleSelector
          options={ALL_AREAS}
          placeholder="地點"
          maxSelected={5}
          onMaxSelected={() => toast.error("最多選擇 5 個地點")}
          value={formatOptions(query.area, ALL_AREAS)}
          onChange={handleMultipleChange("area")}
        />
        <MultipleSelector
          options={ACTIVITY_CATEGORIES}
          placeholder="揪團類型"
          maxSelected={5}
          onMaxSelected={() => toast.error("最多選擇 5 個揪團類型")}
          value={formatOptions(query.activityCategory, ACTIVITY_CATEGORIES)}
          onChange={handleMultipleChange("activityCategory")}
        />
        <MultipleSelector
          options={EDUCATION}
          placeholder="適合的學習階段"
          value={formatOptions(query.partnerEducationStep, EDUCATION)}
          onChange={handleMultipleChange("partnerEducationStep")}
        />
        <Label
          htmlFor="isEnded"
          className="flex items-center gap-1 text-nowrap py-3 ml-auto"
        >
          <Checkbox
            id="isEnded"
            checked={query.isGrouping === false}
            onCheckedChange={(checked) =>
              setQuery({ ...query, isGrouping: checked ? false : undefined })
            }
          />
          已結束
        </Label>
      </div>
      <div className="flex items-center gap-2">
        <Text size="sm" className="text-basic-400 shrink-0">
          學習領域
        </Text>
        <div className="flex gap-2 overflow-x-auto">
          <Badge
            variant={!query.category?.length ? "default" : "outline"}
            className="shrink-0 cursor-pointer"
            onClick={() => setQuery({ ...query, category: undefined })}
          >
            全部
          </Badge>
          {CATEGORIES.map(({ value, label }) => (
            <Badge
              key={value}
              variant={query.category?.includes(value) ? "default" : "outline"}
              className="shrink-0 cursor-pointer"
              onClick={() =>
                setQuery({
                  ...query,
                  category: query.category?.includes(value)
                    ? query.category.filter((item) => item !== value)
                    : [...(query.category || []), value],
                })
              }
            >
              {label}
            </Badge>
          ))}
        </div>
      </div>
    </>
  );
}

function CircleCard({ data }: { data: CircleSchema }) {
  const formatToString = (
    options: OptionProps[],
    values: string[],
    defaultValue = ""
  ) => {
    const mapping = Object.fromEntries(
      options.map((acc) => [acc.value, acc.label])
    );
    return Array.isArray(values)
      ? values.map((item) => mapping[item] ?? item).join("、")
      : mapping[values] ?? values ?? defaultValue;
  };

  return (
    <CustomLink
      className={cn(
        "relative block p-2 rounded-md bg-white text-basic-500 transition-[transform,box-shadow]",
        "hover:scale-105 hover:shadow-md hover:z-10"
      )}
      href={`/circles/${data._id}`}
    >
      <AspectRatio ratio={2 / 1} className="rounded overflow-hidden">
        <Image
          alt={data.photoAlt || "未放封面"}
          src={data.photoURL || emptyCoverPng}
          className="object-cover"
          fill
        />
      </AspectRatio>
      <div className="p-2.5 space-y-2.5">
        <Title size="sm" className="font-bold truncate">
          {data.title}
        </Title>
        <div className="text-xs space-y-1">
          <div className="flex items-center gap-1.5 h-3">
            <h3 className="shrink-0">學習領域</h3>
            <Separator orientation="vertical" className="bg-basic-500" />
            <p className="truncate">
              {formatToString(CATEGORIES, data.category, "不拘")}
            </p>
          </div>
          <div className="flex items-center gap-1.5 h-3">
            <h3 className="shrink-0">適合階段</h3>
            <Separator orientation="vertical" className="bg-basic-500" />
            <p className="truncate">
              {formatToString(EDUCATION, data.partnerEducationStep, "皆可")}
            </p>
          </div>
        </div>
        <div className="line-clamp-2 body-sm h-10">
          <MarkdownEditor
            value={data.content
              ?.split("\n")
              .filter((item) => item && !item.startsWith("!["))
              .slice(0, 1)
              .join("\n")}
            disabledProse
            suppressLinkDefaultPrevent
            readOnly
          />
        </div>
        <div className="flex items-center text-xs gap-1">
          <MapPin size={16} className="text-basic-400" />
          <p className="text-basic-300">
            {getOptionLabel(ALL_AREAS, data.area, TBD_OPTION.label)}
          </p>
        </div>
        <div className="flex items-center justify-between">
          <time className="text-xs font-light text-basic-300">
            {timeDuration(data.updatedDate)}
          </time>
          <Badge
            className={cn(
              "rounded py-1 px-1.5 font-bold text-xs before:content-[''] before:block before:size-1.5 before:rounded-full before:mr-1.5",
              data.isGrouping
                ? "bg-primary-lightest text-primary-base before:bg-primary-base"
                : "bg-basic-100 text-basic-300 before:bg-basic-300"
            )}
          >
            {data.isGrouping ? "揪團中" : "已結束"}
          </Badge>
        </div>
      </div>
    </CustomLink>
  );
}

function SkeletonCircleCard() {
  return (
    <div className="p-2">
      <AspectRatio ratio={2 / 1} className="rounded overflow-hidden">
        <Skeleton className="w-full h-full" />
      </AspectRatio>
      <div className="p-2.5 space-y-2.5">
        <Skeleton className="w-full h-6" />
        <div className="text-xs space-y-1">
          <div className="flex items-center gap-1.5 h-3">
            <h3>學習領域</h3>
            <Separator orientation="vertical" className="bg-basic-500" />
            <Skeleton className="w-16 h-3" />
          </div>
          <div className="flex items-center gap-1.5 h-3">
            <h3>適合階段</h3>
            <Separator orientation="vertical" className="bg-basic-500" />
            <Skeleton className="w-16 h-3" />
          </div>
        </div>
        <div className="line-clamp-2 body-sm h-10 space-y-2">
          <Skeleton className="w-full h-5" />
          <Skeleton className="w-1/2 h-5" />
        </div>
        <div className="flex items-center text-xs gap-1">
          <MapPin size={16} className="text-basic-400" />
          <Skeleton className="w-6 h-4" />
        </div>
        <div className="flex items-center justify-between">
          <Skeleton className="w-12 h-4" />
          <Skeleton className="w-16 h-6" />
        </div>
      </div>
    </div>
  );
}

function CircleList() {
  const isMedium = useMediaQuery("isMedium");
  const isLarge = useMediaQuery("isLarge");
  const [query] = useQueryState(circleSearchParamsSchema);
  const { data, isLoading, isValidating, hasMore, setSize } =
    useCircleList(query);

  const shouldShowSeparator = (index: number, totalLength: number) => {
    let columnsPerRow: number;

    if (!isMedium) columnsPerRow = 1;
    else if (!isLarge) columnsPerRow = 2;
    else columnsPerRow = 3;

    const itemsInLastRow = totalLength % columnsPerRow;
    const lastRowItems = itemsInLastRow === 0 ? columnsPerRow : itemsInLastRow;

    return index < totalLength - lastRowItems;
  };

  return (
    <>
      <Paper
        className="mb-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
        asChild
      >
        <ul>
          {!isLoading &&
            data.filter(Boolean).map((circle, index) => (
              <li key={circle._id}>
                <div className="m-0 md:m-4">
                  <CircleCard data={circle} />
                </div>
                {shouldShowSeparator(index, data.length) && (
                  <Separator
                    orientation="horizontal"
                    className="col-span-full"
                  />
                )}
              </li>
            ))}
          {(isLoading || isValidating) && (
            <>
              {["skeleton-1", "skeleton-2", "skeleton-3"]
                .slice(0, [true, isMedium, isLarge].filter(Boolean).length)
                .map((key) => (
                  <li key={key}>
                    <div className="m-0 md:m-4">
                      <SkeletonCircleCard />
                    </div>
                  </li>
                ))}
            </>
          )}
        </ul>
      </Paper>
      {hasMore && (
        <div className="pb-20 flex justify-center">
          <Button
            className="px-10"
            variant="outline"
            size="lg"
            onClick={() => setSize((prev) => prev + 1)}
          >
            顯示更多
          </Button>
        </div>
      )}
    </>
  );
}

// export const runtime = "experimental-edge";

// export const getServerSideProps = (async () => {
//   try {
//     const query = { page: 1, pageSize: 6 };
//     const circleList = await circleAPI.readList(query);

//     const jsonLd = JsonLdFactory.createGraph([
//       JsonLdFactory.createItemListBuilder()
//         .setName("揪團學習列表")
//         .setItems(circleList.data.map(createCircleJsonLd)),
//     ]);

//     return {
//       props: {
//         fallback: {
//           [getSerializeCircleInfiniteKey(query)]: [circleList],
//         },
//         jsonLd,
//       },
//     };
//   } catch (error) {
//     console.log(error);
//     return { props: {} };
//   }
// }) satisfies GetServerSideProps<{
//   fallback?: Record<string, CircleListResponseSchema[]>;
//   jsonLd?: JsonLdType;
// }>;

function CircleListPage({
  fallback,
  jsonLd,
}: {
  fallback?: Record<string, CircleListResponseSchema[]>;
  jsonLd?: JsonLdType;
}) {
  return (
    <SWRConfig value={{ fallback }}>
      <SEOConfig title="揪團學習列表｜島島阿學" jsonLd={jsonLd} />
      <Banner />
      <Background className="-mt-12">
        <Container className="mt-[inherit] relative z-10 pb-10">
          <Paper className="space-y-2 mb-6">
            <SearchForm />
          </Paper>
          <CircleList />
        </Container>
      </Background>
    </SWRConfig>
  );
}

export default CircleListPage;
