export interface ICategory {
  value: string;
  label: string;
  image?: string;
}

export const CATEGORIES_VALUES = {
  languages: "languages",
  mathematical_logic: "mathematical_logic",
  information_computer_science: "information_computer_science",
  humanities_history_geography: "humanities_history_geography",
  nature_environment: "nature_environment",
  arts_design: "arts_design",
  education_learning: "education_learning",
  lifestyle: "lifestyle",
  medicine_sports: "medicine_sports",
  business_management_finance: "business_management_finance",
  social_innovation_sustainability: "social_innovation_sustainability",
  personal_development: "personal_development",
};

export const CATEGORIES: ICategory[] = [
  {
    value: CATEGORIES_VALUES.languages,
    label: CATEGORIES_VALUES.languages,
    image: "https://i.imgur.com/YgvrDCz.png",
  },
  {
    value: CATEGORIES_VALUES.mathematical_logic,
    label: CATEGORIES_VALUES.mathematical_logic,
    image: "https://i.imgur.com/kXKWrmA.png",
  },
  {
    value: CATEGORIES_VALUES.information_computer_science,
    label: CATEGORIES_VALUES.information_computer_science,
    image: "https://i.imgur.com/sIJeYIp.png",
  },
  {
    value: CATEGORIES_VALUES.humanities_history_geography,
    label: CATEGORIES_VALUES.humanities_history_geography,
    image: "https://i.imgur.com/Ea2cmzs.png",
  },
  {
    value: CATEGORIES_VALUES.nature_environment,
    label: CATEGORIES_VALUES.nature_environment,
    image: "https://i.imgur.com/jSaZ7AF.png",
  },
  {
    value: CATEGORIES_VALUES.arts_design,
    label: CATEGORIES_VALUES.arts_design,
    image: "https://i.imgur.com/GvJ1ddz.png",
  },
  {
    value: CATEGORIES_VALUES.education_learning,
    label: CATEGORIES_VALUES.education_learning,
    image: "https://i.imgur.com/M21rIig.png",
  },
  {
    value: CATEGORIES_VALUES.lifestyle,
    label: CATEGORIES_VALUES.lifestyle,
    image: "https://i.imgur.com/AQIxl4v.png",
  },
  {
    value: CATEGORIES_VALUES.medicine_sports,
    label: CATEGORIES_VALUES.medicine_sports,
    image: "https://i.imgur.com/QuuxALA.png",
  },
  {
    value: CATEGORIES_VALUES.business_management_finance,
    label: CATEGORIES_VALUES.business_management_finance,
    image: "https://i.imgur.com/ZVewhol.png",
  },
  {
    value: CATEGORIES_VALUES.social_innovation_sustainability,
    label: CATEGORIES_VALUES.social_innovation_sustainability,
    image: "https://i.imgur.com/rFNVZy8.png",
  },
  {
    value: CATEGORIES_VALUES.personal_development,
    label: CATEGORIES_VALUES.personal_development,
    image: "https://i.imgur.com/qxhYvEI.png",
  },
];

