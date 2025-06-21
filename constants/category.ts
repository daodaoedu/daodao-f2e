export interface ICategory {
  value: string;
  label: string;
  image?: string;
}

export const CATEGORIES: ICategory[] = [
  {
    value: 'language',
    label: '語言與文學',
    image: 'https://i.imgur.com/YgvrDCz.png',
  },
  {
    value: 'math',
    label: '數學與邏輯',
    image: 'https://i.imgur.com/kXKWrmA.png',
  },
  {
    value: 'computer-science',
    label: '資訊與工程',
    image: 'https://i.imgur.com/sIJeYIp.png',
  },
  {
    value: 'humanity',
    label: '人文社會',
    image: 'https://i.imgur.com/Ea2cmzs.png',
  },
  {
    value: 'nature-science',
    label: '自然科學',
    image: 'https://i.imgur.com/jSaZ7AF.png',
  },
  {
    value: 'art',
    label: '藝術',
    image: 'https://i.imgur.com/GvJ1ddz.png',
  },
  {
    value: 'education',
    label: '教育',
    image: 'https://i.imgur.com/M21rIig.png',
  },
  {
    value: 'life',
    label: '生活',
    image: 'https://i.imgur.com/AQIxl4v.png',
  },
  {
    value: 'health',
    label: '運動/心理/醫學',
    image: 'https://i.imgur.com/QuuxALA.png',
  },
  {
    value: 'business',
    label: '商業與社會創新',
    image: 'https://i.imgur.com/ZVewhol.png',
  },
  {
    value: 'diversity',
    label: '綜合型學習資源',
    image: 'https://i.imgur.com/rFNVZy8.png',
  },
  {
    value: 'learningtools',
    label: '學習/教學工具',
    image: 'https://i.imgur.com/qxhYvEI.png',
  },
];

export const SEARCH_TAGS: Record<string, ICategory[]> = {
  all: [
    { value: 'english', label: '英語' },
    { value: 'psychology', label: '心理學' },
    { value: 'math', label: '數學' },
    { value: 'design', label: '設計' },
    { value: 'education', label: '教育創新' },
    { value: 'japanese', label: '日文' },
    { value: 'life', label: '生命教育' },
  ],
  language: [
    { value: 'chinese', label: '中文' },
    { value: 'english', label: '英語' },
    { value: 'audio-book', label: '有聲書' },
    { value: 'listening', label: '聽力' },
    { value: 'vocabulary', label: '單字' },
    { value: 'reading', label: '閱讀' },
    { value: 'multilingual', label: '多語言型學習資源' },
    { value: 'speaking', label: '口說' },
    { value: 'writing', label: '寫作' },
    { value: 'japanese', label: '日文' },
  ],
  math: [
    { value: 'math', label: '數學' },
    { value: 'logic', label: '邏輯' },
  ],
  'computer-science': [{ value: 'programming', label: '程式設計' }],
  humanity: [
    { value: 'history', label: '歷史' },
    { value: 'culture', label: '文化' },
    { value: 'law', label: '法律' },
    { value: 'politics', label: '政治' },
    { value: 'economy', label: '經濟' },
    { value: 'international-situation', label: '國際情勢' },
    { value: 'social-issues', label: '社會議題' },
    { value: 'philosophy', label: '哲學' },
  ],
  'nature-science': [
    { value: 'physics', label: '物理' },
    { value: 'chemistry', label: '化學' },
    { value: 'biology', label: '生物' },
    { value: 'geology', label: '地科' },
    { value: 'animation', label: '動畫' },
  ],
  art: [
    { value: 'image-material', label: '圖片素材' },
    { value: 'design', label: '設計' },
    { value: 'layout-material', label: '排版素材' },
    { value: 'theater', label: '戲劇' },
    { value: 'drawing', label: '繪畫' },
    { value: 'music', label: '音樂' },
    { value: 'art-information', label: '藝文資訊' },
    { value: 'photography', label: '攝影' },
  ],
  education: [
    { value: 'experimental-education', label: '實驗教育' },
    { value: 'self-learning', label: '自主學習' },
    { value: 'democratic-education', label: '民主教育' },
    { value: 'career-exploration', label: '生涯探索' },
    { value: 'college-admission-information', label: '升學資訊' },
    { value: 'teaching-methods', label: '教學方法' },
    { value: 'education-innovation', label: '教育創新' },
  ],
  life: [
    { value: 'cooking', label: '烘焙烹飪' },
    { value: 'food-agriculture', label: '食農' },
    { value: 'media', label: '媒體' },
    { value: 'travel', label: '旅遊' },
    { value: 'photography', label: '攝影' },
  ],
  health: [
    { value: 'sports', label: '運動' },
    { value: 'psychology', label: '心理學' },
    { value: 'medicine', label: '醫學' },
    { value: 'guidance', label: '輔導' },
  ],
  business: [
    { value: 'investment', label: '投資理財' },
    { value: 'public-relations', label: '公關行銷' },
    { value: 'social-innovation', label: '社會創新' },
    { value: 'human-resources', label: '人力資源' },
  ],
  diversity: [
    { value: 'mooc', label: 'MOOC' },
    { value: 'online-teaching', label: '線上教學' },
    { value: 'video-software', label: '視訊軟體' },
    { value: 'digital-learning', label: '數位學習' },
    { value: 'proposal-software', label: '提案軟體' },
  ],
  learningtools: [],
};

