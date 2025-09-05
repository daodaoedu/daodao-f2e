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
      avatar: '',
      rating: 5,
    },
    {
      name: 'Mina',
      role: '高中生 @ 島島阿學',
      content: '帳面上看起來很複雜，但任務被拆成小步驟後，我每天都有成就感。',
      avatar: '',
      rating: 5,
    },
    {
      name: 'Rex',
      role: '上班族 @ 島島阿學',
      content: '提醒與紀錄整合在一起，不用另外開 App，維持起來超輕鬆。',
      avatar: '',
      rating: 5,
    },
    {
      name: 'Yui',
      role: '日語學習者 @ 島島阿學',
      content: '原本總是半途而廢的我，透過主題實踐功能，成功完成了 30 天的日語學習挑戰。',
      avatar: '',
      rating: 5,
    },
    {
      name: 'Leo',
      role: '日語學習者 @ 島島阿學',
      content: '原本總是半途而廢的我，透過主題實踐功能，成功完成了 30 天的日語學習挑戰。',
      avatar: '',
      rating: 5,
    },
    {
      name: 'Enn',
      role: '設計師 @ 島島阿學',
      content: '把學習拆進日常情境的做法，對我超實用。',
      avatar: '',
      rating: 5,
    },
  ];

  return (
    <section className={cn('py-20 bg-white', className)}>
      <div className="max-w-6xl mx-auto px-4">
        {/* 第一排（往右） */}
        <div className="mb-8 overflow-hidden">
          <div className="flex space-x-6 animate-marquee">
            {testimonials.map((testimonial, index) => (
              <TestimonialCard
                key={index}
                name={testimonial.name}
                role={testimonial.role}
                content={testimonial.content}
                avatar={testimonial.avatar}
                rating={testimonial.rating}
              />
            ))}
            {/* 重複一次以實現無縫循環 */}
            {testimonials.map((testimonial, index) => (
              <TestimonialCard
                key={`duplicate-${index}`}
                name={testimonial.name}
                role={testimonial.role}
                content={testimonial.content}
                avatar={testimonial.avatar}
                rating={testimonial.rating}
              />
            ))}
          </div>
        </div>

        {/* 第二排（往左） */}
        <div className="overflow-hidden">
          <div className="flex space-x-6 animate-marquee-reverse">
            {testimonials.slice().reverse().map((testimonial, index) => (
              <TestimonialCard
                key={`reverse-${index}`}
                name={testimonial.name}
                role={testimonial.role}
                content={testimonial.content}
                avatar={testimonial.avatar}
                rating={testimonial.rating}
              />
            ))}
            {/* 重複一次以實現無縫循環 */}
            {testimonials.slice().reverse().map((testimonial, index) => (
              <TestimonialCard
                key={`reverse-duplicate-${index}`}
                name={testimonial.name}
                role={testimonial.role}
                content={testimonial.content}
                avatar={testimonial.avatar}
                rating={testimonial.rating}
              />
            ))}
          </div>
        </div>

        <style jsx>{`
          @keyframes marquee {
            0% {
              transform: translateX(0);
            }
            100% {
              transform: translateX(-50%);
            }
          }
          @keyframes marquee-reverse {
            0% {
              transform: translateX(-50%);
            }
            100% {
              transform: translateX(0);
            }
          }
          .animate-marquee {
            animation: marquee 30s linear infinite;
          }
          .animate-marquee-reverse {
            animation: marquee-reverse 30s linear infinite;
          }
        `}</style>
      </div>
    </section>
  );
}
