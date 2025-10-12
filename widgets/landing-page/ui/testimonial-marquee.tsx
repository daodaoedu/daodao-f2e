import { v4 as uuidv4 } from 'uuid';
import { Image } from '@/shared/ui/image';
import { cn } from '@/shared/lib/cn';

interface TestimonialCardProps {
  name: string;
  role: string;
  content: string;
  avatar: string;
  className?: string;
}

export function TestimonialCard({
  name,
  role,
  content,
  avatar,
  className,
}: TestimonialCardProps) {
  return (
    <article
      className={cn(
        'min-h-[120px] w-80 rounded-[20px] bg-[#F3FDFF] p-4',
        'grid grid-cols-[72px_1fr] items-start gap-3',
        'sm:w-[260px] sm:grid-cols-[60px_1fr]',
        className
      )}
    >
      <figure className="m-0 grid justify-items-center">
        <Image
          src={avatar}
          alt={`${name} 的頭像`}
          width={64}
          height={64}
          className="block size-16 rounded-full sm:size-[52px]"
        />
        <figcaption className="mt-1.5 text-center text-[13px] leading-none text-[#225a62]">
          {name}
        </figcaption>
      </figure>

      <div>
        <p className="m-0 mb-2 text-[15px] leading-normal text-[#13333b]">
          {content}
        </p>
        <div className="text-[13px] text-[#3b6b72]">{role}</div>
      </div>
    </article>
  );
}

interface TestimonialMarqueeProps {
  className?: string;
}

const testimonials = [
  {
    id: uuidv4(),
    name: 'Will',
    role: '日語學習者 @ 島島阿學',
    content:
      '原本總是半途而廢的我，透過主題實踐功能，成功完成了 30 天的日語學習挑戰。',
    avatar: '/assets/landing-page/avatar-boy.svg',
  },
  {
    id: uuidv4(),
    name: 'Mina',
    role: '高中生 @ 島島阿學',
    content: '帳面上看起來很複雜，但任務被拆成小步驟後，我每天都有成就感。',
    avatar: '/assets/landing-page/avatar-girl.svg',
  },
  {
    id: uuidv4(),
    name: 'Rex',
    role: '上班族 @ 島島阿學',
    content: '提醒與紀錄整合在一起，不用另外開 App，維持起來超輕鬆。',
    avatar: '/assets/landing-page/avatar-boy.svg',
  },
  {
    id: uuidv4(),
    name: 'Yui',
    role: '日語學習者 @ 島島阿學',
    content:
      '原本總是半途而廢的我，透過主題實踐功能，成功完成了 30 天的日語學習挑戰。',
    avatar: '/assets/landing-page/avatar-girl.svg',
  },
  {
    id: uuidv4(),
    name: 'Leo',
    role: '日語學習者 @ 島島阿學',
    content:
      '原本總是半途而廢的我，透過主題實踐功能，成功完成了 30 天的日語學習挑戰。',
    avatar: '/assets/landing-page/avatar-boy.svg',
  },
  {
    id: uuidv4(),
    name: 'Enn',
    role: '設計師 @ 島島阿學',
    content: '把學習拆進日常情境的做法，對我超實用。',
    avatar: '/assets/landing-page/avatar-girl.svg',
  },
];

export function TestimonialMarquee({ className }: TestimonialMarqueeProps) {
  return (
    <section
      className={cn('section-block grid gap-9 overflow-hidden', className)}
    >
      {/* 第一排（往右） */}
      <div
        className="animate-marquee-reverse mask-marquee hover:[animation-play-state:paused]"
        aria-hidden="true"
      >
        <div className="flex w-max gap-5 will-change-transform">
          {/* 一份內容 */}
          {testimonials.map((testimonial) => (
            <TestimonialCard
              key={testimonial.id}
              name={testimonial.name}
              role={testimonial.role}
              content={testimonial.content}
              avatar={testimonial.avatar}
            />
          ))}
          {/* 再複製一次（無縫循環關鍵） */}
          {testimonials.map((testimonial) => (
            <TestimonialCard
              key={`duplicate-${testimonial.id}`}
              name={testimonial.name}
              role={testimonial.role}
              content={testimonial.content}
              avatar={testimonial.avatar}
            />
          ))}
        </div>
      </div>

      {/* 第二排（往左） */}
      <div
        className="animate-marquee mask-marquee hover:[animation-play-state:paused]"
        aria-hidden="true"
      >
        <div className="flex w-max gap-5 will-change-transform">
          {/* 一份內容 */}
          {testimonials
            .slice()
            .reverse()
            .map((testimonial) => (
              <TestimonialCard
                key={`reverse-${testimonial.id}`}
                name={testimonial.name}
                role={testimonial.role}
                content={testimonial.content}
                avatar={testimonial.avatar}
              />
            ))}
          {/* 再複製一次 */}
          {testimonials
            .slice()
            .reverse()
            .map((testimonial) => (
              <TestimonialCard
                key={`reverse-duplicate-${testimonial.id}`}
                name={testimonial.name}
                role={testimonial.role}
                content={testimonial.content}
                avatar={testimonial.avatar}
              />
            ))}
        </div>
      </div>
    </section>
  );
}