export const SEARCH_TAGS: Record<string, ICategory[]> = {
  [CATEGORIES_VALUES.languages]: [
    { value: "chinese", label: "chinese" },
    { value: "english", label: "english" },
    { value: "japanese", label: "japanese" },
    { value: "korean", label: "korean" },
    { value: "german", label: "german" },
    { value: "french", label: "french" },
    { value: "spanish", label: "spanish" },
    { value: "russian", label: "russian" },
    { value: "vietnamese", label: "vietnamese" },
    { value: "indonesian", label: "indonesian" },
    { value: "filipino", label: "filipino" },
    { value: "taiwanese", label: "taiwanese" },
    { value: "hakka", label: "hakka" },
    { value: "indigenous_languages", label: "indigenous_languages" },
    { value: "linguistics", label: "linguistics" },
    { value: "application_language", label: "application_language" },
    { value: "other_languages", label: "other_languages" },
  ],
  [CATEGORIES_VALUES.mathematical_logic]: [
    { value: "mathematics", label: "mathematics" },
    { value: "algebra", label: "algebra" },
    { value: "geometry", label: "geometry" },
    { value: "trigonometry", label: "trigonometry" },
    { value: "statistical_probability", label: "statistical_probability" },
    { value: "calculus", label: "calculus" },
    { value: "applied_mathematics", label: "applied_mathematics" },
    { value: "logic", label: "logic" },
    { value: "theory_calculation", label: "theory_calculation" },
  ],
  [CATEGORIES_VALUES.information_computer_science]: [
    { value: "computer_science", label: "computer_science" },
    { value: "programming_development", label: "programming_development" },
    { value: "artificial_intelligence", label: "artificial_intelligence" },
    { value: "data_science_big_data", label: "data_science_big_data" },
    { value: "network_information_security", label: "network_information_security" },
    { value: "ar_vr", label: "ar_vr" },
    { value: "internet_of_things_iot", label: "internet_of_things_iot" },
    { value: "robotics", label: "robotics" },
    { value: "future_technology_trends", label: "future_technology_trends" },
  ],
  [CATEGORIES_VALUES.humanities_history_geography]: [
    { value: "history", label: "history" },
    { value: "geography", label: "geography" },
    { value: "philosophy", label: "philosophy" },
    { value: "literature", label: "literature" },
    { value: "religion", label: "religion" },
    { value: "culture", label: "culture" },
    { value: "archeology", label: "archeology" },
    { value: "folk_culture", label: "folk_culture" },
  ],
  [CATEGORIES_VALUES.nature_environment]: [
    { value: "earth_science", label: "earth_science" },
    { value: "physics", label: "physics" },
    { value: "biology", label: "biology" },
    { value: "chemistry", label: "chemistry" },
    { value: "environment", label: "environment" },
    { value: "natural_resources_conservation", label: "natural_resources_conservation" },
    { value: "agriculture", label: "agriculture" },
  ],
  [CATEGORIES_VALUES.arts_design]: [
    { value: "visual_communication", label: "visual_communication" },
    { value: "fine_arts", label: "fine_arts" },
    { value: "industrial_design", label: "industrial_design" },
    { value: "commercial_design", label: "commercial_design" },
    { value: "architecture_spatial_design", label: "architecture_spatial_design" },
    { value: "fashion_apparel_design", label: "fashion_apparel_design" },
    { value: "digital_media_design", label: "digital_media_design" },
    { value: "photography", label: "photography" },
    { value: "film_television", label: "film_television" },
    { value: "music", label: "music" },
    { value: "performing_arts", label: "performing_arts" },
    { value: "ux_ui", label: "ux_ui" },
    { value: "design_thinking", label: "design_thinking" },
  ],
  [CATEGORIES_VALUES.education_learning]: [
    { value: "educational_innovation", label: "educational_innovation" },
    { value: "experimental_education", label: "experimental_education" },
    { value: "adult_education", label: "adult_education" },
    { value: "early_childhood_education", label: "early_childhood_education" },
    { value: "elementary_education", label: "elementary_education" },
    { value: "secondary_education", label: "secondary_education" },
    { value: "higher_education", label: "higher_education" },
    { value: "learning_science", label: "learning_science" },
  ],
  [CATEGORIES_VALUES.lifestyle]: [
    { value: "food_cooking", label: "food_cooking" },
    { value: "fashion_styling", label: "fashion_styling" },
    { value: "home_decoration", label: "home_decoration" },
    { value: "travel_leisure", label: "travel_leisure" },
    { value: "art_appreciation", label: "art_appreciation" },
    { value: "collections_antiques", label: "collections_antiques" },
    { value: "handicraft", label: "handicraft" },
  ],
  [CATEGORIES_VALUES.medicine_sports]: [
    { value: "nursing_health_care", label: "nursing_health_care" },
    { value: "medicine", label: "medicine" },
    { value: "pharmacy", label: "pharmacy" },
    { value: "veterinary", label: "veterinary" },
    { value: "long_term_care", label: "long_term_care" },
    { value: "occupational_therapy", label: "occupational_therapy" },
    { value: "nutrition_diet", label: "nutrition_diet" },
    { value: "exercise_science_fitness", label: "exercise_science_fitness" },
    { value: "sports_athletics", label: "sports_athletics" },
  ],
  [CATEGORIES_VALUES.business_management_finance]: [
    { value: "investment", label: "investment" },
    { value: "public-relations", label: "public-relations" },
    { value: "human-resources", label: "human-resources" },
  ],
  [CATEGORIES_VALUES.social_innovation_sustainability]: [
    { value: "social_innovation", label: "social_innovation" },
    { value: "sustainable_development", label: "sustainable_development" },
    { value: "social_responsibility", label: "social_responsibility" },
    { value: "social_impact", label: "social_impact" },
  ],
  [CATEGORIES_VALUES.personal_development]: [
    { value: "life_journey", label: "life_journey" },
    { value: "career", label: "career" },
    { value: "self_improvement", label: "self_improvement" },
  ],
};

const getPathnameBySubCategory = (subCategoryValue: string) => {
  const category = Object.entries(SEARCH_TAGS).find(([, tags]) =>
    tags.some((tag) => tag.value === subCategoryValue)
  );
  return `${category?.[0] ?? ""}/${subCategoryValue}`;
};

export const HOT_TAGS = [
  {
    value: getPathnameBySubCategory("artificial_intelligence"),
    label: "artificial_intelligence",
  },
  {
    value: getPathnameBySubCategory("social_innovation"),
    label: "social_innovation",
  },
  {
    value: getPathnameBySubCategory("investment"),
    label: "investment",
  },
  {
    value: getPathnameBySubCategory("educational_innovation"),
    label: "educational_innovation",
  },
];

export const getResourceCategoryLabelKey = (value: string) =>
  `resource_category_${value.replace(/[^a-zA-Z0-9]/g, "_")}`;
