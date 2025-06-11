import type { InferGetServerSidePropsType, GetServerSideProps } from "next";
import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import { Share2, Globe, Ellipsis, Mail, Plus, Star, Check } from "lucide-react";

import DefaultAvatar from "@/public/assets/icons/default-avatar.svg";
import GroupSvg from "@/public/assets/icons/group.svg";
import BoxSvg from "@/public/assets/icons/box.svg";
import VideoSvg from "@/public/assets/icons/video.svg";
import CommentSvg from "@/public/assets/icons/comment.svg";
import ShellSvg from "@/public/assets/icons/shell.svg";
import { resourceAPI } from "@/services/resources/core/api";
import { ResourceDetailResponseSchema } from "@/services/resources/core/schema";
import { RecentResourceReviewSchema } from "@/services/resources/reviews/schema";
import { Button } from "@/components/atoms/button";
import { Badge } from "@/components/atoms/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/atoms/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/atoms/avatar";
import { Separator } from "@/components/atoms/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/atoms/breadcrumb";
import { parseToNumber } from "@/utils/helper";
import NotExist from "@/shared/components/NotExist";
import CommentSection from "@/shared/components/Comment/CommentSection";
import { CommentType } from "@/services/comments";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/atoms/collapsible";
import { cn } from "@/utils/cn";

export const getServerSideProps = (async (context) => {
  const resourceId = parseToNumber(context.params?.resourceId);

  try {
    if (typeof resourceId !== "number") {
      return {
        notFound: true,
      };
    }

    const resource = await resourceAPI.read(resourceId);

    return {
      props: {
        resource,
      },
    };
  } catch (error) {
    console.error("Failed to fetch resource:", error);
    return {
      notFound: true,
    };
  }
}) satisfies GetServerSideProps<{
  resource?: ResourceDetailResponseSchema;
  notFound?: boolean;
}>;

// 星級評分組件
const StarRating = ({ rating }: { rating: number }) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating - fullStars >= 0.5;
  const maxStars = 5;
  return (
    <div className="flex">
      {Array.from({ length: maxStars }, (_, i) => (
        <Star
          key={`star-${rating}-${i}`}
          size={16}
          className={`${
            i < fullStars
              ? "text-yellow-400 fill-yellow-400"
              : i === fullStars && hasHalfStar
              ? "text-yellow-400"
              : "text-gray-300"
          }`}
        />
      ))}
    </div>
  );
};

