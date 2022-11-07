export const SEARCH_TAGS = {
  全部: ['英語', '心理學', '數學', '設計', '教育創新', '日文', '生命教育'],
  語言與文學: [
    '中文',
    '英語',
    '有聲書',
    '聽力',
    '單字',
    '閱讀',
    '多語言型學習資源',
    '口說',
    '寫作',
    '日文',
  ],
  數學與邏輯: ['數學', '邏輯'],
  資訊與工程: ['程式設計'],
  人文社會: [
    '歷史',
    '文化',
    '法律',
    '政治',
    '經濟',
    '國際情勢',
    '社會議題',
    '哲學',
  ],
  自然科學: ['物理', '化學', '生物', '地科', '動畫'],
  藝術: [
    '圖片素材',
    '設計',
    '排版素材',
    '戲劇',
    '繪畫',
    '音樂',
    '藝文資訊',
    '攝影',
  ],
  教育: [
    '實驗教育',
    '自主學習',
    '民主教育',
    '生涯探索',
    '升學資訊',
    '教學方法',
    '教育創新',
  ],
  生活: ['烘焙烹飪', '食農', '媒體', '旅遊', '攝影'],
  '運動/心理/醫學': [
    '運動',
    '心理學',
    '醫學',
    '輔導',
    '自我成長',
    '諮商',
    '生命教育',
  ],
  商業與社會創新: ['投資理財', '公關行銷', '社會創新', '人力資源'],
  綜合型學習資源: ['MOOC', '多元學習類型', '學科類型'],
  '學習/教學工具': ['線上教學', '視訊軟體', '數位學習', '提案軟體'],
};

export const CATEGORIES = [
  {
    key: 'language',
    value: '語言與文學',
  },
  {
    key: 'math',
    value: '數學與邏輯',
  },
  {
    key: 'comsci',
    value: '資訊與工程',
  },
  {
    key: 'humanity',
    value: '人文社會',
  },
  {
    key: 'natusci',
    value: '自然科學',
  },
  {
    key: 'art',
    value: '藝術',
  },
  {
    key: 'education',
    value: '教育',
  },
  {
    key: 'life',
    value: '生活',
  },
  {
    key: 'health',
    value: '運動/心理/醫學',
  },
  {
    key: 'business',
    value: '商業與社會創新',
  },
  {
    key: 'multires',
    value: '綜合型學習資源',
  },
  {
    key: 'learningtools',
    value: '學習/教學工具',
  },
];

// 學習教育工具：線上教學, 視訊軟體, 數位學習, 提案軟體

export const CATEGORY_ID = {
  language: 'da015b1a389b43cda9f01876294064e0',
  math: '3280294e76f04a7da209fe7aeb74da8b',
  comsci: 'f4eacf180d5747659be504e5c36394a4',
  natusci: 'c150ccabb6904be8998c5f570ddfbf6b',
  humanity: '99a2093948bd4ea4bef2d195c9611829',
  art: 'a95e102660984949b54ed4d454d6ee71',
  education: '9899ec31e6b64c80890a729a438c5c82',
  life: 'e958a830c3aa4f2ab181c68eb68eec91',
  health: '1a547d664bd147d7b4da7cc23fa68f45',
  business: 'd014e00881b94985862c284af7397862',
  multires: '0d1bbefdc8e94bb09c96eabe239834a8',
};

export const CATEGORY_NAME = {
  language: '語言與文學',
  math: '數學與邏輯',
  comsci: '資訊與工程',
  natusci: '自然科學',
  humanity: '人文社會',
  art: '藝術',
  education: '教育',
  life: '生活',
  health: '運動/心理/醫學',
  business: '商業與社會創新',
  multires: '綜合型學習資源',
};

export const CATEGORY_LINK = [
  {
    title: '語言與文學',
    link: '/category/language',
    image: '/assets/images/cat1.jpeg',
  },
  {
    title: '數學與邏輯',
    link: '/category/math',
    image: '/assets/images/cat2.jpeg',
  },
  {
    title: '資訊與工程',
    link: '/category/comsci',
    image: '/assets/images/cat3.jpeg',
  },
  {
    title: '自然科學',
    link: '/category/natusci',
    image: '/assets/images/cat4.jpeg',
  },
  {
    title: '人文社會',
    link: '/category/humanity',
    image: '/assets/images/cat5.jpeg',
  },
  {
    title: '藝術',
    link: '/category/art',
    image: '/assets/images/cat6.jpeg',
  },
  {
    title: '教育',
    link: '/category/education',
    image: '/assets/images/cat7.jpeg',
  },
  {
    title: '生活',
    link: '/category/life',
    image: '/assets/images/cat8.jpeg',
  },
  {
    title: '運動/心理/醫學',
    link: '/category/health',
    image: '/assets/images/cat9.jpeg',
  },
  {
    title: '商業與社會創新',
    link: '/category/business',
    image: '/assets/images/cat10.jpeg',
  },
  {
    title: '綜合型學習資源',
    link: '/category/multires',
    image: '/assets/images/cat11.jpeg',
  },
];

export const NAV_LINK = [
  {
    name: '找資源',
    link: '/search',
    target: '_self',
  },
  {
    name: '找活動',
    link: '/activities',
    target: '_self',
  },
  {
    name: '找故事',
    link: 'https://blog.daoedu.tw',
    target: '_blank',
  },
  {
    name: '找場域',
    link: '/locations',
    target: '_self',
  },
  {
    name: '加入社群',
    link: 'https://www.facebook.com/groups/2237666046370459',
    target: '_blank',
  },
  // {
  //   name: '找學習空間',
  //   link: 'https://www.facebook.com/groups/2237666046370459',
  // },
];

export const NAV_LINK_MOBILE = [
  {
    name: '找資源',
    link: '/search',
    target: '_self',
  },
  {
    name: '找活動',
    link: '/activities',
    target: '_self',
  },
  {
    name: '找故事',
    link: 'https://blog.daoedu.tw',
    target: '_blank',
  },
  {
    name: '找場域',
    link: '/locations',
    target: '_self',
  },
  {
    name: '新增資源',
    link: '/contribute/resource',
    target: '_self',
  },
  {
    name: '關於島島',
    link: '/about',
    target: '_self',
  },
  {
    name: '加入社群',
    link: 'https://www.facebook.com/groups/2237666046370459',
    target: '_blank',
  },
  // {
  //   name: '找學習空間',
  //   link: 'https://www.facebook.com/groups/2237666046370459',
  // },
];

export const FOOTER_LINK = [
  {
    name: '找資源',
    link: '/search',
    target: '_self',
  },
  {
    name: '找活動',
    link: '/activities',
    target: '_self',
  },
  {
    name: '找場域',
    link: '/locations',
    target: '_self',
  },
  {
    name: '加入社群',
    link: 'https://www.facebook.com/groups/2237666046370459',
    target: '_blank',
  },
  {
    name: '隱私權政策',
    link: '/privacypolicy',
    target: '_self',
  },
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
