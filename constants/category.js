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
    value: 'language',
    label: '語言與文學',
    image: 'https://i.imgur.com/YgvrDCz.png',
  },
  {
    key: 'math',
    value: 'math',
    label: '數學與邏輯',
    image: 'https://i.imgur.com/kXKWrmA.png',
  },
  {
    key: 'computer-science',
    value: 'computer-science',
    label: '資訊與工程',
    image: 'https://i.imgur.com/sIJeYIp.png',
  },
  {
    key: 'humanity',
    value: 'humanity',
    label: '人文社會',
    image: 'https://i.imgur.com/Ea2cmzs.png',
  },
  {
    key: 'nature-science',
    value: 'nature-science',
    label: '自然科學',
    image: 'https://i.imgur.com/jSaZ7AF.png',
  },
  {
    key: 'art',
    value: 'art',
    label: '藝術',
    image: 'https://i.imgur.com/GvJ1ddz.png',
  },
  {
    key: 'education',
    value: 'education',
    label: '教育',
    image: 'https://i.imgur.com/M21rIig.png',
  },
  {
    key: 'life',
    value: 'life',
    label: '生活',
    image: 'https://i.imgur.com/AQIxl4v.png',
  },
  {
    key: 'health',
    value: 'health',
    label: '運動/心理/醫學',
    image: 'https://i.imgur.com/QuuxALA.png',
  },
  {
    key: 'business',
    value: 'business',
    label: '商業與社會創新',
    image: 'https://i.imgur.com/ZVewhol.png',
  },
  {
    key: 'diversity',
    value: 'diversity',
    label: '綜合型學習資源',
    image: 'https://i.imgur.com/rFNVZy8.png',
  },
  {
    key: 'learningtools',
    value: 'learningtools',
    label: '學習/教學工具',
    image: 'https://i.imgur.com/qxhYvEI.png',
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

export const ACTIVITY_CATEGORY = [
  { label: '讀書會', value: 'study_group' },
  { label: '工作坊', value: 'workshop' },
  { label: '專案', value: 'project' },
  { label: '競賽', value: 'competition' },
  { label: '活動', value: 'event' },
  { label: '社團', value: 'club' },
  { label: '課程', value: 'course' },
  { label: '實習', value: 'internship' },
  { label: '其他', value: 'other' },
];