export default function ResourceDetail({
  resource,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  if (!resource) {
    return <NotExist />;
  }

  return (
    <div className="bg-primary-palest min-h-screen">
      <div className="container mx-auto px-4 pb-12 pt-11 md:pt-12">
        <Breadcrumb className="mb-5 md:mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/find-resource">找資源</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink
                href={`/find-resource?category=${resource.majorCategory}`}
              >
                {resource.majorCategory}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink
                href={`/find-resource?category=${resource.subCategory}`}
              >
                {resource.subCategory}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{resource.resourceName}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="p-10 bg-white shadow-md rounded-xl mt-4 mb-11 flex flex-col md:mb-12 md:flex-row gap-8">
          <div className="flex-1 flex flex-col justify-between">
            <div>
              <h1 className="heading-lg font-bold mb-4">
                {resource.resourceName}
              </h1>

              <div className="flex flex-wrap gap-2 mb-4">
                {resource.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-primary">
                    # {tag}
                  </Badge>
                ))}
              </div>

              <div className="flex flex-wrap gap-x-6 gap-y-4 mb-6 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <span className="font-medium flex items-center gap-2">
                    <GroupSvg />
                    適合
                  </span>
                  <Separator orientation="vertical" />
                  <span className="text-primary">
                    {resource.targetAudience}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium flex items-center gap-2">
                    <BoxSvg />
                    資源類型
                  </span>
                  <Separator orientation="vertical" />
                  <span className="text-primary">{resource.resourceType}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium flex items-center gap-2">
                    <VideoSvg />
                    影片時長
                  </span>
                  <Separator orientation="vertical" />
                  <span className="text-basic-400">08 小時 24 分</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Button size="lg">
                <Globe size={16} />
                查看資源
              </Button>
              <Button size="lg">
                <Share2 size={16} />
              </Button>
              <Button variant="light" size="icon">
                <Ellipsis size={16} />
              </Button>
            </div>
          </div>

          <div className="relative md:basis-80 aspect-[320/241] rounded-lg overflow-hidden">
            <Image
              src={resource.resourceImgUrl ?? ""}
              alt={resource.resourceName}
              className="object-cover"
              fill
              priority
            />
          </div>
        </div>
        <div className="bg-white shadow rounded-xl">
          <Tabs defaultValue="introduction">
            <TabsList>
              <TabsTrigger value="introduction" className="basis-1/3">
                介紹
              </TabsTrigger>
              <TabsTrigger value="reviews" className="basis-1/3">
                心得 ({resource.reviewCount || 0})
              </TabsTrigger>
              <TabsTrigger value="contributor" className="basis-1/3">
                分享者資訊
              </TabsTrigger>
            </TabsList>

            <Separator />

            <TabsContent value="introduction">
              <div className="mb-10">{resource.description}</div>
              {resource.introVideoUrl && (
                <div className="mb-10 aspect-[1120/633]">
                  <iframe
                    className="w-full h-full rounded-lg"
                    width="560"
                    height="315"
                    src={resource.introVideoUrl}
                    title="YouTube video player"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                  />
                </div>
              )}
              <div className="flex justify-end items-center gap-4">
                <div className="flex items-center gap-2">
                  <ShellSvg />
                  <span>{resource.favoriteCount}</span>
                </div>
                <time>
                  {format(
                    new Date(resource.updatedAt ?? resource.createdAt),
                    "yyyy/MM/dd"
                  )}
                </time>
              </div>
            </TabsContent>

            <TabsContent value="reviews">
              <div className="flex flex-col items-center gap-10">
                {resource.recentReviews && resource.recentReviews.length > 0 ? (
                  <div className="space-y-10 w-full">
                    {resource.recentReviews.map(
                      (review: RecentResourceReviewSchema) => (
                        <Collapsible
                          key={review.id}
                          className="bg-primary-palest rounded-lg"
                        >
                          <header className="flex mb-10 pt-10 px-10">
                            <Avatar className="mt-1 mr-3 size-12">
                              <AvatarImage src={resource.user.photoURL || ""} />
                              <AvatarFallback className="text-xl">
                                <DefaultAvatar />
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center">
                                <h2 className="body-md font-bold">
                                  {review.user.name}
                                </h2>
                                {review.user.roleList.length > 0 && (
                                  <Badge
                                    className="body-sm ml-3 px-2 rounded"
                                    variant="gray"
                                  >
                                    {review.user.roleList[0]}
                                  </Badge>
                                )}
                              </div>
                              <StarRating rating={review.avgRating} />
                            </div>
                          </header>
                          <section className="mb-10 px-10">
                            <div className="mb-6 flex flex-col gap-4">
                              <h3 className="body-lg font-bold">內容特色</h3>
                              <div className="flex mt-1 body-sm gap-2.5">
                                {Array.isArray(review.tags) &&
                                  review.tags.map((tag) => (
                                    <Badge>
                                      <Check
                                        size={20}
                                        className="-my-1 mr-1 rounded-full border-2 border-basic-white"
                                      />
                                      {tag}
                                    </Badge>
                                  ))}
                              </div>
                            </div>
                            <div className="mb-6">
                              <h3 className="body-lg font-bold">心得</h3>
                              <div className="text-gray-700 whitespace-pre-line mb-4">
                                <p>{review.title}</p>
                              </div>
                            </div>
                            <CollapsibleContent>
                              <div className="mb-6 flex flex-col gap-4">
                                <h3 className="body-lg font-bold">怎麼使用</h3>
                                <div className="ml-6">
                                  <h4 className="mb-3 body-md font-bold">
                                    時間運用方式
                                  </h4>
                                  <p>每天學習 1-2 小時</p>
                                </div>
                                <div className="ml-6">
                                  <h4 className="mb-3 body-md font-bold">
                                    是否搭配運用資源
                                  </h4>
                                  <p>是，搭配線上課程</p>
                                </div>
                              </div>
                              <div className="flex flex-col gap-6">
                                <div className="flex items-center gap-3">
                                  <h3 className="body-lg font-bold">
                                    改變思維方式
                                  </h3>
                                  <StarRating rating={4} />
                                </div>
                                <div className="flex items-center gap-3">
                                  <h3 className="body-lg font-bold">
                                    實際解決問題
                                  </h3>
                                  <StarRating rating={4} />
                                </div>
                                <div className="flex items-center gap-3">
                                  <h3 className="body-lg font-bold">
                                    獲得新觀點
                                  </h3>
                                  <StarRating rating={4} />
                                </div>
                                <div className="flex items-center gap-3">
                                  <h3 className="body-lg font-bold">
                                    達成具體目標
                                  </h3>
                                  <StarRating rating={4} />
                                </div>
                              </div>
                            </CollapsibleContent>
                          </section>

                          <footer className="flex justify-between items-center gap-2 px-10 text-basic-300">
                            <div className="flex items-center gap-2">
                              <CommentSvg />
                              <span>{review.helpfulCount}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-2">
                                <ShellSvg />
                                <span>{review.likesCount}</span>
                              </div>
                              <time>
                                {format(
                                  new Date(
                                    review.updatedAt ?? review.createdAt
                                  ),
                                  "yyyy/MM/dd"
                                )}
                              </time>
                              <Button variant="light" size="icon">
                                <Ellipsis size={16} />
                              </Button>
                            </div>
                          </footer>

                          <div className="px-5">
                            <CommentSection
                              targetId={review.id}
                              targetType={CommentType.ResourceReview}
                            />
                          </div>

                          <CollapsibleTrigger
                            className={cn(
                              "w-full flex flex-row-reverse justify-center gap-1 mt-10 p-3",
                              "body-md rounded-b-lg bg-primary-lightest hover:bg-primary-lightest/80"
                            )}
                            withIcon
                            expandLabel="展開"
                            collapseLabel="收合"
                          />
                        </Collapsible>
                      )
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12 text-basic-400">
                    目前還沒有人留下心得，成為第一個吧！
                  </div>
                )}
                <Button size="lg">
                  <Plus size={15} />
                  分享心得
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="contributor">
              <div className="bg-primary-palest p-10 rounded-lg">
                <h2 className="mb-10 heading-md">關於分享者</h2>

                <div className="mb-6 flex items-center justify-between">
                  <div className="flex">
                    <Avatar className="mt-1 mr-3 size-12">
                      <AvatarImage src={resource.user.photoURL || ""} />
                      <AvatarFallback className="text-xl">
                        <DefaultAvatar />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center">
                        <h2 className="body-md font-bold">使用者名稱</h2>
                        <Badge
                          className="body-sm ml-3 px-2 rounded"
                          variant="gray"
                        >
                          身份
                        </Badge>
                      </div>
                      <span className="body-sm">教育工作者</span>
                    </div>
                  </div>

                  <Button size="lg">
                    <Mail size={15} />
                    聯繫分享者
                  </Button>
                </div>

                <div className="flex-1">
                  <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
                    <div className="flex flex-wrap gap-2">
                      {["民主教育", "議事規則", "數理科學", "程式"].map(
                        (tag) => (
                          <Badge variant="outline" className="text-primary">
                            # {tag}
                          </Badge>
                        )
                      )}
                    </div>
                  </div>
                  <div>
                    <h3 className="mb-2 body-lg font-bold text-basic-500">
                      簡介
                    </h3>
                    <p className="mb-2 text-basic-500">
                      個人簡介個人簡介個人簡介個人簡介個人簡介個人簡介個人簡介個人簡介個人簡介個人簡介個人簡介個人簡介個人簡介個人簡介個人簡介個人簡介個人簡介個人簡介個人簡介個人簡介個人簡介個人簡介
                    </p>
                    <Button
                      type="button"
                      variant="link"
                      className="-mx-2 px-2"
                      asChild
                    >
                      <Link href="/partner/detail?id=2ebb18d5-84da-4289-99d8-57a12a885115">
                        了解更多
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
        <h3 className="heading-lg mt-12">留言</h3>
        <div className="-mx-4">
          <CommentSection
            targetId={resource.id}
            targetType={CommentType.Resource}
          />
        </div>
      </div>
    </div>
  );
}
