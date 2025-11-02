import { Sprout, Lightbulb, Heart, ArrowRight, Sparkles, CheckCircle } from 'lucide-react';
import { useAuth, useAuthActions } from '@/entities/user';
import SEOConfig from '@/components/SEOConfig';
import getBaseLayout from '@/layout/core/getBaseLayout';

// UI Components
import { Button } from '@/shared/ui/button';
import { Section } from '@/shared/ui/section';
import { Grid } from '@/shared/ui/grid';
import { Title, Text } from '@/shared/ui/typography';

// Note: Explore page has been migrated to app router

// ========================================
// Internal Components - Landing Page Components
// ========================================

function HeroSection() {
  return (
    <Section
      id="hero"
      padding="xl"
      background="white"
      className="pt-16"
    >
      <div className="text-center">
        {/* Main Heading */}
        <Title
          as="h1"
          size="xl"
          className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-basic-black"
        >
          讓學習成為充滿
          <span className="block text-primary-base">
            發現、互助支持和看得見進步
          </span>
          的美好日常
        </Title>

        {/* Subtitle */}
        <Text
          className="text-base sm:text-lg font-medium mb-6"
          style={{ color: '#ffa10b' }}
        >
          Where personal growth meets collective wisdom!
        </Text>

        {/* Description */}
        <Text
          className="text-base sm:text-lg mb-8 max-w-3xl mx-auto text-basic-300"
        >
          每個人都有自己的學習小島，透過交流與分享，連結成群島
        </Text>

        {/* Social Proof */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-8 text-basic-300 text-sm">
          <div className="flex items-center">
            <div className="flex -space-x-2 mr-3">
              <div className="w-8 h-8 rounded-full bg-basic-200" />
              <div className="w-8 h-8 rounded-full bg-basic-300" />
              <div className="w-8 h-8 rounded-full bg-basic-400" />
            </div>
            <span>已有 2,000+ 個學習小島</span>
          </div>
        </div>
      </div>
    </Section>
  );
}

function ValueProposition() {
  const features = [
    {
      icon: Sprout,
      title: "探索新興趣",
      description: "想探索新興趣、轉換職涯跑道，還是提升專業技能？透過嘗試新領域，發現可能的方向",
      iconBg: "#99ecff",
      iconColor: "#0f3036"
    },
    {
      icon: Lightbulb,
      title: "分享靈感",
      description: "透過分享你的學習靈感，啟發他人也獲得回饋。在互動中發現新的可能性和學習方向",
      iconBg: "#f9e41c",
      iconColor: "#0f3036"
    },
    {
      icon: Heart,
      title: "連結學習夥伴",
      description: "連結志同道合的學習夥伴，讓學習不再孤單。按照自己的節奏和喜好，一起成長",
      iconBg: "#ffa10b",
      iconColor: "#0f3036"
    }
  ];

  return (
    <Section
      id="features"
      padding="lg"
      background="gray"
    >
      <div className="text-center mb-16">
        <Title
          as="h2"
          size="lg"
          className="mb-4 text-basic-black"
        >
          重新定義學習的可能性
        </Title>
        <Text
          size="md"
          className="text-basic-300 max-w-2xl mx-auto"
        >
          透過分享靈感、嘗試新領域，按照自己的節奏和喜好成長
        </Text>
      </div>

      <Grid cols={{ default: 1, sm: 2, md: 3 }} gap="lg">
        {features.map((feature) => {
          const IconComponent = feature.icon;
          return (
            <div key={feature.title} className="text-center p-6">
              <div
                className="w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center"
                style={{ backgroundColor: feature.iconBg }}
              >
                <IconComponent
                  size={32}
                  style={{ color: feature.iconColor }}
                />
              </div>
              <Title
                as="h3"
                size="sm"
                className="text-basic-black mb-4"
              >
                {feature.title}
              </Title>
              <Text size="sm" className="text-basic-300">
                {feature.description}
              </Text>
            </div>
          );
        })}
      </Grid>
    </Section>
  );
}

function FeaturesOverview({ onGetStarted }: { onGetStarted: () => void }) {
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
        <Title
          as="h2"
          size="lg"
          className="mb-4 text-basic-black"
        >
          在這個學習群島上，你可以：
        </Title>
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
                <Title
                  as="h3"
                  size="sm"
                  className="text-basic-black"
                >
                  {feature.title}
                </Title>
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
          <Title
            as="h4"
            size="sm"
            className="text-basic-black mb-4 flex items-center justify-center"
          >
            <Sparkles className="h-6 w-6 mr-3 text-yellow-500" />

            更多功能持續進化中
          </Title>
          <Text size="sm" className="text-basic-300">
            揪團、成長地圖等功能正在優化，為你帶來更美好的學習生活
          </Text>
        </div>
      </div>
    </Section>
  );
}

