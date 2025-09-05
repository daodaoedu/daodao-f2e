export const TESTIMONIALS = [
  {
    id: 'will',
    name: 'Will',
    role: '日語學習者 @ 島島阿學',
    content: '原本總是半途而廢的我，透過主題實踐功能，成功完成了 30 天的日語學習挑戰。',
    avatar: '/assets/avatar-boy.svg',
    rating: 5,
  },
  {
    id: 'mina',
    name: 'Mina',
    role: '高中生 @ 島島阿學',
    content: '帳面上看起來很複雜，但任務被拆成小步驟後，我每天都有成就感。',
    avatar: '/assets/avatar-girl.svg',
    rating: 5,
  },
  {
    id: 'rex',
    name: 'Rex',
    role: '上班族 @ 島島阿學',
    content: '提醒與紀錄整合在一起，不用另外開 App，維持起來超輕鬆。',
    avatar: '/assets/avatar-boy.svg',
    rating: 5,
  },
  {
    id: 'yui',
    name: 'Yui',
    role: '日語學習者 @ 島島阿學',
    content: '原本總是半途而廢的我，透過主題實踐功能，成功完成了 30 天的日語學習挑戰。',
    avatar: '/assets/avatar-girl.svg',
    rating: 5,
  },
  {
    id: 'leo',
    name: 'Leo',
    role: '日語學習者 @ 島島阿學',
    content: '原本總是半途而廢的我，透過主題實踐功能，成功完成了 30 天的日語學習挑戰。',
    avatar: '/assets/avatar-boy.svg',
    rating: 5,
  },
  {
    id: 'enn',
    name: 'Enn',
    role: '設計師 @ 島島阿學',
    content: '把學習拆進日常情境的做法，對我超實用。',
    avatar: '/assets/avatar-girl.svg',
    rating: 5,
  },
] as const;

export type TestimonialId = typeof TESTIMONIALS[number]['id'];
export type Testimonial = typeof TESTIMONIALS[number];
