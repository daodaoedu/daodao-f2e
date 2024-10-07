export default function getShareApi({
  title = '',
  text = '',
  url = '',
  hashtag = '',
}) {
  const openInNewTab = (_url) => () => window.open(_url, '_blank');

  const nativeShare = () => {
    if (!navigator?.share) return;
    navigator.share({ title, text, url });
  };

  const facebookShare = openInNewTab(
    `https://www.facebook.com/sharer/sharer.php?u=${url}&source_surface=external_reshare&display=popup&hashtag=${hashtag}`,
  );

  const lineShare = openInNewTab(
    `https://social-plugins.line.me/lineit/share?url=${url}`,
  );

  const linkedinShare = openInNewTab(
    `https://www.linkedin.com/sharing/share-offsite/?url=${url}&text=${text}`,
  );

  const threadsShare = openInNewTab(
    `https://threads.net/intent/post?text=${url}`,
  );

  const xShare = openInNewTab(`https://x.com/intent/tweet?text=${url}`);

  return {
    hasNativeShare: !!navigator?.share,
    facebookShare,
    lineShare,
    linkedinShare,
    nativeShare,
    threadsShare,
    xShare,
  };
}
