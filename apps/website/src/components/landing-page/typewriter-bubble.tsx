"use client";

import { useTranslations } from "@daodao/i18n";
import { Image } from "@daodao/ui/components/image";
import { useEffect, useRef, useState } from "react";

const TYPE_SPEED = 120; // 打字速度（每字）
const PAUSE_DONE = 1900; // 打完停留
const ERASE_SPEED = 100; // 退格速度
const PAUSE_NEXT = 200; // 換句前的間隔

// 等待函數
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// 打字動畫
const type = (
  text: string,
  setCurrentText: React.Dispatch<React.SetStateAction<string>>,
  intervalsRef: React.MutableRefObject<Set<NodeJS.Timeout>>
): Promise<void> => {
  return new Promise((resolve) => {
    let i = 0;
    const typeInterval = setInterval(() => {
      if (i < text.length) {
        setCurrentText(text.slice(0, i + 1));
        i += 1;
      } else {
        clearInterval(typeInterval);
        intervalsRef.current.delete(typeInterval);
        resolve();
      }
    }, TYPE_SPEED);
    intervalsRef.current.add(typeInterval);
  });
};

// 退格動畫
const erase = (
  setCurrentText: React.Dispatch<React.SetStateAction<string>>,
  intervalsRef: React.MutableRefObject<Set<NodeJS.Timeout>>
): Promise<void> => {
  return new Promise((resolve) => {
    const eraseInterval = setInterval(() => {
      setCurrentText((prevText) => {
        if (prevText.length > 0) {
          return prevText.slice(0, -1);
        }
        clearInterval(eraseInterval);
        intervalsRef.current.delete(eraseInterval);
        resolve();
        return "";
      });
    }, ERASE_SPEED);
    intervalsRef.current.add(eraseInterval);
  });
};

const fitBubbleWidth = (
  lines: string[],
  textRef: React.RefObject<HTMLDivElement | null>,
  setBubbleWidth: React.Dispatch<React.SetStateAction<number | null>>
) => {
  if (!textRef.current) return;

  const probe = document.createElement("span");
  probe.style.cssText = `
    position: absolute;
    visibility: hidden;
    white-space: nowrap;
    font: ${getComputedStyle(textRef.current).font};
  `;
  document.body.appendChild(probe);

  let max = 0;
  lines.forEach((s) => {
    probe.textContent = s;
    max = Math.max(max, probe.getBoundingClientRect().width);
  });
  document.body.removeChild(probe);

  const styles = getComputedStyle(textRef.current);
  const padX = Number.parseFloat(styles.paddingLeft) + Number.parseFloat(styles.paddingRight);
  const borderX =
    Number.parseFloat(styles.borderLeftWidth) + Number.parseFloat(styles.borderRightWidth);
  setBubbleWidth(Math.ceil(max + padX + borderX));
};

const startAnimation = (
  lines: string[],
  setCurrentText: React.Dispatch<React.SetStateAction<string>>,
  intervalsRef: React.MutableRefObject<Set<NodeJS.Timeout>>
) => {
  let currentLineIndex = 0;
  let isAnimating = true;

  const animateNextLine = async () => {
    if (!isAnimating) return;

    if (currentLineIndex >= lines.length) {
      currentLineIndex = 0;
    }

    const currentLine = lines[currentLineIndex];
    if (!currentLine) return;
    await type(currentLine, setCurrentText, intervalsRef);
    await wait(PAUSE_DONE);
    await erase(setCurrentText, intervalsRef);
    await wait(PAUSE_NEXT);

    currentLineIndex += 1;

    if (isAnimating) {
      requestAnimationFrame(animateNextLine);
    }
  };

  animateNextLine();

  return () => {
    isAnimating = false;
  };
};

const TypewriterBubbleText = () => {
  const t = useTranslations("landing_page");
  const LINES = [
    t("typewriter_line_0"),
    t("typewriter_line_1"),
    t("typewriter_line_2"),
    t("typewriter_line_3"),
  ];
  const [currentText, setCurrentText] = useState("");
  const [bubbleWidth, setBubbleWidth] = useState<number | null>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const intervalsRef = useRef<Set<NodeJS.Timeout>>(new Set());

  useEffect(() => {
    fitBubbleWidth(LINES, textRef, setBubbleWidth);
    const stopAnimation = startAnimation(LINES, setCurrentText, intervalsRef);
    return () => {
      stopAnimation();
      intervalsRef.current.forEach(clearInterval);
      intervalsRef.current.clear();
      intervalsRef.current = new Set();
    };
  }, []);

  return (
    <div
      ref={textRef}
      id="type-animation"
      className="relative inline-flex h-10 items-center overflow-hidden whitespace-nowrap rounded-[20px] border-2 border-mascot-aqua bg-primary-palest px-6 py-2 leading-[1.4]"
      style={bubbleWidth ? { width: `${bubbleWidth}px` } : undefined}
    >
      {currentText}
      {/* 打字游標 */}
      <span className="ml-[0.1em] inline-block h-4 w-[0.12em] translate-y-px animate-pulse border-r-[0.12em] border-r-current" />
    </div>
  );
};

export function TypewriterBubble() {
  const t = useTranslations("landing_page");
  return (
    <div className="relative flex min-h-[400px] flex-col items-center justify-center overflow-x-clip pb-[60px] pt-12">
      {/* 對話文字區域 */}
      <div className="flex w-full items-center justify-between pl-6 pr-[10%] md:pr-[20%] md:text-xl">
        <p className="font-medium text-primary-darker">{t("typewriter_bubble_prompt")}</p>
        <TypewriterBubbleText />
      </div>

      {/* 吉祥物區域 */}
      <div className="relative z-10 mt-5 w-full pr-6 pt-6 text-xl font-semibold md:pr-[20%] md:text-3xl">
        <div className="relative flex min-h-[120px] items-center justify-center rounded-tr-[100px] bg-mascot-bright-blue py-[60px]">
          <div className="w-full text-left">
            <Image
              src="/assets/landing-page/mascot-face.svg"
              width={118}
              height={92}
              alt={t("typewriter_bubble_mascot_alt")}
              className="absolute -top-5 right-3 z-2"
            />
            <p className="my-2 mb-1 w-full px-6 font-semibold text-basic-white">{t("typewriter_bubble_tagline_1")}</p>
            <p className="text-basic-darker my-2 w-full px-6 font-semibold">
              {t("typewriter_bubble_tagline_2")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
