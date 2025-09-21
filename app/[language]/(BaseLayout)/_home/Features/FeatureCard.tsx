import Image from 'next/image';
import { cn } from '@/utils/cn';

interface FeatureCardProps {
  title: string;
  description: string;
  tag: string;
  image: string;
  details: string[];
  className?: string;
}

export function FeatureCard({ title, description, tag, image, details, className }: FeatureCardProps) {
  return (
    <div className={cn('p-4 mb-6', className)}>
      <div className="flex justify-center items-center w-[84px] h-8 text-sm bg-tips text-white rounded">
        {tag}
      </div>
      <div className="w-full h-[200px] md:h-[200px] relative overflow-hidden rounded-lg mb-4">
        <Image
          src={image}
          alt={title}
          fill
          className="object-contain"
        />
      </div>
      <h4 className="text-[22px] text-primary-base text-center font-semibold mb-2">{title}</h4>
      <p className="text-sm text-basic-400 text-center mb-4">{description}</p>
      <ul className="space-y-2">
        {details.map((detail) => (
          <li key={detail} className="pl-10 pr-2 relative leading-6 text-base flex items-center min-h-[40px]">
            <span className="absolute top-1/2 left-0 w-10 h-10 bg-[url(/assets/landing-page/icon-bulb.svg)] bg-no-repeat bg-center transform -translate-y-1/2" />
            {detail}
          </li>
        ))}
      </ul>
    </div>
  );
}
