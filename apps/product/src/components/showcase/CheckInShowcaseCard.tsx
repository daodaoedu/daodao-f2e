"use client";

import type { BatchReactionItem, IShowcaseCheckIn } from "@daodao/api";
import { DefaultAvatarSvg, DialogOutlineSvg, FlagOutlineSvg } from "@daodao/assets";
import { useRouter } from "@daodao/i18n/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@daodao/ui/components/avatar";
import { Button } from "@daodao/ui/components/button";
import { MoreHorizontal } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { CheckInCard } from "@/components/check-in/display/check-in-card";
import { ReactionPickerButton } from "@/components/check-in/reactions";
import type { ApiMoodType } from "@/constants/mood";
import { MOOD_OPTIONS, mapApiMoodToMoodType } from "@/constants/mood";
import { useCardReactions } from "@/hooks/use-card-reactions";

type CheckInShowcaseCardProps = IShowcaseCheckIn & {
  batchReactionData?: BatchReactionItem;
  onReactionMutate?: () => void;
};

export function CheckInShowcaseCard(props: CheckInShowcaseCardProps) {
  const {
    id,
    checkin_date,
    mood,
    note,
    tags,
    image_urls,
    practice,
    user,
    comment_count,
    comment_preview,
    batchReactionData,
    onReactionMutate,
  } = props;

  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [menuOpen]);

  const frontendMood = mapApiMoodToMoodType(mood as ApiMoodType);
  const moodOption = frontendMood ? MOOD_OPTIONS.find((m) => m.id === frontendMood) : null;
  const MoodEmoji = moodOption?.emoji;

  const { selectedReactions, totalCount, displayReactions, handleToggle, firstReactorName } =
    useCardReactions("checkin", id, batchReactionData, onReactionMutate);

  const handleCardClick = () => {
    router.push(`/practices/${practice.id}/check-ins/${id}`);
  };

  return (
    // biome-ignore lint/a11y/useKeyWithClickEvents: card click for navigation
    // biome-ignore lint/a11y/noStaticElementInteractions: card click for navigation
    <div
      className="rounded-xl overflow-hidden cursor-pointer shadow-sm hover:shadow-md hover:ring-2 hover:ring-logo-cyan transition-all duration-200"
      onClick={handleCardClick}
    >
      {/* ======= 上方：封面區（teal 背景 + 底部漸層） =======
          - 有上傳照片 → 顯示第一張照片作為封面
          - 無照片     → 顯示筆記本風格的打卡卡片預覽（同「分享打卡」圖）
      */}
      <div className="relative bg-logo-cyan overflow-hidden">
        {image_urls && image_urls.length > 0 ? (
          /* 有照片：直接顯示第一張圖片 */
          <div className="h-[240px] w-full overflow-hidden">
            <img src={image_urls[0]} alt="打卡封面" className="w-full h-full object-cover" />
          </div>
        ) : (
          /* 無照片：顯示打卡卡片預覽（同分享打卡圖樣式） */
          <div className="max-h-[240px] overflow-hidden pointer-events-none select-none pt-8">
            <CheckInCard
              taskTitle={practice.title}
              date={checkin_date}
              mood={frontendMood}
              content={note}
              tags={tags ?? []}
              images={[]}
              titleClassName="hidden"
              showTape={false}
            />
          </div>
        )}

        {/* 底部漸層：透明 → logo-cyan */}
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-b from-transparent to-logo-cyan pointer-events-none" />
      </div>

      {/* ======= 下方：社群資訊區（白色） ======= */}
      <div className="bg-white px-5 pt-4 pb-5 flex flex-col gap-4">
        {/* 用戶列 */}
        <div className="relative flex gap-4 items-start">
          {/* 頭像 */}
          <div className="shrink-0 size-16">
            <Avatar className="size-16">
              {user?.photo_url && <AvatarImage src={user.photo_url} alt={user.name} />}
              <AvatarFallback>
                <DefaultAvatarSvg />
              </AvatarFallback>
            </Avatar>
          </div>

          {/* 心情 badge（疊在頭像右下角，相對於整行容器定位） */}
          {MoodEmoji && (
            <div className="absolute left-[45px] top-[40px] size-6 z-10">
              <MoodEmoji className="size-6" />
            </div>
          )}

          {/* 文字內容 */}
          <div className="flex-1 min-w-0 flex flex-col gap-2">
            <p className="text-sm text-light-gray whitespace-nowrap">{checkin_date}</p>
            <p className="text-base text-text-dark line-clamp-2">{note}</p>
          </div>

          {/* 三點選單按鈕 */}
          {/* biome-ignore lint/a11y/useKeyWithClickEvents: stop card click */}
          {/* biome-ignore lint/a11y/noStaticElementInteractions: stop card click */}
          <div
            ref={menuRef}
            className="absolute right-0 top-[-10px]"
            onClick={(e) => e.stopPropagation()}
          >
            <Button
              type="button"
              size="icon"
              variant="ghost"
              onClick={() => setMenuOpen((v) => !v)}
              className="size-10 rounded-full hover:bg-bg-gray"
            >
              <MoreHorizontal className="size-5 text-text-dark" />
            </Button>

            {menuOpen && (
              <div className="absolute right-0 top-full mt-1 bg-white rounded-2xl shadow-lg border border-[#E4EAE9] py-2 z-20 min-w-[140px]">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setMenuOpen(false);
                    window.open("https://tally.so/r/BzGQy4", "_blank");
                  }}
                  className="w-full h-auto justify-start rounded-none gap-3 px-4 py-3 text-sm text-[#295E5C] hover:bg-[#F0F9F8] transition-colors cursor-pointer"
                >
                  <FlagOutlineSvg className="size-5 shrink-0" />
                  <span>檢舉</span>
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* 分隔線 */}
        <div className="border-t border-basic-200" />

        {/* 互動列（Reaction + 留言） */}
        {/* biome-ignore lint/a11y/useKeyWithClickEvents: stop card click */}
        {/* biome-ignore lint/a11y/noStaticElementInteractions: stop card click */}
        <div className="flex items-center justify-between h-8" onClick={(e) => e.stopPropagation()}>
          <ReactionPickerButton
            selectedReactions={selectedReactions}
            onToggle={handleToggle}
            variant="summary"
            totalCount={totalCount}
            displayReactions={displayReactions}
            firstReactorName={firstReactorName}
          />

          <div className="flex items-center gap-1.5 text-light-gray">
            <DialogOutlineSvg className="size-6" />
            {(comment_count ?? 0) > 0 && (
              <span className="text-sm font-medium">{comment_count}</span>
            )}
          </div>
        </div>

        {/* 留言預覽 */}
        {comment_preview && comment_preview.length > 0 && (
          // biome-ignore lint/a11y/useKeyWithClickEvents: stop card click
          // biome-ignore lint/a11y/noStaticElementInteractions: stop card click
          <div
            className="flex flex-col gap-2 border-t border-basic-200 pt-3"
            onClick={(e) => e.stopPropagation()}
          >
            {comment_preview.map((comment) => (
              <div key={comment.id} className="flex items-start gap-2">
                <Avatar className="size-6 shrink-0 mt-0.5">
                  {comment.user?.photo_url && (
                    <AvatarImage src={comment.user.photo_url} alt={comment.user.name} />
                  )}
                  <AvatarFallback className="text-[10px] font-medium text-text-dark bg-primary-palest">
                    {(comment.user?.name ?? "?").slice(0, 1)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-semibold text-primary-darker mr-1.5">
                    {comment.user?.name ?? "匿名"}
                  </span>
                  <span className="text-xs text-text-dark line-clamp-1">{comment.content}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
