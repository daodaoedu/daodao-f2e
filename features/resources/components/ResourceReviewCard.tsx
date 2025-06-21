import React from "react";
import { format } from "date-fns";
import { Check, Ellipsis } from "lucide-react";
import { RecentResourceReviewSchema } from "@/services/resources/reviews/schema";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Rating } from "@/components/ui/rating";
import DefaultAvatar from "@/public/assets/icons/default-avatar.svg";
import CommentSvg from "@/public/assets/icons/comment.svg";
import ShellSvg from "@/public/assets/icons/shell.svg";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import CommentSection from "@/shared/components/Comment/CommentSection";
import { CommentType } from "@/services/comments";
import { cn } from "@/utils/cn";
import { MarkdownEditor } from "@/components/ui/markdown-editor";

interface ResourceReviewCardProps {
  review: RecentResourceReviewSchema;
}

export default function ResourceReviewCard({
  review,
}: ResourceReviewCardProps) {
  return (
    <Collapsible className="bg-primary-palest rounded-lg">
      <header className="flex mb-10 pt-10 px-10">
        <Avatar className="mt-1 mr-3 size-12">
          <AvatarImage src={review.user.photoURL || ""} />
          <AvatarFallback className="text-xl">
            <DefaultAvatar />
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col gap-1">
          <div className="flex items-center">
            <h2 className="body-md font-bold">{review.user.name}</h2>
            {review.user.roleList.length > 0 && (
              <Badge className="body-sm ml-3 px-2 rounded" variant="gray">
                {review.user.roleList[0]}
              </Badge>
            )}
          </div>
          <Rating readOnly value={review.avgRating} />
        </div>
      </header>
      <section className="mb-10 px-10">
        <div className="mb-6 flex flex-col gap-4">
          <h3 className="body-lg font-bold">內容特色</h3>
          <div className="flex mt-1 body-sm gap-2.5">
            {Object.entries(review.contentFeatures ?? {}).map(
              ([feature, enabled]) =>
                enabled ? (
                  <Badge key={feature}>
                    <Check
                      size={20}
                      className="-my-1 mr-1 rounded-full border-2 border-basic-white"
                    />
                    {feature}
                  </Badge>
                ) : null
            )}
          </div>
        </div>
        <div className="mb-6">
          <h3 className="body-lg font-bold">心得</h3>
          <div className="text-gray-700 whitespace-pre-line mb-4">
            <MarkdownEditor value={review.content} readOnly />
          </div>
        </div>
        <CollapsibleContent>
          <div className="mb-6 flex flex-col gap-4">
            <h3 className="body-lg font-bold">怎麼使用</h3>
            <div className="ml-6">
              <h4 className="mb-3 body-md font-bold">時間運用方式</h4>
              <p>每天學習 1-2 小時</p>
            </div>
            <div className="ml-6">
              <h4 className="mb-3 body-md font-bold">是否搭配運用資源</h4>
              <p>是，搭配線上課程</p>
            </div>
          </div>
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-3">
              <h3 className="body-lg font-bold">改變思維方式</h3>
              <Rating readOnly value={4} />
            </div>
            <div className="flex items-center gap-3">
              <h3 className="body-lg font-bold">實際解決問題</h3>
              <Rating readOnly value={4} />
            </div>
            <div className="flex items-center gap-3">
              <h3 className="body-lg font-bold">獲得新觀點</h3>
              <Rating readOnly value={4} />
            </div>
            <div className="flex items-center gap-3">
              <h3 className="body-lg font-bold">達成具體目標</h3>
              <Rating readOnly value={4} />
            </div>
          </div>
        </CollapsibleContent>
      </section>

      <footer className="flex justify-between items-center gap-2 px-10 text-basic-300">
        <div className="flex items-center gap-2">
          <CommentSvg />
          <span>{review.helpfulCount}</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <ShellSvg />
            <span>{review.likesCount}</span>
          </div>
          <time>
            {format(
              new Date(review.updatedAt ?? review.createdAt),
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
  );
}
