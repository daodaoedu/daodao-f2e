"use client";

import { RotateCcw, XIcon, ZoomIn, ZoomOut } from "lucide-react";
import * as React from "react";
import { Dialog, DialogContent, DialogTitle } from "./animate-ui/components/radix/dialog";
import { Button } from "./button";
import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "./carousel";
import { Image } from "./image";

interface ImageLightboxProps {
  images: string[];
  initialIndex?: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ImageLightbox = ({
  images,
  initialIndex = 0,
  open,
  onOpenChange,
}: ImageLightboxProps) => {
  const [api, setApi] = React.useState<CarouselApi>();
  const [scale, setScale] = React.useState(1);
  const [currentIndex, setCurrentIndex] = React.useState(initialIndex);
  const imageRef = React.useRef<HTMLDivElement>(null);

  const MIN_SCALE = 1;
  const MAX_SCALE = 5;
  const SCALE_STEP = 0.5;

  React.useEffect(() => {
    if (!api || !open) {
      return;
    }

    api.scrollTo(initialIndex);
    setCurrentIndex(initialIndex);
  }, [api, initialIndex, open]);

  // 當切換圖片時重置縮放
  React.useEffect(() => {
    if (!api) {
      return;
    }

    const handleSelect = () => {
      const selectedIndex = api.selectedScrollSnap();
      setCurrentIndex(selectedIndex);
      setScale(MIN_SCALE);
    };

    api.on("select", handleSelect);

    return () => {
      api.off("select", handleSelect);
    };
  }, [api]);

  const handleClose = React.useCallback(() => {
    setScale(MIN_SCALE);
    onOpenChange(false);
  }, [onOpenChange]);

  const handleZoomIn = React.useCallback(() => {
    setScale((prev) => Math.min(prev + SCALE_STEP, MAX_SCALE));
  }, []);

  const handleZoomOut = React.useCallback(() => {
    setScale((prev) => Math.max(prev - SCALE_STEP, MIN_SCALE));
  }, []);

  const handleResetZoom = React.useCallback(() => {
    setScale(MIN_SCALE);
  }, []);

  const handleDoubleClick = React.useCallback(() => {
    if (scale === MIN_SCALE) {
      setScale(2);
    } else {
      setScale(MIN_SCALE);
    }
  }, [scale]);

  const handleWheel = React.useCallback((e: React.WheelEvent<HTMLDivElement>) => {
    if (!e.ctrlKey && !e.metaKey) {
      return;
    }

    e.preventDefault();
    const delta = e.deltaY > 0 ? -SCALE_STEP : SCALE_STEP;
    setScale((prev) => {
      const newScale = prev + delta;
      return Math.max(MIN_SCALE, Math.min(newScale, MAX_SCALE));
    });
  }, []);

  if (images.length === 0) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        from="bottom"
        className="bg-transparent border-transparent shadow-none h-screen sm:max-w-screen"
        showCloseButton={false}
      >
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/70 backdrop-blur-md border-none text-white shadow-lg"
          onClick={handleClose}
          aria-label="關閉"
        >
          <XIcon className="size-6 text-white drop-shadow-lg" />
        </Button>

        {/* 縮放控制按鈕 */}
        <div className="absolute top-4 left-4 z-10 flex gap-2">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleZoomIn}
            disabled={scale >= MAX_SCALE}
            className="bg-black/50 hover:bg-black/70 backdrop-blur-md border-none text-white shadow-lg disabled:opacity-50"
            aria-label="放大"
          >
            <ZoomIn className="size-5 text-white drop-shadow-lg" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleZoomOut}
            disabled={scale <= MIN_SCALE}
            className="bg-black/50 hover:bg-black/70 backdrop-blur-md border-none text-white shadow-lg disabled:opacity-50"
            aria-label="縮小"
          >
            <ZoomOut className="size-5 text-white drop-shadow-lg" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleResetZoom}
            disabled={scale === MIN_SCALE}
            className="bg-black/50 hover:bg-black/70 backdrop-blur-md border-none text-white shadow-lg disabled:opacity-50"
            aria-label="重置縮放"
          >
            <RotateCcw className="size-5 text-white drop-shadow-lg" />
          </Button>
        </div>

        <Carousel
          setApi={setApi}
          opts={{
            loop: true,
          }}
          className="w-full h-full"
        >
          <DialogTitle className="sr-only">圖片</DialogTitle>
          <CarouselContent className="h-screen">
            {images.map((imageUrl, index) => (
              <CarouselItem key={imageUrl} className="h-full flex items-center justify-center">
                <div
                  ref={index === currentIndex ? imageRef : null}
                  role="img"
                  className="relative w-full h-full flex items-center justify-center p-4 overflow-hidden cursor-zoom-in"
                  onDoubleClick={handleDoubleClick}
                  onWheel={handleWheel}
                  style={{
                    transform: index === currentIndex ? `scale(${scale})` : "scale(1)",
                    transition: "transform 0.2s ease-out",
                  }}
                >
                  <Image
                    src={imageUrl}
                    alt={`圖片 ${index + 1}`}
                    fill
                    className="object-contain"
                    sizes="90vw"
                    unoptimized
                  />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          {images.length > 1 && (
            <>
              <CarouselPrevious className="left-4 bg-black/50 hover:bg-black/70 backdrop-blur-md border-none text-white shadow-lg" />
              <CarouselNext className="right-4 bg-black/50 hover:bg-black/70 backdrop-blur-md border-none text-white shadow-lg" />
            </>
          )}
        </Carousel>

        {/* 頁碼顯示 */}
        {images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 px-4 py-2 rounded-full bg-black/50 backdrop-blur-md min-w-24 shadow-lg">
            <div className="text-sm text-white font-medium text-center drop-shadow-lg">
              {currentIndex + 1} / {images.length}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
