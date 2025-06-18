import { Heart } from "lucide-react";
import { Section, Text } from "./index";

export function Testimonial() {
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
