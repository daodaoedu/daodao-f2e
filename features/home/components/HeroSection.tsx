import { Section, Heading, Text } from "./index";

export function HeroSection() {
  return (
    <Section
      id="hero"
      padding="xl"
      background="white"
      className="pt-16"
    >
      <div className="text-center">
        {/* Main Heading */}
        <Heading
          level={1}
          className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-basic-black"
        >
          讓學習成為充滿
          <span className="block text-primary-base">
            發現、互助支持和看得見進步
          </span>
          的美好日常
        </Heading>

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
        <div className="flex flex-col sm:flex-row items-center justify-center gap-8 text-basic-300 body-sm">
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
