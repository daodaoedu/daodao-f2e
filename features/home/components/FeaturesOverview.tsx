import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Section, Heading, Text } from "./index";

interface FeaturesOverviewProps {
  onGetStarted: () => void;
}

export function FeaturesOverview({ onGetStarted }: FeaturesOverviewProps) {
  const features = [
    {
      title: "主題實踐 - 輕鬆開始學習探索",
      description: "用 7-30 天的時間嘗試新主題，發現你的興趣。定時打卡，紀錄軌跡和心得！",
      imagePosition: "right"
    },
    {
      title: "學習計劃 - 打造你的學習基地",
      description: "為重要目標建立完整的學習計劃。設定目標、追蹤進度、累積成長！",
      imagePosition: "left",
      backgroundStyle: {
        background: 'linear-gradient(135deg, rgba(153, 236, 255, 0.05), rgba(22, 185, 179, 0.05))'
      }
    },
    {
      title: "資源 - 發現與分享學習資源",
      description: "探索社群推薦的優質學習資源，分享你用過的好內容，並留下真實使用心得。",
      imagePosition: "right"
    },
    {
      title: "想法 - 分享學習洞察",
      description: "捕捉並分享受到啟發的時刻。在這裡，每個想法都可能點亮別人的學習之路。",
      imagePosition: "left",
      backgroundStyle: {
        background: 'linear-gradient(135deg, rgba(249, 228, 28, 0.05), rgba(255, 161, 11, 0.05))'
      }
    },
    {
      title: "AI 學習建議",
      description: "基於你在這裡的學習足跡，獲得個人化的學習策略建議和資源推薦。",
      imagePosition: "right"
    }
  ];

  return (
    <Section
      id="how-it-works"
      padding="lg"
      background="white"
    >
      <div className="text-center mb-16">
        <Heading
          level={2}
          size="lg"
          className="mb-4 text-basic-black"
        >
          在這個學習群島上，你可以：
        </Heading>
      </div>

      <div className="space-y-0">
        {features.map((feature) => (
          <div
            key={feature.title}
            className="flex flex-col lg:flex-row items-start gap-4 sm:gap-6 py-6 sm:py-8 px-4 sm:px-6"
            style={feature.backgroundStyle || {}}
          >
            {/* Content */}
            <div
              className={`flex-1 min-w-0 ${
                feature.imagePosition === 'left' ? 'lg:order-2' : ''
              }`}
            >
              <div className="mb-3">
                <Heading
                  level={3}
                  size="sm"
                  className="text-basic-black"
                >
                  {feature.title}
                </Heading>
              </div>
              <Text size="sm" className="text-basic-300 mb-4">
                {feature.description}
              </Text>
              <Button
                size="sm"
                className="rounded-lg bg-primary-base text-basic-white hover:bg-primary-darker"
                onClick={onGetStarted}
              >
                馬上開始
                <ArrowRight size={14} className="ml-2" />
              </Button>
            </div>

            {/* Preview Area - 每個feature都有 */}
            <div
              className={`bg-basic-100 rounded-lg p-4 w-full sm:w-80 lg:w-80 h-24 sm:h-32 flex items-center justify-center flex-shrink-0 ${
                feature.imagePosition === 'left' ? 'lg:order-1' : ''
              }`}
            >
              <Text size="sm" color="secondary">
                功能預覽區域
              </Text>
            </div>
          </div>
        ))}
      </div>

      {/* Coming Soon Features */}
      <div className="mt-16 text-center">
        <div className="bg-basic-100 rounded-lg p-8">
          <Heading
            level={4}
            size="sm"
            className="text-basic-black mb-4 flex items-center justify-center"
          >
            <Sparkles className="h-6 w-6 mr-3 text-yellow-500" />
            更多功能持續進化中
          </Heading>
          <Text size="sm" className="text-basic-300">
            揪團、成長地圖等功能正在優化，為你帶來更美好的學習生活
          </Text>
        </div>
      </div>
    </Section>
  );
}
