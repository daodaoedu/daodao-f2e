"use client";

import type { StaticImageData } from "next/image";
import ResourceBanner from "@/features/resources/components/ResourceBanner";
import { useRouter } from "@/shared/i18n/navigation";
import type { OptionProps } from "@/shared/ui/option";

interface ResourceBannerClientProps {
  title: string;
  content: string;
  image: string | StaticImageData;
  hotTags?: OptionProps[];
  length?: number;
  onCreateClick?: () => void;
}

export function ResourceBannerClient({
  title,
  content,
  image,
  hotTags,
  length,
  onCreateClick,
}: ResourceBannerClientProps) {
  const router = useRouter();

  const handleSearch = (value: string) => {
    router.push(`/resource/explore?query=${value}`);
  };

  return (
    <ResourceBanner
      title={title}
      content={content}
      image={image}
      hotTags={hotTags}
      length={length}
      onSearch={handleSearch}
      onCreateClick={onCreateClick}
    />
  );
}
