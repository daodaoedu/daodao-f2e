import { OptionProps } from '@/components/ui/option';

export interface ICategory extends OptionProps {
  image?: string;
}

export const CATEGORIES_VALUES = {
  languages: 'languages',
  mathematical_logic: 'mathematical_logic',
  information_computer_science: 'information_computer_science',
  humanities_history_geography: 'humanities_history_geography',
  nature_environment: 'nature_environment',
  arts_design: 'arts_design',
  education_learning: 'education_learning',
  lifestyle: 'lifestyle',
  medicine_sports: 'medicine_sports',
  business_management_finance: 'business_management_finance',
  social_innovation_sustainability: 'social_innovation_sustainability',
  personal_development: 'personal_development',
};

export const CATEGORIES: ICategory[] = [
  {
    value: CATEGORIES_VALUES.languages,
    label: '語言',
    image: 'https://i.imgur.com/YgvrDCz.png',
  },
  {
    value: CATEGORIES_VALUES.mathematical_logic,
    label: '數理邏輯',
    image: 'https://i.imgur.com/kXKWrmA.png',
  },
  {
    value: CATEGORIES_VALUES.information_computer_science,
    label: '資訊與電腦科學',
    image: 'https://i.imgur.com/sIJeYIp.png',
  },
  {
    value: CATEGORIES_VALUES.humanities_history_geography,
    label: '人文史地',
    image: 'https://i.imgur.com/Ea2cmzs.png',
  },
  {
    value: CATEGORIES_VALUES.nature_environment,
    label: '自然與環境',
    image: 'https://i.imgur.com/jSaZ7AF.png',
  },
  {
    value: CATEGORIES_VALUES.arts_design,
    label: '藝術與設計',
    image: 'https://i.imgur.com/GvJ1ddz.png',
  },
  {
    value: CATEGORIES_VALUES.education_learning,
    label: '教育與學習',
    image: 'https://i.imgur.com/M21rIig.png',
  },
  {
    value: CATEGORIES_VALUES.lifestyle,
    label: '生活品味',
    image: 'https://i.imgur.com/AQIxl4v.png',
  },
  {
    value: CATEGORIES_VALUES.medicine_sports,
    label: '醫藥與運動',
    image: 'https://i.imgur.com/QuuxALA.png',
  },
  {
    value: CATEGORIES_VALUES.business_management_finance,
    label: '商管與理財',
    image: 'https://i.imgur.com/ZVewhol.png',
  },
  {
    value: CATEGORIES_VALUES.social_innovation_sustainability,
    label: '社會創新與永續',
    image: 'https://i.imgur.com/rFNVZy8.png',
  },
  {
    value: CATEGORIES_VALUES.personal_development,
    label: '個人發展',
    image: 'https://i.imgur.com/qxhYvEI.png',
  },
];