function Testimonial() {
  return (
    <Section
      id="community"
      padding="lg"
      background="white"
    >
      <div className="text-center">
        <div className="mb-8">
          <div className="flex justify-center mb-4">
            {[1, 2, 3, 4, 5].map((star) => (
              <Heart
                key={`star-${star}`}
                size={24}
                style={{ color: '#f9e41c' }}
                fill="currentColor"
              />
            ))}
          </div>
          <blockquote className="text-base sm:text-lg text-basic-400 italic mb-6">
            "加入島島阿學後，我終於不再為了學習而焦慮了。
            在這裡，我遇到了真正理解我興趣的夥伴，一起做城市農業專案。
            學習變成了生活中最期待的部分，而不是壓力來源。"
          </blockquote>
          <div className="flex items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-basic-200 mr-4" />
            <div className="text-left">
              <div className="font-semibold text-basic-black">林小雯</div>
              <Text size="sm" className="text-basic-300">
                城市農業愛好者 @ 島島阿學
              </Text>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}

function CTASection({ onGetStarted }: { onGetStarted: () => void }) {
  const benefits = [
    "自由探索各領域",
    "按自己節奏進行",
    "與夥伴共同成長"
  ];

  return (
    <Section
      padding="xl"
      background="primary"
      className="text-center"
    >
      <Title
        as="h2"
        size="lg"
        className="text-basic-white mb-6"
      >
        準備好重新打造你喜歡的學習生活了嗎？
      </Title>

      <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
        <Button
          size="lg"
          className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-basic-white text-basic-black rounded-lg font-medium text-sm sm:text-base hover:bg-basic-100"
          onClick={onGetStarted}
        >
          重新打造我的學習生活
          <ArrowRight size={20} className="ml-2" />
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 text-basic-white text-sm opacity-75">
        {benefits.map((benefit) => (
          <div key={benefit} className="flex items-center">
            <CheckCircle size={16} className="mr-2" />
            <span>{benefit}</span>
          </div>
        ))}
      </div>
    </Section>
  );
}

// ========================================
// Landing Page Component
// ========================================

interface LandingPageProps {
  onLogin: () => void;
}

function LandingPage({ onLogin }: LandingPageProps) {
  const handleGetStarted = () => {
    onLogin();
  };

  return (
    <main className="min-h-screen bg-basic-white">
      <HeroSection />
      <ValueProposition />
      <FeaturesOverview onGetStarted={handleGetStarted} />
      <Testimonial />
      <CTASection onGetStarted={handleGetStarted} />
    </main>
  );
}

// ========================================
// Main Home Page Component (Default Export)
// ========================================

function HomePage() {
  const { isLoggedIn } = useAuth();
  const { openLoginModal } = useAuthActions();

  if (isLoggedIn) {
    // Redirect logged-in users to explore page
    if (typeof window !== 'undefined') {
      window.location.href = '/explore';
    }
    return null;
  }

  // Show landing page for non-logged-in users
  return (
    <>
      <SEOConfig
        title="島島阿學學習社群"
        description="台灣多元教育與學習資源平台"
        keywords="島島阿學,學習,教育,社群,資源"
        author="島島阿學"
        copyright="島島阿學"
        imgLink="https://www.daoedu.tw/assets/brand/horizontal-primary-logo.svg"
      />

      <LandingPage onLogin={openLoginModal} />
    </>
  );
}

HomePage.getLayout = getBaseLayout;

export default HomePage;
