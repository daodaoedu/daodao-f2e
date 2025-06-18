import { ArrowRight, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Section, Heading } from "./index";

interface CTASectionProps {
  onGetStarted: () => void;
}

export function CTASection({ onGetStarted }: CTASectionProps) {
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
      <Heading
        level={2}
        size="lg"
        className="text-basic-white mb-6"
      >
        準備好重新打造你喜歡的學習生活了嗎？
      </Heading>

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
