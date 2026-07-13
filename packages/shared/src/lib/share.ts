"use client";

interface ShareAPIProps {
  url: string;
  title?: string;
  text?: string;
  nativeText?: string;
  hashtag?: string;
  files?: File[];
}

interface NativeShareOptions {
  files?: File[];
  nativeText?: string;
}

const isNativeShareOptions = (value: unknown): value is NativeShareOptions => {
  if (typeof value !== "object" || value === null) return false;
  return "files" in value || "nativeText" in value;
};

export function dataUrlToFile(dataUrl: string, filename: string): File | null {
  try {
    const [metadata = "", content = ""] = dataUrl.split(",");
    const mimeTypeStart = metadata.indexOf(":");
    const mimeTypeEnd = metadata.indexOf(";");
    const mimeType =
      mimeTypeStart >= 0 && mimeTypeEnd > mimeTypeStart
        ? metadata.slice(mimeTypeStart + 1, mimeTypeEnd)
        : "image/png";
    const byteString = atob(content);
    const bytes = new Uint8Array(byteString.length);

    for (let i = 0; i < byteString.length; i++) {
      bytes[i] = byteString.charCodeAt(i);
    }

    return new File([bytes], filename, { type: mimeType });
  } catch {
    return null;
  }
}

export function getShareAPI({
  url,
  title = "",
  text = "",
  nativeText = text,
  hashtag = "",
  files = [],
}: ShareAPIProps) {
  if (typeof window === "undefined") return {};

  const formattedUrl = new URL(url, window.location.origin).toString();

  const openInNewTab = (_url: string) => () => {
    window.open(_url, "_blank", "noopener,noreferrer");
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(formattedUrl);
      return true;
    } catch {
      return false;
    }
  };

  const nativeShare = async (options?: unknown) => {
    if (!navigator.share) return false;

    const shareOptions = isNativeShareOptions(options) ? options : {};
    const shareFiles = shareOptions.files ?? files;
    const shareText = shareOptions.nativeText ?? nativeText;
    const fileShareData: ShareData = {
      title,
      text: shareText,
      url: formattedUrl,
      files: shareFiles,
    };

    if (
      shareFiles.length > 0 &&
      navigator.canShare?.({ files: shareFiles }) &&
      navigator.canShare(fileShareData)
    ) {
      await navigator.share(fileShareData);
      return true;
    }

    await navigator.share({ title, text: shareText, url: formattedUrl });
    return true;
  };

  const facebookShare = openInNewTab(
    `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(formattedUrl)}&source_surface=external_reshare&display=popup&hashtag=${encodeURIComponent(hashtag)}`
  );

  const lineShare = openInNewTab(
    `https://line.me/R/share?text=${encodeURIComponent(`${text}\n${formattedUrl}`)}`
  );

  const linkedinShare = openInNewTab(
    `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(formattedUrl)}`
  );

  const threadsShare = openInNewTab(
    `https://threads.net/intent/post?text=${encodeURIComponent(`${text}\n${formattedUrl}`)}`
  );

  const xShare = openInNewTab(
    `https://x.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(formattedUrl)}${hashtag ? `&hashtags=${encodeURIComponent(hashtag.replace("#", ""))}` : ""}`
  );

  return {
    copyLink,
    facebookShare,
    lineShare,
    linkedinShare,
    nativeShare,
    threadsShare,
    xShare,
  };
}
