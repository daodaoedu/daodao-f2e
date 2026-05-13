"use client";

interface ShareAPIProps {
  url: string;
  title?: string;
  text?: string;
  nativeText?: string;
  hashtag?: string;
}

export function getShareAPI({
  url,
  title = "",
  text = "",
  nativeText = text,
  hashtag = "",
}: ShareAPIProps) {
  if (typeof window === "undefined") return {};

  const formattedUrl = url.startsWith("https://") ? url : `${window.location.origin}${url}`;

  const openInNewTab = (_url: string) => () => {
    window.open(_url, "_blank", "noopener,noreferrer");
  };

  const nativeShare = () => {
    navigator.share({ title, text: nativeText, url: formattedUrl });
  };

  const facebookShare = openInNewTab(
    `https://www.facebook.com/sharer/sharer.php?u=${formattedUrl}&source_surface=external_reshare&display=popup&hashtag=${hashtag}`
  );

  const lineShare = openInNewTab(`https://social-plugins.line.me/lineit/share?url=${formattedUrl}`);

  const linkedinShare = openInNewTab(
    `https://www.linkedin.com/sharing/share-offsite/?url=${formattedUrl}&text=${text}`
  );

  const threadsShare = openInNewTab(`https://threads.net/intent/post?text=${formattedUrl}`);

  const xShare = openInNewTab(`https://x.com/intent/tweet?text=${formattedUrl}`);

  return {
    facebookShare,
    lineShare,
    linkedinShare,
    nativeShare,
    threadsShare,
    xShare,
  };
}
