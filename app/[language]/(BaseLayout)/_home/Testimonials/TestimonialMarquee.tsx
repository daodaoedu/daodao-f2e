'use client';

import { cn } from '@/utils/cn';
import { TestimonialCard } from './TestimonialCard';
import './Testimonials.css';

interface TestimonialMarqueeProps {
  className?: string;
}

export function TestimonialMarquee({ className }: TestimonialMarqueeProps) {
  const testimonials = [
    {
      name: 'Will',
      role: '日語學習者 @ 島島阿學',
      content: '原本總是半途而廢的我，透過主題實踐功能，成功完成了 30 天的日語學習挑戰。',
      avatar: '/assets/landing-page/avatar-boy.svg',
    },
    {
      name: 'Mina',
      role: '高中生 @ 島島阿學',
      content: '帳面上看起來很複雜，但任務被拆成小步驟後，我每天都有成就感。',
      avatar: '/assets/landing-page/avatar-girl.svg',
    },
    {
      name: 'Rex',
      role: '上班族 @ 島島阿學',
      content: '提醒與紀錄整合在一起，不用另外開 App，維持起來超輕鬆。',
      avatar: '/assets/landing-page/avatar-boy.svg',
    },
    {
      name: 'Yui',
      role: '日語學習者 @ 島島阿學',
      content: '原本總是半途而廢的我，透過主題實踐功能，成功完成了 30 天的日語學習挑戰。',
      avatar: '/assets/landing-page/avatar-girl.svg',
    },
    {
      name: 'Leo',
      role: '日語學習者 @ 島島阿學',
      content: '原本總是半途而廢的我，透過主題實踐功能，成功完成了 30 天的日語學習挑戰。',
      avatar: '/assets/landing-page/avatar-boy.svg',
    },
    {
      name: 'Enn',
      role: '設計師 @ 島島阿學',
      content: '把學習拆進日常情境的做法，對我超實用。',
      avatar: '/assets/landing-page/avatar-girl.svg',
    },
  ];

  return (
    <section className={cn('section-block marquee-wrap', className)}>
      {/* 第一排（往右） */}
      <div className="marquee-row top" aria-hidden="true">
        <div className="track">
          {/* 一份內容 */}
          {testimonials.map((testimonial) => (
            <TestimonialCard
              key={testimonial.name}
              name={testimonial.name}
              role={testimonial.role}
              content={testimonial.content}
              avatar={testimonial.avatar}
            />
          ))}
          {/* 再複製一次（無縫循環關鍵） */}
          {testimonials.map((testimonial) => (
            <TestimonialCard
              key={`duplicate-${testimonial.name}`}
              name={testimonial.name}
              role={testimonial.role}
              content={testimonial.content}
              avatar={testimonial.avatar}
            />
          ))}
        </div>
      </div>

      {/* 第二排（往左） */}
      <div className="marquee-row bottom" aria-hidden="true">
        <div className="track">
          {/* 一份內容 */}
          {testimonials.slice().reverse().map((testimonial) => (
            <TestimonialCard
              key={`reverse-${testimonial.name}`}
              name={testimonial.name}
              role={testimonial.role}
              content={testimonial.content}
              avatar={testimonial.avatar}
            />
          ))}
          {/* 再複製一次 */}
          {testimonials.slice().reverse().map((testimonial) => (
            <TestimonialCard
              key={`reverse-duplicate-${testimonial.name}`}
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
