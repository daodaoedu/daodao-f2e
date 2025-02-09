interface MotivationMap {
  label: string;
  value: string;
}
export const MOTIVATION_MAP: MotivationMap[] = [
  { label: '好奇心驅動', value: 'driven_by_curiosity' },
  { label: '興趣熱情', value: 'interest_and_passion' },
  { label: '自我挑戰', value: 'self_challenge' },
  { label: '個人成長', value: 'personal_growth' },
  { label: '職涯發展', value: 'career_development' },
  { label: '升學或資格獲取', value: 'pursuing_education_or_qualifications' },
  { label: '社會認可', value: 'social_recognition' },
  { label: '探索可能性', value: 'exploring_possibilities' },
  { label: '應對未來', value: 'preparing_for_the_future' },
  { label: '創新發展', value: 'innovation_and_development' },
  { label: '實用需求', value: 'practical_needs' },
  { label: '受事件啟發', value: 'inspired_by_events' },
  { label: '人際連結', value: 'interpersonal_connections' },
  { label: '生活發生變化', value: 'life_changes' },
  { label: '影響社會', value: 'impact_on_society' },
  { label: '受群體影響', value: 'influenced_by_a_group' },
  { label: '其他', value: 'others' }
];

interface StrategyMap {
  label: string;
  value: string;
}
export const STRATEGY_MAP: StrategyMap[] = [
  { label: '資料蒐集/研究/分析', value: 'data_collection_research_analysis' },
  { label: '書籍閱讀', value: 'book_reading' },
  { label: '觀看影片', value: 'watching_videos' },
  { label: '聽 Podcast', value: 'listening_to_podcasts' },
  { label: '考試', value: 'examinations' },
  { label: '參與競賽', value: 'participating_in_competitions' },
  { label: '找學伴共學', value: 'finding_study_partners' },
  { label: '參與社群', value: 'joining_communities' },
  { label: '找專家學者', value: 'consulting_experts_and_scholars' },
  { label: '做專案', value: 'doing_projects' },
  { label: '發起行動', value: 'initiating_actions' },
  { label: '場域實習', value: 'field_internship' },
  { label: '舉辦活動或課程', value: 'organizing_events_or_courses' },
  { label: '參與活動或課程', value: 'attending_events_or_courses' },
  { label: '田野調查', value: 'field_research' },
  { label: '訪談', value: 'conducting_interviews' },
  { label: '問卷調查', value: 'conducting_surveys' },
  { label: '其他', value: 'others' }
];

interface OutcomeMap {
  label: string;
  value: string;
}
export const OUTCOME_MAP: OutcomeMap[] = [
  { label: '架設網站', value: 'building_websites' },
  { label: '經營社群媒體', value: 'managing_social_media' },
  { label: '撰寫研究報告', value: 'writing_research_reports' },
  { label: '藝術創作', value: 'artistic_creation' },
  { label: '發起專案或組織', value: 'initiating_projects_or_organizations' },
  { label: '拍影片', value: 'making_videos' },
  { label: '舉辦活動', value: 'organizing_events' },
  { label: '開課', value: 'teaching_courses' },
  { label: '參與競賽', value: 'participating_in_competitions' },
  { label: '其他', value: 'others' }
];

export const EMOJI_OPTIONS = [
  { value: 'happy', label: '開心', emoji: '😊' },
  { value: 'calm', label: '平靜', emoji: '😌' },
  { value: 'anxious', label: '焦慮', emoji: '😟' },
  { value: 'tired', label: '疲憊', emoji: '😫' },
  { value: 'frustrated', label: '沮喪', emoji: '😤' },
];
