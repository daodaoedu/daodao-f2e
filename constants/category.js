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
    label: '語言與文學',
    value: '語言與文學',
  },
  {
    key: 'math',
    label: '數學與邏輯',
    value: '數學與邏輯',
  },
  {
    key: 'comsci',
    label: '資訊與工程',
    value: '資訊與工程',
  },
  {
    key: 'humanity',
    label: '人文社會',
    value: '人文社會',
  },
  {
    key: 'natusci',
    label: '自然科學',
    value: '自然科學',
  },
  {
    key: 'art',
    label: '藝術',
    value: '藝術',
  },
  {
    key: 'education',
    label: '教育',
    value: '教育',
  },
  {
    key: 'life',
    label: '生活',
    value: '生活',
  },
  {
    key: 'health',
    label: '運動/心理/醫學',
    value: '運動/心理/醫學',
  },
  {
    key: 'business',
    label: '商業與社會創新',
    value: '商業與社會創新',
  },
  {
    key: 'multires',
    label: '綜合型學習資源',
    value: '綜合型學習資源',
  },
  {
    key: 'learningtools',
    label: '學習/教學工具',
    value: '學習/教學工具',
  },
];

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

export const MARATHON_LINKS = [
  {
    name: '活動詳情',
    link: '/learning-marathon#marathon-intro',
  },
  {
    name: '活動公告（未公開）',
    link: '/marathon-announcement',
    disabled: true
  },
  {
    name: '學習計畫分享區（未公開）',
    link: '/marathon-sharing',
    disabled: true
  },
  {
    name: '成果分享（未公開）',
    link: '/project-sharing',
    disabled: true,
  },
];

export const USER_LINK = [
  { name: '個人資料', id: 'person-setting' },
  { name: '我的揪團', id: 'my-group' },
  { name: '帳號設定', id: 'account-setting' },
  { name: '學習馬拉松', id: 'my-marathon' },
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
  {
    name: '加入社群',
    link: '/join',
    target: '_self',
  },
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
