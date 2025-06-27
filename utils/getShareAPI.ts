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

  const openInNewTab = (_url: string) => () => window.open(_url, "_blank");

  const nativeShare = () => navigator.share({ title, text, url });

  const facebookShare = openInNewTab(
    `https://www.facebook.com/sharer/sharer.php?u=${url}&source_surface=external_reshare&display=popup&hashtag=${hashtag}`
  );

  const lineShare = openInNewTab(
    `https://social-plugins.line.me/lineit/share?url=${url}`
  );

  const linkedinShare = openInNewTab(
    `https://www.linkedin.com/sharing/share-offsite/?url=${url}&text=${text}`
  );

  const threadsShare = openInNewTab(
    `https://threads.net/intent/post?text=${url}`
  );

  const xShare = openInNewTab(`https://x.com/intent/tweet?text=${url}`);

  return {
    facebookShare,
    lineShare,
    linkedinShare,
    nativeShare,
    threadsShare,
    xShare,
  };
}
