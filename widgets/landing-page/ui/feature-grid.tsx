import Image from 'next/image';
import { cn } from '@/utils/cn';
import { SectionHeader } from '@/shared/ui/section-header';

interface FeatureCardProps {
  title: string;
  description: string;
  tag: string;
  image: string;
  details: string[];
  className?: string;
}

export function FeatureCard({
  title,
  description,
  tag,
  image,
  details,
  className,
}: FeatureCardProps) {
  return (
    <div className={cn('mb-6 p-4', className)}>
      <div className="flex h-8 w-[84px] items-center justify-center rounded bg-tips text-sm text-white">
        {tag}
      </div>
      <div className="relative mb-4 h-[200px] w-full overflow-hidden rounded-lg md:h-[200px]">
        <Image src={image} alt={title} fill className="object-contain" />
      </div>
      <h4 className="mb-2 text-center text-[22px] font-semibold text-primary-base">
        {title}
      </h4>
      <p className="mb-4 text-center text-sm text-basic-400">{description}</p>
      <ul className="space-y-2">
        {details.map((detail) => (
          <li
            key={detail}
            className="relative flex min-h-[40px] items-center pl-10 pr-2 text-base leading-6"
          >
            <span className="absolute left-0 top-1/2 size-10 -translate-y-1/2 bg-[url(/assets/landing-page/icon-bulb.svg)] bg-center bg-no-repeat" />
            {detail}
          </li>
        ))}
      </ul>
    </div>
  );
}

interface FeatureGridProps {
  className?: string;
}

export function FeatureGrid({ className }: FeatureGridProps) {
  const features = [
    {
      title: '個人學習管理',
      description: '有計劃、追蹤進度、記錄反思',
      tag: '不再混亂',
      image: '/assets/landing-page/feature-tracker.png',
      details: [
        '長期計劃或短期實踐，掌控學習節奏',
        '追蹤項目進度，將目標轉化為行動',
        '定期記錄覆盤，深化學習',
      ],
    },
    {
      title: '社群支持',
      description: '分享學習想法和心得，在互動討論中找到志同道合夥伴',
      tag: '不再孤單',
      image: '/assets/landing-page/feature-community.png',
      details: [
        '貝殼表達感謝，鼓勵知識和學習的分享',
        '所有互動都為了加深理解、促進成長',
        '建立學習連結，共同探索而非相互競爭',
      ],
    },
    {
      title: '成長視覺化',
      description: '記錄每一步努力，讓每個突破都清晰可見',
      tag: '不再無感',
      image: '/assets/landing-page/feature-chart.png',
      details: [
        '學習紀錄和活躍度呈現，看見成長軌跡',
        '個人技能地圖，視覺化個人成長發展',
      ],
    },
  ];

  return (
    <div className={cn('w-full pt-16', className)}>
      <div className="container">
        <div
          className="relative flex flex-col items-center justify-center overflow-x-clip pb-[60px]"
          id="feature"
        >
          <SectionHeader
            title="告別三大學習困境"
            subtitle="從學習痛點到美好體驗，讓每一步成長都看得見"
            variant="dark"
            size="lg"
            alignment="center"
          />
          <div className="flex flex-col items-stretch text-primary-darker md:flex-row">
            {features.map((feature) => (
              <FeatureCard
                key={feature.title}
                title={feature.title}
                description={feature.description}
                tag={feature.tag}
                image={feature.image}
                details={feature.details}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
