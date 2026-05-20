import { useTranslations } from "@daodao/i18n";
import { Image } from "@daodao/ui/components/image";

interface FunctionCardProps {
  tag: string;
  title: string;
  description: string;
  imageUrl: string;
  action: string;
}

export function FunctionCard({ tag, title, description, imageUrl, action }: FunctionCardProps) {
  return (
    <div className="relative box-border flex flex-col gap-4 rounded-2xl bg-white p-4 aspect-9/7 w-[280px] min-w-[280px] shrink-0">
      {/* 標籤 */}
      <div className="w-21 absolute left-4 top-4 z-10 rounded-br-lg rounded-tl-lg bg-orange-400 p-2 text-center text-xs font-semibold text-white">
        {tag}
      </div>

      {/* 圖片 */}
      <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-gray-100">
        <Image
          src={imageUrl}
          alt={title}
          fill
          className="pointer-events-none select-none object-cover"
          draggable={false}
          style={{ WebkitUserDrag: "none" } as React.CSSProperties}
        />
      </div>

      {/* 標題 */}
      <p className="w-full text-center text-xl font-semibold text-teal-800">{title}</p>

      {/* 描述 */}
      <p className="m-0 mb-3 leading-relaxed text-teal-800">{description}</p>

      {/* 行動按鈕區域 */}
      <div className="mt-auto flex items-center justify-end gap-2">
        <p className="font-medium text-primary-base">{action}</p>

        <Image
          src="/assets/landing-page/icon-arrow-right.svg"
          alt="前往"
          width={16}
          height={16}
          className="pointer-events-none select-none"
          draggable={false}
          style={{ WebkitUserDrag: "none" } as React.CSSProperties}
        />
      </div>
    </div>
  );
}

const _functions = [
  {
    tag: "想法",
    title: "分享學習洞察",
    description: "捕捉並分享受到啟發的時刻。在這裡，每個想法都可能點亮別人的學習之路。",
    imageUrl: "https://picsum.photos/200/300?grayscale",
    action: "馬上開始",
  },
  {
    tag: "主題實踐",
    title: "輕鬆開始學習探索",
    description: "用 7-30 天的時間嘗試新主題，發現你的興趣。定時打卡，紀錄軌跡和心得！",
    imageUrl: "https://picsum.photos/200/300?grayscale",
    action: "馬上開始",
  },
  {
    tag: "學習計劃",
    title: "打造你的學習基地",
    description: "為重要目標建立完整的學習計劃。設定目標、追蹤進度、累積成長！",
    imageUrl: "https://picsum.photos/200/300?grayscale",
    action: "馬上開始",
  },
  {
    tag: "資源",
    title: "發現與分享學習資源",
    description: "探索社群推薦的優質學習資源，分享你用過的好內容，並留下真實使用心得。",
    imageUrl: "https://picsum.photos/200/300?grayscale",
    action: "馬上開始",
  },
];

export function FunctionCarousel() {
  const t = useTranslations("landing_page");
  return (
    <section className="relative flex flex-col items-center justify-center overflow-x-clip bg-basic-white pt-16 pb-16">
      {/* 底部裝飾圖片 */}
      <picture className="relative aspect-111/53 w-full md:aspect-514/151">
        <source media="(max-width: 767px)" srcSet="/assets/landing-page/ribbon-mobile.svg" />
        <Image
          src="/assets/landing-page/ribbon-desktop.svg"
          alt={t("function_carousel_ribbon_alt")}
          fill
        />
      </picture>
    </section>
  );
}
