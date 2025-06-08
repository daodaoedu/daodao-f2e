import type { InferGetServerSidePropsType, GetServerSideProps } from "next";
import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import { Clock, Share2, Globe, Ellipsis, Mail, Plus } from "lucide-react";

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

export default function ResourceDetail({
  resource,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  if (!resource) {
    return <NotExist />;
  }

  return (
    <div className="bg-primary-palest min-h-screen">
      <div className="container mx-auto px-4 pt-2 pb-12">
        <Breadcrumb>
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

        <div className="p-10 bg-white shadow-md rounded-xl mt-4 mb-12 flex flex-col md:flex-row gap-8">
          <div className="flex-1 flex flex-col justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-4">
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
                <div className="flex items-center gap-1">
                  <span className="font-medium">適合</span>
                  <Separator orientation="vertical" />
                  <span className="text-primary">
                    {resource.targetAudience}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="font-medium">資源類型</span>
                  <Separator orientation="vertical" />
                  <span className="text-primary">{resource.resourceType}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">所需學習時間</span>
                  <Separator orientation="vertical" />
                  <span className="text-primary">
                    {resource.learningDuration || "12 小時"}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="font-medium">影片時長</span>
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

        <div className="pt-4 bg-white shadow rounded-xl">
          <Tabs defaultValue="introduction">
            <TabsList className="flex gap-12 px-12 border-b border-solid border-basic-200">
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

            <TabsContent value="introduction" className="p-10">
              <div className="mb-10">{resource.description}</div>
              <div className="mb-10 aspect-[1120/633]">
                <iframe
                  className="w-full h-full rounded-lg"
                  width="560"
                  height="315"
                  src="https://www.youtube.com/embed/4n66brdz1GY?si=afNRjAb0endaKIxG"
                  title="YouTube video player"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                />
              </div>
              <div className="flex items-center gap-6">
                <p>
                  分享時間
                  <time
                    className="pl-2"
                    dateTime={new Date(resource.createdAt).toISOString()}
                  >
                    {format(
                      new Date(resource.createdAt),
                      "yyyy.MM.dd HH:mm:ss"
                    )}
                  </time>
                </p>
                {resource.updatedAt && (
                  <p>
                    更新時間
                    <time
                      className="pl-2"
                      dateTime={new Date(resource.updatedAt).toISOString()}
                    >
                      {format(
                        new Date(resource.updatedAt),
                        "yyyy.MM.dd HH:mm:ss"
                      )}
                    </time>
                  </p>
                )}
              </div>
            </TabsContent>

            <TabsContent value="reviews" className="p-10">
              <div className="flex flex-col items-center gap-10">
                {resource.recentReviews && resource.recentReviews.length > 0 ? (
                  <div className="space-y-6">
                    {resource.recentReviews.map(
                      (review: RecentResourceReviewSchema) => (
                        <div key={review.id} className="border rounded-lg p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <Avatar>
                                <AvatarImage src={review.user.photoURL || ""} />
                                <AvatarFallback>
                                  {review.user.name.slice(0, 2)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">
                                  {review.user.name}
                                </p>
                                <p className="text-sm text-gray-500">
                                  {format(
                                    new Date(review.createdAt),
                                    "yyyy-MM-dd"
                                  )}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="text-yellow-500 font-medium">
                                {review.avgRating}
                              </span>
                              <span className="text-gray-500">/5</span>
                            </div>
                          </div>
                          <h3 className="font-medium mb-2">{review.title}</h3>
                          {/* review.content might not be available in the recent reviews schema */}
                          <p className="text-gray-700 whitespace-pre-line">
                            {/* We would need to fetch the full review to get the content */}
                            {/* Placeholder text */}
                            查看完整心得...
                          </p>
                        </div>
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

            <TabsContent value="contributor" className="p-10">
              <div className="bg-primary-palest p-10 rounded-lg">
                <h2 className="mb-10 heading-md">關於分享者</h2>

                <div className="mb-6 flex items-center justify-between">
                  <div className="flex">
                    <Avatar className="mt-1 mr-3 size-12">
                      <AvatarImage src={resource.user.photoURL || ""} />
                      <AvatarFallback className="text-xl">
                        {resource.user.name.slice(0, 2)}
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
      </div>
    </div>
  );
}
