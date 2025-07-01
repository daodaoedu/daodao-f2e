import { GACategory, logEvent } from "./analytics";
import getEnv from "./env";

interface ShareAPIProps {
  url: string;
  title?: string;
  text?: string;
  hashtag?: string;
}

export default function getShareAPI({
  url,
  title = "",
  text = "",
  hashtag = "",
}: ShareAPIProps) {
  if (getEnv().isServerSide) return {};

  const openInNewTab = (social: string, _url: string) => () => {
    logEvent(GACategory.Share, `Share to ${social}`, `Share URL: ${_url}`);
    window.open(_url, "_blank");
  };

  const nativeShare = () => {
    logEvent(GACategory.Share, "Share to Native", `Share URL: ${url}`);
    navigator.share({ title, text, url });
  };

  const facebookShare = openInNewTab(
    "Facebook",
    `https://www.facebook.com/sharer/sharer.php?u=${url}&source_surface=external_reshare&display=popup&hashtag=${hashtag}`
  );

  const lineShare = openInNewTab(
    "LINE",
    `https://social-plugins.line.me/lineit/share?url=${url}`
  );

  const linkedinShare = openInNewTab(
    "LinkedIn",
    `https://www.linkedin.com/sharing/share-offsite/?url=${url}&text=${text}`
  );

  const threadsShare = openInNewTab(
    "Threads",
    `https://threads.net/intent/post?text=${url}`
  );

  const xShare = openInNewTab("X", `https://x.com/intent/tweet?text=${url}`);

  return {
    facebookShare,
    lineShare,
    linkedinShare,
    nativeShare,
    threadsShare,
    xShare,
  };
}