export const NAV_LINK = [
  {
    name: '找資源',
    link: '/search',
    target: '_self',
  },
  {
    name: '找夥伴',
    link: '/partner',
    target: '_self',
  },
  {
    name: '找揪團',
    link: '/group',
    target: '_self',
  },
  // {
  //   name: '找想法',
  //   link: '/ideas',
  //   target: '_self',
  // },
  // {
  //   name: '找活動',
  //   link: '/activities',
  //   target: '_self',
  // },
  // {
  //   name: '找故事',
  //   link: 'https://blog.daoedu.tw',
  //   target: '_blank',
  // },
  // {
  //   name: '找場域',
  //   link: '/locations',
  //   target: '_self',
  // },
  {
    name: '加入社群',
    link: '/join',
    target: '_self',
  },
  // {
  //   name: '找學習空間',
  //   link: 'https://www.facebook.com/groups/2237666046370459',
  // },
];

// 新首頁導航連結
export const LOGGED_OUT_NAV_LINK = [
  {
    name: '重新定義',
    link: '/#features',
    target: '_self',
  },
  {
    name: '如何開始',
    link: '/#how-it-works',
    target: '_self',
  },
];

export const LOGGED_IN_NAV_LINK = [
  {
    name: '探索',
    link: '/#explore',
    target: '_self',
  },
  {
    name: '交流',
    link: '/#community',
    target: '_self',
  },
  {
    name: '資源',
    link: '/new-resource',
    target: '_self',
  },
];

export const MARATHON_LINKS = [
  {
    name: '活動詳情',
    link: '/learning-marathon#marathon-intro',
  },
  {
    name: '活動公告',
    link: '/learning-marathon/announcements',
  },
  {
    name: '學習計畫分享區',
    link: '/projects',
  },
  // {
  //   name: '成果分享（未公開）',
  //   link: '/project-sharing',
  //   disabled: true,
  // },
];

export const USER_LINK = [
  { name: '帳號設定', id: 'account-setting' },
  { name: '個人化推薦', id: 'personalized-recommendations' },
  { name: '島島幣', id: 'daodao-coin' },
];

export const FOOTER_LINK = [
  {
    name: '找資源',
    link: '/search',
    target: '_self',
  },
  {
    name: '找夥伴',
    link: '/partner',
    target: '_self',
  },
  {
    name: '找揪團',
    link: '/group',
    target: '_self',
  },
  // {
  //   name: '找想法',
  //   link: '/ideas',
  //   target: '_self',
  // },
  {
    name: '找故事',
    link: 'https://blog.daoedu.tw',
    target: '_blank',
  },
  // {
  //   name: '找活動',
  //   link: '/activities',
  //   target: '_self',
  // },
  // {
  //   name: '找場域',
  //   link: '/locations',
  //   target: '_self',
  // },
  // {
  //   name: '加入社群',
  //   link: '/join',
  //   target: '_self',
  // },
  // {
  //   name: '隱私權政策',
  //   link: '/terms/privacypolicy',
  //   target: '_self',
  // },
  // {
  //   name: "體驗問卷",
  //   link: "https://docs.google.com/forms/d/e/1FAIpQLSeyU9-Q-kIWp5uutcik3h-RO4o5VuG6oG0m-4u1Ua18EOu3aw/viewform",
  // },
  // {
  //   name: "關於島島",
  //   link: "/about",
  // },
  // {
  //   name: '找學習空間',
  //   link: 'https://www.facebook.com/groups/2237666046370459',
  // },
];

export const OTHER_OPTION = { label: '其他', value: 'other' };

export const ACTIVITY_CATEGORIES = [
  { label: '讀書會', value: 'study_group' },
  { label: '工作坊', value: 'workshop' },
  { label: '專案', value: 'project' },
  { label: '競賽', value: 'competition' },
  { label: '活動', value: 'event' },
  { label: '社團', value: 'club' },
  { label: '課程', value: 'course' },
  { label: '實習', value: 'internship' },
  OTHER_OPTION,
];
