import {
  createContext, useContext, useEffect, useState,
} from 'react';
import { CustomLink } from '@/shared/ui/custom-link';
import { cn } from '@/shared/lib/cn';

interface PromotionContextType {
  height: number;
  isShowShadow: boolean;
  isShowPromotionBar: boolean;
  setHeight: (height: number) => void;
  setIsShowShadow: (showShadow: boolean) => void;
  setIsShowPromotionBar: (showPromotionBar: boolean) => void;
}

const PromotionContext = createContext<PromotionContextType | null>(null);

export const usePromotion = () => {
  const context = useContext(PromotionContext);
  if (!context) {
    throw new Error('usePromotion must be used within an NavigationProvider');
  }
  return context;
};

export const PromotionProvider = ({ children }: React.PropsWithChildren) => {
  const [isShowShadow, setIsShowShadow] = useState(true);
  const [isShowPromotionBar, setIsShowPromotionBar] = useState(true);
  const [height, setHeight] = useState(69);

  return (
    <PromotionContext.Provider
      value={{
        height,
        isShowShadow,
        isShowPromotionBar,
        setHeight,
        setIsShowShadow,
        setIsShowPromotionBar,
      }}
    >
      {children}
    </PromotionContext.Provider>
  );
};

enum PromotionType {
  LearningQuiz,
  LearningMarathon,
  Donate,
  Questionnaire,
}

const promotionConfigs = {
  [PromotionType.LearningQuiz]: {
    texts: [
      '🧭 找不到學習方向？快來做「群島風格測驗」，找出屬於你的學習小島！',
      '🌱 完成測驗，立即獲得個人化建議與資源推薦，學習不再迷路！',
      '🤝 找到你在學習路上的群島夥伴，一起解鎖適合的學習方法！',
    ],
    link: '/quiz',
  },
  [PromotionType.LearningMarathon]: {
    texts: [
      '✨「島島盃 -  2025 春季學習馬拉松」開跑啦！1/24 截止申請！✨',
      '✨參加學習馬拉松，一起為自己重新打造喜歡的學習生活吧！✨',
      '✨申請學習馬拉松，即可試用最新個人化功能輔助學習唷！✨',
    ],
    link: '/learning-marathon',
  },
  [PromotionType.Donate]: {
    texts: [
      '✨島島阿學需要你的支持，讓人人都享有同等資源✨',
      '✨推廣民主教育，島島阿學需要你的支持✨',
      '✨用捐款與島島阿學一同推動民主教育✨',
    ],
    link: 'https://ocf.tw/p/daodao/',
  },
  [PromotionType.Questionnaire]: {
    texts: [
      '✨幫助島島阿學打造更好的學習資源，您的意見很重要！✨',
      '✨一起推動民主教育！花一點時間填寫問卷，讓我們更懂您的需求✨',
      '✨填寫問卷支持島島阿學，讓教育資源觸及更多人！✨',
    ],
    link: 'https://docs.google.com/forms/d/e/1FAIpQLSeyU9-Q-kIWp5uutcik3h-RO4o5VuG6oG0m-4u1Ua18EOu3aw/viewform',
  },
};

const { texts, link } = promotionConfigs[PromotionType.LearningQuiz];

type NestCallback = (nextCallback: NestCallback) => void;

export function PromotionBar() {
  const { isShowPromotionBar, setIsShowPromotionBar } = usePromotion();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    const changeIndex = (callback: NestCallback) => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % texts.length);
      setIsFadingOut(false);
      timer = setTimeout(() => {
        callback(changeIndex);
      }, 7500);
    };
    const changeFadingOut = (callback: NestCallback) => {
      setIsFadingOut(true);
      timer = setTimeout(() => {
        callback(changeFadingOut);
      }, 500);
    };

    changeIndex(changeFadingOut);

    return () => clearTimeout(timer);
  }, [texts.length]);

  return (
    isShowPromotionBar && (
      <div className="relative bg-tips text-center text-basic-white">
        <CustomLink
          href={link}
          className={cn(
            'block cursor-pointer animate-fade-in animate-duration-500 px-14 py-2.5',
            isFadingOut && 'animate-fade-out'
          )}
        >
          {texts[currentIndex]}
        </CustomLink>
        <button
          type="button"
          className="absolute right-3.5 top-1/2 size-11 -translate-y-1/2 text-basic-white"
          onClick={() => setIsShowPromotionBar(false)}
          aria-label="close"
        >
          <div
            className={cn(
              'absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-0.5',
              '-rotate-45 bg-basic-white pointer-events-none'
            )}
          />
          <div
            className={cn(
              'absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-0.5',
              'rotate-45 bg-basic-white pointer-events-none'
            )}
          />
        </button>
      </div>
    )
  );
}
