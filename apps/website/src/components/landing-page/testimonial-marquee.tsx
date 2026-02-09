import { Image } from "@daodao/ui/components/image";
import { cn } from "@daodao/ui/lib/utils";

// Generate unique IDs for testimonials
const generateId = () => Math.random().toString(36).substring(2, 15);

interface TestimonialCardProps {
  name: string;
  role: string;
  content: string;
  avatar: string;
}

export function TestimonialCard({ name, role, content, avatar }: TestimonialCardProps) {
  return (
    <article className="min-h-[120px] w-80 rounded-[20px] bg-[#F3FDFF] p-4 grid grid-cols-[72px_1fr] items-start gap-3 sm:w-[260px] sm:grid-cols-[60px_1fr]">
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
        <p className="m-0 mb-2 text-[15px] leading-normal text-[#13333b]">{content}</p>
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
    id: generateId(),
    name: "Tania",
    role: "插畫工作者",
    content:
      "過去總是三分鐘熱度，這次用島島實踐「日更插畫」，居然連續打卡了 14 天，第一次覺得自己也能堅持下去....",
    avatar: "/assets/landing-page/avatar-girl.svg",
  },
  {
    id: generateId(),
    name: "Leo",
    role: "外語學習者",
    content:
      "一直想練英文口說，也買了課程，卻不知道從哪開始...在島島阿學給自己規定每天要學多少進度，慢慢地累積出學習成果了（雖然還是常常偷懶哈哈哈）",
    avatar: "/assets/landing-page/avatar-boy.svg",
  },
  {
    id: generateId(),
    name: "Yuki",
    role: "前端工程師",
    content:
      "寫程式寫到懷疑人生🙃 但看到島島上的其他人也在努力，讓我覺得不孤單。這個平台很有陪伴感～～",
    avatar: "/assets/landing-page/avatar-girl.svg",
  },
  {
    id: generateId(),
    name: "Sean",
    role: "UI 設計師",
    content:
      "用島島記錄我轉職的每一步，從技能列表、每日進度到心得紀錄，全部留存下來。想到將來可以跟大家分享自己的過程就很興奮!!!",
    avatar: "/assets/landing-page/avatar-boy.svg",
  },
  {
    id: generateId(),
    name: "Irene",
    role: "自媒體",
    content: "島島讓我可以一邊讀書一邊整理想法，搭配圖像上傳，像是在做學習日誌一樣❤️",
    avatar: "/assets/landing-page/avatar-girl.svg",
  },
  {
    id: generateId(),
    name: "Max",
    role: "大學生",
    content:
      "我是學習拖延症末期患者，但島島的「打卡提醒」真的有用，再加上能看到進度變化，像玩遊戲一樣想解鎖每一步。",
    avatar: "/assets/landing-page/avatar-boy.svg",
  },
  {
    id: generateId(),
    name: "Chloe",
    role: "社會新鮮人",
    content: "努力就是要讓別人看到對吧~~這裡可以PO文分享學習心得超棒的",
    avatar: "/assets/landing-page/avatar-girl.svg",
  },
  {
    id: generateId(),
    name: "Kenji",
    role: "自媒體",
    content:
      "我是走感覺派+嚴重三分鐘熱度，計畫什麼的從來堅持不久，但島島讓我第一次覺得計畫也可以是有彈性的、可以有選擇的",
    avatar: "/assets/landing-page/avatar-boy.svg",
  },
  {
    id: generateId(),
    name: "Mei",
    role: "插畫學習者",
    content:
      "自學一陣子插畫，一直畫畫停停。這次挑戰 21 天上傳圖文日誌，也從島島阿學的學習資源挖到了很多寶藏，飛速前進中！！🚀",
    avatar: "/assets/landing-page/avatar-girl.svg",
  },
];

export function TestimonialMarquee({ className }: TestimonialMarqueeProps) {
  return (
    <section className={cn("section-block pb-8 grid gap-9 overflow-hidden", className)}>
      {/* 第一排（往右） */}
      <div className="animate-marquee-reverse mask-marquee hover:paused" aria-hidden="true">
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
      <div className="animate-marquee mask-marquee hover:paused" aria-hidden="true">
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
