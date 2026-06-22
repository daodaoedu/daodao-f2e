export interface ResourceCategory {
  value: string;
  label: string;
  image?: string;
}

export const RESOURCE_CATEGORIES: ResourceCategory[] = [
  { value: "languages", label: "語言", image: "https://i.imgur.com/YgvrDCz.png" },
  { value: "mathematical_logic", label: "數理邏輯", image: "https://i.imgur.com/kXKWrmA.png" },
  {
    value: "information_computer_science",
    label: "資訊與電腦科學",
    image: "https://i.imgur.com/sIJeYIp.png",
  },
  {
    value: "humanities_history_geography",
    label: "人文史地",
    image: "https://i.imgur.com/Ea2cmzs.png",
  },
  { value: "nature_environment", label: "自然與環境", image: "https://i.imgur.com/jSaZ7AF.png" },
  { value: "arts_design", label: "藝術與設計", image: "https://i.imgur.com/GvJ1ddz.png" },
  { value: "education_learning", label: "教育與學習", image: "https://i.imgur.com/M21rIig.png" },
  { value: "lifestyle", label: "生活品味", image: "https://i.imgur.com/AQIxl4v.png" },
  { value: "medicine_sports", label: "醫藥與運動", image: "https://i.imgur.com/QuuxALA.png" },
  {
    value: "business_management_finance",
    label: "商管與理財",
    image: "https://i.imgur.com/ZVewhol.png",
  },
  {
    value: "social_innovation_sustainability",
    label: "社會創新與永續",
    image: "https://i.imgur.com/rFNVZy8.png",
  },
  { value: "personal_development", label: "個人發展", image: "https://i.imgur.com/qxhYvEI.png" },
];

export const RESOURCE_SUBCATEGORIES: Record<string, ResourceCategory[]> = {
  languages: [
    { value: "chinese", label: "中文" },
    { value: "english", label: "英語" },
    { value: "japanese", label: "日語" },
    { value: "korean", label: "韓語" },
    { value: "german", label: "德語" },
    { value: "french", label: "法語" },
    { value: "spanish", label: "西語" },
    { value: "russian", label: "俄語" },
    { value: "vietnamese", label: "越南語" },
    { value: "indonesian", label: "印尼語" },
    { value: "filipino", label: "菲律賓語" },
    { value: "taiwanese", label: "台語" },
    { value: "hakka", label: "客語" },
    { value: "indigenous_languages", label: "原住民語" },
    { value: "linguistics", label: "語言學" },
    { value: "application_language", label: "應用語言" },
    { value: "other_languages", label: "其他語言" },
  ],
  mathematical_logic: [
    { value: "mathematics", label: "數學" },
    { value: "algebra", label: "代數" },
    { value: "geometry", label: "幾何" },
    { value: "trigonometry", label: "三角" },
    { value: "statistical_probability", label: "統計機率" },
    { value: "calculus", label: "微積分" },
    { value: "applied_mathematics", label: "應用數學" },
    { value: "logic", label: "邏輯" },
    { value: "theory_calculation", label: "理論與計算" },
  ],
  information_computer_science: [
    { value: "computer_science", label: "計算機科學" },
    { value: "programming_development", label: "程式設計與開發" },
    { value: "artificial_intelligence", label: "人工智慧" },
    { value: "data_science_big_data", label: "資料科學與大數據" },
    { value: "network_information_security", label: "網路與資安" },
    { value: "ar_vr", label: "AR/VR" },
    { value: "internet_of_things_iot", label: "物聯網 IoT" },
    { value: "robotics", label: "機器人技術" },
    { value: "future_technology_trends", label: "未來科技與趨勢" },
  ],
  humanities_history_geography: [
    { value: "history", label: "歷史" },
    { value: "geography", label: "地理" },
    { value: "philosophy", label: "哲學" },
    { value: "literature", label: "文學" },
    { value: "religion", label: "宗教" },
    { value: "culture", label: "文化" },
    { value: "archeology", label: "考古" },
    { value: "folk_culture", label: "民俗" },
  ],
  nature_environment: [
    { value: "earth_science", label: "地球科學" },
    { value: "physics", label: "物理" },
    { value: "biology", label: "生物" },
    { value: "chemistry", label: "化學" },
    { value: "environment", label: "環境" },
    { value: "natural_resources_conservation", label: "自然資源與保育" },
    { value: "agriculture", label: "農業" },
  ],
  arts_design: [
    { value: "visual_communication", label: "視覺傳達設計" },
    { value: "fine_arts", label: "美術" },
    { value: "industrial_design", label: "工業設計" },
    { value: "commercial_design", label: "商業設計" },
    { value: "architecture_spatial_design", label: "建築與空間設計" },
    { value: "fashion_apparel_design", label: "時尚與服裝設計" },
    { value: "digital_media_design", label: "數位媒體設計" },
    { value: "photography", label: "攝影" },
    { value: "film_television", label: "影視" },
    { value: "music", label: "音樂" },
    { value: "performing_arts", label: "表演藝術" },
    { value: "ux_ui", label: "UX/UI" },
    { value: "design_thinking", label: "設計思考" },
  ],
  education_learning: [
    { value: "educational_innovation", label: "教育創新" },
    { value: "experimental_education", label: "實驗教育" },
    { value: "adult_education", label: "成人教育" },
    { value: "early_childhood_education", label: "幼兒教育" },
    { value: "elementary_education", label: "國小教育" },
    { value: "secondary_education", label: "中學教育" },
    { value: "higher_education", label: "高等教育" },
    { value: "learning_science", label: "學習科學" },
  ],
  lifestyle: [
    { value: "food_cooking", label: "美食烹飪" },
    { value: "fashion_styling", label: "時尚穿搭" },
    { value: "home_decoration", label: "家居裝飾" },
    { value: "travel_leisure", label: "旅遊休閒" },
    { value: "art_appreciation", label: "藝術鑑賞" },
    { value: "collections_antiques", label: "收藏與古董" },
    { value: "handicraft", label: "手工藝" },
  ],
  medicine_sports: [
    { value: "nursing_health_care", label: "護理與健康照護" },
    { value: "medicine", label: "醫學" },
    { value: "pharmacy", label: "藥學" },
    { value: "veterinary", label: "獸醫學" },
    { value: "long_term_care", label: "長照" },
    { value: "occupational_therapy", label: "職能治療" },
    { value: "nutrition_diet", label: "營養與飲食" },
    { value: "exercise_science_fitness", label: "運動科學與健身" },
    { value: "sports_athletics", label: "運動與競技" },
  ],
  business_management_finance: [
    { value: "investment", label: "投資理財" },
    { value: "public-relations", label: "公關行銷" },
    { value: "human-resources", label: "人力資源" },
  ],
  social_innovation_sustainability: [
    { value: "social_innovation", label: "社會創新" },
    { value: "sustainable_development", label: "永續發展" },
    { value: "social_responsibility", label: "社會責任" },
    { value: "social_impact", label: "社會影響力" },
  ],
  personal_development: [
    { value: "life_journey", label: "生涯" },
    { value: "career", label: "職涯" },
    { value: "self_improvement", label: "自我成長" },
  ],
};

export function getResourceCategory(value?: string | null) {
  if (!value) return undefined;
  return RESOURCE_CATEGORIES.find((category) => category.value === value);
}

export function getResourceSubcategory(majorCategory?: string | null, subCategory?: string | null) {
  if (!majorCategory || !subCategory) return undefined;
  return RESOURCE_SUBCATEGORIES[majorCategory]?.find((category) => category.value === subCategory);
}
