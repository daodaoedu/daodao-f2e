import { Sprout, Lightbulb, Heart } from "lucide-react";
import { Section, Heading, Text, Grid } from "./index";

export function ValueProposition() {
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
        <Heading
          level={2}
          size="lg"
          className="mb-4 text-basic-black"
        >
          重新定義學習的可能性
        </Heading>
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
              <Heading
                level={3}
                size="sm"
                className="text-basic-black mb-4"
              >
                {feature.title}
              </Heading>
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
