"use client";

import getEnv from "@/shared/config/env";
import { GACategory, logEvent } from "@/shared/lib/analytics";

interface ShareAPIProps {
  url: string;
  title?: string;
  text?: string;
  hashtag?: string;
}

export function getShareAPI({ url, title = "", text = "", hashtag = "" }: ShareAPIProps) {
  if (getEnv().isServerSide) return {};

  const formattedUrl = url.startsWith("https://") ? url : `${window.location.origin}${url}`;

  const openInNewTab = (social: string, _url: string) => () => {
    logEvent(GACategory.Share, `Share to ${social}`, `Share URL: ${_url}`);
    window.open(_url, "_blank");
  };

  const nativeShare = () => {
    logEvent(GACategory.Share, "Share to Native", `Share URL: ${formattedUrl}`);
    navigator.share({ title, text, url: formattedUrl });
  };

  const facebookShare = openInNewTab(
    "Facebook",
    `https://www.facebook.com/sharer/sharer.php?u=${formattedUrl}&source_surface=external_reshare&display=popup&hashtag=${hashtag}`
  );

  const lineShare = openInNewTab(
    "LINE",
    `https://social-plugins.line.me/lineit/share?url=${formattedUrl}`
  );

  const linkedinShare = openInNewTab(
    "LinkedIn",
    `https://www.linkedin.com/sharing/share-offsite/?url=${formattedUrl}&text=${text}`
  );

  const threadsShare = openInNewTab(
    "Threads",
    `https://threads.net/intent/post?text=${formattedUrl}`
  );

  const xShare = openInNewTab("X", `https://x.com/intent/tweet?text=${formattedUrl}`);

  return {
    facebookShare,
    lineShare,
    linkedinShare,
    nativeShare,
    threadsShare,
    xShare,
  };
}
