import { cn } from "@daodao/ui/lib/utils";

// 定義類型
type SpotlightFeature = {
  id: string;
  text: string;
};

type SpotlightItem = {
  id: string;
  title: string;
  description: string;
  backgroundColor: string;
  features: SpotlightFeature[];
  hasBackgroundImage?: boolean;
};

// 特色資料
const spotlightItems: SpotlightItem[] = [
  {
    id: "professional-coaching",
    title: "專業且客製化的陪跑方式",
    description:
      "不只重視成果，更重視過程與你的全人發展，並強調「Knowing知識經驗、Being個人形塑、Doing行動」三者的交織。不只這樣...",
    backgroundColor: "bg-[#1F4645]",
    features: [
      {
        id: "experience-extraction",
        text: "萃取多位自我導向學習實踐者之經驗",
      },
      {
        id: "goddard-college",
        text: "結合被譽為全球最接近民主教育的美國百年民主大學 Goddard College 教學方法（首次在台灣公開）",
      },
      {
        id: "learning-journeys",
        text: "結合 High Performance Learning Journeys 學習引導法",
      },
      {
        id: "ai-guidance",
        text: "AI推薦與引導",
      },
    ],
  },
  {
    id: "ai-community",
    title: "AI 個人化學習工具Ｘ社群支持",
    description: "有 AI 推薦與引導外，也重視人與人真實地互動！",
    backgroundColor: "bg-primary-base",
    features: [
      {
        id: "ai-recommendation",
        text: "結合 AI 給你更好的資源與人脈推薦，以及學習引導",
      },
      {
        id: "diverse-community",
        text: "跨領域、跨年齡的百人社群，讓你可以找到同儕，也可以找到業界前輩",
      },
    ],
    hasBackgroundImage: true,
  },
];

// 特色卡片組件
const SpotlightCard = ({ spotlight }: { spotlight: SpotlightItem }) => {
  const backgroundImageClasses = spotlight.hasBackgroundImage
    ? "after:absolute after:bottom-[-22px] after:right-[-70px] after:block after:h-[140px] after:w-[185px] after:bg-cover after:bg-no-repeat after:content-[''] after:bg-[url('/assets/learning-marathon/booming.png')] max-lg:after:hidden"
    : "";

  const cardClasses = cn(
    "relative p-6 rounded-[10px]",
    spotlight.backgroundColor,
    backgroundImageClasses
  );

  return (
    <div className={cardClasses}>
      <h3 className="mb-8 text-lg font-bold leading-[140%] text-white">{spotlight.title}</h3>
      <p className="text-sm font-normal leading-[140%] text-white">{spotlight.description}</p>
      {spotlight.id === "ai-community" && <br />}
      <div className="mt-4">
        <ul className="list-disc pl-4">
          {spotlight.features.map((feature) => (
            <li
              key={feature.id}
              className="text-left text-sm font-normal leading-[140%] text-white"
            >
              {feature.text}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

/**
 * 學習馬拉松特色展示組件
 */
export const Spotlight = () => {
  return (
    <div className="block w-full max-w-full gap-5 space-y-5 max-md:grid-cols-1">
      {spotlightItems.map((spotlight) => (
        <SpotlightCard key={spotlight.id} spotlight={spotlight} />
      ))}
    </div>
  );
};
