"use client";

import FacebookSvg from "@daodao/assets/images/social-icons/facebook.svg";
import LineSvg from "@daodao/assets/images/social-icons/line.svg";
import LinkedInSvg from "@daodao/assets/images/social-icons/linkedin.svg";
import ShareWindowsSvg from "@daodao/assets/images/social-icons/share_windows.svg";
import ThreadsSvg from "@daodao/assets/images/social-icons/threads.svg";
import XSvg from "@daodao/assets/images/social-icons/x.svg";
import { getShareAPI } from "@daodao/shared/lib/share";
import { Button } from "@daodao/ui/components/button";

interface ShareButtonsProps {
  title?: string;
  text?: string;
  url?: string;
  hashtag?: string;
  className?: string;
}

export const ShareButtons = ({
  title = "【我有一個島，它叫＿島】學習風格測驗｜島島阿學",
  text = "【我有一個島，它叫＿島】學習風格測驗｜島島阿學",
  url = "/quiz",
  hashtag = "#島島阿學",
  className,
}: ShareButtonsProps) => {
  const shareAPI = getShareAPI({ title, text, url, hashtag });

  return (
    <div className={className}>
      <div className="body-md mb-3 text-center font-bold">分享個人結果到</div>
      <div className="mx-2 mb-4 flex justify-between gap-2 text-basic-400">
        <Button variant="ghost" size="icon" className="size-12" onClick={shareAPI.facebookShare}>
          <FacebookSvg />
        </Button>
        <Button variant="ghost" size="icon" className="size-12" onClick={shareAPI.threadsShare}>
          <ThreadsSvg />
        </Button>
        <Button variant="ghost" size="icon" className="size-12" onClick={shareAPI.linkedinShare}>
          <LinkedInSvg />
        </Button>
        <Button variant="ghost" size="icon" className="size-12" onClick={shareAPI.xShare}>
          <XSvg />
        </Button>
        <Button variant="ghost" size="icon" className="size-12" onClick={shareAPI.lineShare}>
          <LineSvg />
        </Button>
        <Button variant="ghost" size="icon" className="size-12" onClick={shareAPI.nativeShare}>
          <ShareWindowsSvg />
        </Button>
      </div>
    </div>
  );
};