export const SEARCH_TAGS: Record<string, ICategory[]> = {
  [CATEGORIES_VALUES.languages]: [
    { value: 'chinese', label: '中文' },
    { value: 'english', label: '英語' },
    { value: 'japanese', label: '日語' },
    { value: 'korean', label: '韓語' },
    { value: 'german', label: '德語' },
    { value: 'french', label: '法語' },
    { value: 'spanish', label: '西語' },
    { value: 'russian', label: '俄語' },
    { value: 'vietnamese', label: '越南語' },
    { value: 'indonesian', label: '印尼語' },
    { value: 'filipino', label: '菲律賓語' },
    { value: 'taiwanese', label: '台語' },
    { value: 'hakka', label: '客語' },
    { value: 'indigenous_languages', label: '原住民語' },
    { value: 'linguistics', label: '語言學' },
    { value: 'application_language', label: '應用語言' },
    { value: 'other_languages', label: '其他語言' },
  ],
  [CATEGORIES_VALUES.mathematical_logic]: [
    { value: 'mathematics', label: '數學' },
    { value: 'algebra', label: '代數' },
    { value: 'geometry', label: '幾何' },
    { value: 'trigonometry', label: '三角' },
    { value: 'statistical_probability', label: '統計機率' },
    { value: 'calculus', label: '微積分' },
    { value: 'applied_mathematics', label: '應用數學' },
    { value: 'logic', label: '邏輯' },
    { value: 'theory_calculation', label: '理論與計算' },
  ],
  [CATEGORIES_VALUES.information_computer_science]: [
    { value: 'computer_science', label: '計算機科學' },
    { value: 'programming_development', label: '程式設計與開發' },
    { value: 'artificial_intelligence', label: '人工智慧' },
    { value: 'data_science_big_data', label: '資料科學與大數據' },
    { value: 'network_information_security', label: '網路與資安' },
    { value: 'ar_vr', label: 'AR/VR' },
    { value: 'internet_of_things_iot', label: '物聯網 IoT' },
    { value: 'robotics', label: '機器人技術' },
    { value: 'future_technology_trends', label: '未來科技與趨勢' },
  ],
  [CATEGORIES_VALUES.humanities_history_geography]: [
    { value: 'history', label: '歷史' },
    { value: 'geography', label: '地理' },
    { value: 'philosophy', label: '哲學' },
    { value: 'literature', label: '文學' },
    { value: 'religion', label: '宗教' },
    { value: 'culture', label: '文化' },
    { value: 'archeology', label: '考古' },
    { value: 'folk_culture', label: '民俗' },
  ],
  [CATEGORIES_VALUES.nature_environment]: [
    { value: 'earth_science', label: '地球科學' },
    { value: 'physics', label: '物理' },
    { value: 'biology', label: '生物' },
    { value: 'chemistry', label: '化學' },
    { value: 'environment', label: '環境' },
    { value: 'natural_resources_conservation', label: '自然資源與保育' },
    { value: 'agriculture', label: '農業' },
  ],
  [CATEGORIES_VALUES.arts_design]: [
    { value: 'visual_communication', label: '視覺傳達設計' },
    { value: 'fine_arts', label: '美術' },
    { value: 'industrial_design', label: '工業設計' },
    { value: 'commercial_design', label: '商業設計' },
    { value: 'architecture_spatial_design', label: '建築與空間設計' },
    { value: 'fashion_apparel_design', label: '時尚與服裝設計' },
    { value: 'digital_media_design', label: '數位媒體設計' },
    { value: 'photography', label: '攝影' },
    { value: 'film_television', label: '影視' },
    { value: 'music', label: '音樂' },
    { value: 'performing_arts', label: '表演藝術' },
    { value: 'ux_ui', label: 'UX/UI' },
    { value: 'design_thinking', label: '設計思考' },
  ],
  [CATEGORIES_VALUES.education_learning]: [
    { value: 'educational_innovation', label: '教育創新' },
    { value: 'experimental_education', label: '實驗教育' },
    { value: 'adult_education', label: '成人教育' },
    { value: 'early_childhood_education', label: '幼兒教育' },
    { value: 'elementary_education', label: '國小教育' },
    { value: 'secondary_education', label: '中學教育' },
    { value: 'higher_education', label: '高等教育' },
    { value: 'learning_science', label: '學習科學' },
  ],
  [CATEGORIES_VALUES.lifestyle]: [
    { value: 'food_cooking', label: '美食烹飪' },
    { value: 'fashion_styling', label: '時尚穿搭' },
    { value: 'home_decoration', label: '家居裝飾' },
    { value: 'travel_leisure', label: '旅遊休閒' },
    { value: 'art_appreciation', label: '藝術鑑賞' },
    { value: 'collections_antiques', label: '收藏與古董' },
    { value: 'handicraft', label: '手工藝' },
  ],
  [CATEGORIES_VALUES.medicine_sports]: [
    { value: 'nursing_health_care', label: '護理與健康照護' },
    { value: 'medicine', label: '醫學' },
    { value: 'pharmacy', label: '藥學' },
    { value: 'veterinary', label: '獸醫學' },
    { value: 'long_term_care', label: '長照' },
    { value: 'occupational_therapy', label: '職能治療' },
    { value: 'nutrition_diet', label: '營養與飲食' },
    { value: 'exercise_science_fitness', label: '運動科學與健身' },
    { value: 'sports_athletics', label: '運動與競技' },
  ],
  [CATEGORIES_VALUES.business_management_finance]: [
    { value: 'investment', label: '投資理財' },
    { value: 'public-relations', label: '公關行銷' },
    { value: 'human-resources', label: '人力資源' },
  ],
  [CATEGORIES_VALUES.social_innovation_sustainability]: [
    { value: 'social_innovation', label: '社會創新' },
    { value: 'sustainable_development', label: '永續發展' },
    { value: 'social_responsibility', label: '社會責任' },
    { value: 'social_impact', label: '社會影響力' },
  ],
  [CATEGORIES_VALUES.personal_development]: [
    { value: 'life_journey', label: '生涯' },
    { value: 'career', label: '職涯' },
    { value: 'self_improvement', label: '自我成長' },
  ],
};

const getPathnameBySubCategory = (subCategoryValue: string) => {
  const category = Object.entries(SEARCH_TAGS).find(([, tags]) => tags.some((tag) => tag.value === subCategoryValue));
  return `${category?.[0] ?? ''}/${subCategoryValue}`;
};

export const HOT_TAGS = [
  {
    value: getPathnameBySubCategory('artificial_intelligence'),
    label: '人工智慧',
  },
  {
    value: getPathnameBySubCategory('social_innovation'),
    label: '社會創新',
  },
  {
    value: getPathnameBySubCategory('investment'),
    label: '投資理財',
  },
  {
    value: getPathnameBySubCategory('educational_innovation'),
    label: '教育創新',
  },
];

export const NAV_LINK = [
  {
    name: '找資源',
    link: '/resource',
    target: '_self',
  },
  {
    name: '找揪團',
    link: '/circles',
    target: '_self',
  },
  {
    name: '加入社群',
    link: '/join',
    target: '_self',
  },
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

export const MARATHON_LINKS = [
  {
    name: '活動詳情',
    link: '/learning-marathons/2025S1#marathon-intro',
  },
  {
    name: '活動公告',
    link: '/learning-marathon/announcements',
  },
  {
    name: '學習計畫分享區',
    link: '/projects',
  },
];

export const USER_LINK = [
  { name: '帳號設定', id: 'account-setting' },
  { name: '個人化推薦', id: 'personalized-recommendations' },
  { name: '島島幣', id: 'daodao-coin' },
];

export const FOOTER_LINK = [
  {
    name: '找資源',
    link: '/resource',
    target: '_self',
  },
  {
    name: '找揪團',
    link: '/circles',
    target: '_self',
  },
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
