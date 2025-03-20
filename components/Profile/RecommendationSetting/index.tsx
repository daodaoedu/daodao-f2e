import { useState, useEffect } from 'react';
// import { cn } from '@/utils/cn';
import { useAuth } from '@/contexts/Auth';

interface InterestsState {
  technology: boolean;
  art: boolean;
  education: boolean;
  environment: boolean;
  health: boolean;
  community: boolean;
}

interface ResourceCategoriesState {
  articles: boolean;
  courses: boolean;
  books: boolean;
  videos: boolean;
  podcasts: boolean;
  tools: boolean;
}

interface FeedbackStyleState {
  detailed: boolean;
  concise: boolean;
  constructive: boolean;
  encouraging: boolean;
  technical: boolean;
}

interface PartnerPreferenceState {
  skillLevel: string;
  learningPace: string;
  communicationStyle: string;
}

type FrequencyType = 'daily' | 'weekly' | 'monthly';

const RecommendationSetting = () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { user: _user } = useAuth();

  // 添加自定義樣式以覆蓋原生的勾選框和滑動條顏色
  useEffect(() => {
    // 添加自定義CSS以修改勾選框和滑動條的顏色
    const styleEl = document.createElement('style');
    styleEl.innerHTML = `
      /* 自定義勾選框樣式 */
      input[type="checkbox"], input[type="radio"] {
        accent-color: #295E5C; /* primary-darker 顏色 */
        cursor: pointer;
      }
      
      /* 自定義勾選框與單選按鈕樣式 */
      input[type="checkbox"]:checked {
        background-color: #295E5C;
        border-color: #295E5C;
      }
      
      input[type="radio"]:checked {
        background-color: #295E5C;
        border-color: #295E5C;
      }
      
      input[type="checkbox"]:focus, input[type="radio"]:focus {
        box-shadow: 0 0 0 2px rgba(41, 94, 92, 0.3);
        outline: none;
      }
      
      /* 自定義滑動條樣式 */
      input[type="range"] {
        accent-color: #295E5C; /* primary-darker 顏色 */
        -webkit-appearance: none;
        appearance: none;
        width: 100%;
        height: 8px; /* 統一高度為8px */
        background: #DBDBDB; /* basic-200 顏色 */
        border-radius: 4px;
        outline: none;
      }
      
      /* Chrome/Safari 滑動條樣式 */
      input[type="range"]::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 16px;
        height: 16px;
        background: #295E5C; /* primary-darker 顏色 */
        border-radius: 50%;
        cursor: pointer;
        margin-top: -4px; /* 調整滑塋垂直位置，使其在軌道中線上 */
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }
      
      /* Firefox 滑動條樣式 */
      input[type="range"]::-moz-range-thumb {
        width: 16px;
        height: 16px;
        background: #295E5C; /* primary-darker 顏色 */
        border: none;
        border-radius: 50%;
        cursor: pointer;
        transform: translateY(-4px); /* Firefox 使用 transform 而非 margin-top */
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }
      
      /* 滑動條身體樣式 */
      input[type="range"]::-webkit-slider-runnable-track {
        background: linear-gradient(to right, #295E5C 0%, #295E5C var(--value, 70%), #DBDBDB var(--value, 70%), #DBDBDB 100%);
        border-radius: 4px;
        height: 8px;
      }
      
      input[type="range"]::-moz-range-track {
        background: #DBDBDB; /* basic-200 顏色 */
        border-radius: 4px;
        height: 8px;
      }
    `;
    document.head.appendChild(styleEl);

    return () => {
      document.head.removeChild(styleEl);
    };
  }, []);

  // 推薦設定的狀態
  const [interests, setInterests] = useState<InterestsState>({
    technology: true,
    art: false,
    education: true,
    environment: false,
    health: false,
    community: true,
  });

  // 推薦資源的類別喜好
  const [resourceCategories, setResourceCategories] = useState<ResourceCategoriesState>({
    articles: true,
    courses: true,
    books: false,
    videos: true,
    podcasts: false,
    tools: false,
  });

  // 回饋的風格選擇
  const [feedbackStyle, setFeedbackStyle] = useState<FeedbackStyleState>({
    detailed: true,
    concise: false,
    constructive: true,
    encouraging: true,
    technical: false,
  });

  // 配對的學習夥伴喜好
  const [partnerPreference, setPartnerPreference] = useState<PartnerPreferenceState>({
    skillLevel: 'similar', // similar, higher, lower, any
    learningPace: 'moderate', // fast, moderate, slow, any
    communicationStyle: 'balanced', // direct, balanced, supportive, any
  });

  // 引導師喜好
  const [mentorPreference, setMentorPreference] = useState({
    experienceLevel: 'experienced', // novice, intermediate, experienced, expert
    mentorshipStyle: 'structured', // structured, flexible, challengeBased, projectBased
  });

  const [recommendationFrequency, setRecommendationFrequency] = useState<FrequencyType>('weekly');
  const [relevanceLevel, setRelevanceLevel] = useState<number>(70);

  // 處理興趣變更
  const handleInterestChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInterests({
      ...interests,
      [event.target.name]: event.target.checked,
    });
  };

  // 處理資源類別變更
  const handleResourceCategoryChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setResourceCategories({
      ...resourceCategories,
      [event.target.name]: event.target.checked,
    });
  };

  // 處理回饋風格變更
  const handleFeedbackStyleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFeedbackStyle({
      ...feedbackStyle,
      [event.target.name]: event.target.checked,
    });
  };

  // 處理學習夥伴喜好變更
  const handlePartnerPreferenceChange = (field: keyof PartnerPreferenceState, value: string) => {
    setPartnerPreference({
      ...partnerPreference,
      [field]: value,
    });
  };

  // 處理引導師喜好變更
  const handleMentorPreferenceChange = (field: 'experienceLevel' | 'mentorshipStyle', value: string) => {
    setMentorPreference({
      ...mentorPreference,
      [field]: value,
    });
  };

  // 處理推薦頻率變更
  const handleFrequencyChange = (value: FrequencyType) => {
    setRecommendationFrequency(value);
  };

  // 處理相關度滑桿變更
  const handleRelevanceChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(event.target.value);
    setRelevanceLevel(value);

    // 更新滑動條的顏色
    const rangeInput = event.target;
    rangeInput.style.setProperty('--value', `${value}%`);
  };

  // 更新滑動條初始顏色
  useEffect(() => {
    const rangeInput = document.querySelector('input[type="range"]');
    if (rangeInput) {
      (rangeInput as HTMLElement).style.setProperty('--value', `${relevanceLevel}%`);
    }
  }, [relevanceLevel]);

  // 儲存設定
  const saveSettings = () => {
    // 這裡可以加入實際的 API 呼叫來儲存設定
    console.log('儲存設定', {
      interests,
      resourceCategories,
      feedbackStyle,
      partnerPreference,
      mentorPreference,
      recommendationFrequency,
      relevanceLevel,
    });

    // 顯示成功訊息或其他反饋
    // 使用更友好的UI元件取代原生alert
    // alert('設定已儲存');
    const saveConfirmEl = document.createElement('div');
    saveConfirmEl.className = 'fixed top-4 right-4 bg-green-500 text-white p-4 rounded-lg shadow-lg z-50';
    saveConfirmEl.innerHTML = '設定已儲存';
    document.body.appendChild(saveConfirmEl);

    setTimeout(() => {
      document.body.removeChild(saveConfirmEl);
    }, 3000);
  };

  return (
    <div className="w-full max-w-[672px] bg-basic-white rounded-2xl px-5 py-4 md:px-10 md:py-9 flex flex-col justify-center items-center">
      <h2 className="heading-md text-basic-400">
        推薦設定
      </h2>

      <div className="flex flex-col items-start w-full max-w-[544px] mt-6">
        {/* 興趣領域區塊 */}
        <div className="flex flex-col w-full">
          <h3 className="font-sans font-medium text-base text-basic-500">興趣領域</h3>
          <p className="font-sans font-medium text-sm text-basic-400 mt-2">
            選擇您感興趣的領域，我們將根據您的喜好提供更精準的推薦
          </p>

          <div className="mt-4 w-full">
            <div className="flex flex-wrap">
              {Object.entries(interests).map(([key, checked]) => (
                <div key={key} className="w-1/2 mb-3 flex items-center">
                  <input
                    type="checkbox"
                    id={`interest-${key}`}
                    name={key}
                    checked={checked}
                    onChange={handleInterestChange}
                    className="w-5 h-5 text-primary-darker bg-basic-white border-primary-darker rounded focus:ring-primary-darker"
                  />
                  <label
                    htmlFor={`interest-${key}`}
                    className="ml-2 text-base text-basic-500"
                  >
                    {key === 'technology' && '科技'}
                    {key === 'art' && '藝術'}
                    {key === 'education' && '教育'}
                    {key === 'environment' && '環境'}
                    {key === 'health' && '健康'}
                    {key === 'community' && '社區'}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="w-full h-[1px] bg-basic-200 my-8" />

        {/* 推薦資源的類別喜好 */}
        <div className="flex flex-col w-full">
          <h3 className="font-sans font-medium text-base text-basic-500">資源類別喜好</h3>
          <p className="font-sans font-medium text-sm text-basic-400 mt-2">
            選擇您偏好的資源類型，我們將為您推薦更符合需求的學習資源
          </p>

          <div className="mt-4 w-full">
            <div className="flex flex-wrap">
              {Object.entries(resourceCategories).map(([key, checked]) => (
                <div key={key} className="w-1/2 mb-3 flex items-center">
                  <input
                    type="checkbox"
                    id={`resource-${key}`}
                    name={key}
                    checked={checked}
                    onChange={handleResourceCategoryChange}
                    className="w-5 h-5 text-primary-darker bg-basic-white border-primary-darker rounded focus:ring-primary-darker"
                  />
                  <label
                    htmlFor={`resource-${key}`}
                    className="ml-2 text-base text-basic-500"
                  >
                    {key === 'articles' && '文章'}
                    {key === 'courses' && '線上課程'}
                    {key === 'books' && '書籍'}
                    {key === 'videos' && '影片教學'}
                    {key === 'podcasts' && '播客'}
                    {key === 'tools' && '工具'}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="w-full h-[1px] bg-basic-200 my-8" />

        {/* 回饋的風格選擇 */}
        <div className="flex flex-col w-full">
          <h3 className="font-sans font-medium text-base text-basic-500">回饋風格偏好</h3>
          <p className="font-sans font-medium text-sm text-basic-400 mt-2">
            選擇您希望收到的回饋風格，幫助您獲得更適合的學習體驗
          </p>

          <div className="mt-4 w-full">
            <div className="flex flex-wrap">
              {Object.entries(feedbackStyle).map(([key, checked]) => (
                <div key={key} className="w-1/2 mb-3 flex items-center">
                  <input
                    type="checkbox"
                    id={`feedback-${key}`}
                    name={key}
                    checked={checked}
                    onChange={handleFeedbackStyleChange}
                    className="w-5 h-5 text-primary-darker bg-basic-white border-primary-darker rounded focus:ring-primary-darker"
                  />
                  <label
                    htmlFor={`feedback-${key}`}
                    className="ml-2 text-base text-basic-500"
                  >
                    {key === 'detailed' && '詳細'}
                    {key === 'concise' && '簡潔'}
                    {key === 'constructive' && '建設性'}
                    {key === 'encouraging' && '鼓勵性'}
                    {key === 'technical' && '技術性'}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="w-full h-[1px] bg-basic-200 my-8" />

        {/* 配對的學習夥伴喜好 */}
        <div className="flex flex-col w-full">
          <h3 className="font-sans font-medium text-base text-basic-500">學習夥伴偏好</h3>
          <p className="font-sans font-medium text-sm text-basic-400 mt-2">
            設定您希望配對的學習夥伴特質，以獲得更好的協作體驗
          </p>

          <div className="mt-4 space-y-6">
            {/* 技能水平 */}
            <div>
              <p className="text-basic-500 mb-2">技能水平</p>
              <div className="flex flex-col space-y-3">
                {[
                  { value: 'similar', label: '與我相似的水平' },
                  { value: 'higher', label: '比我更有經驗' },
                  { value: 'lower', label: '比我經驗較少' },
                  { value: 'any', label: '任何水平都可以' }
                ].map((option) => (
                  <div key={option.value} className="flex items-center">
                    <input
                      type="radio"
                      id={`skill-${option.value}`}
                      name="skillLevel"
                      checked={partnerPreference.skillLevel === option.value}
                      onChange={() => handlePartnerPreferenceChange('skillLevel', option.value)}
                      className="w-5 h-5 text-primary-darker bg-basic-white border-primary-darker focus:ring-primary-darker"
                    />
                    <label
                      htmlFor={`skill-${option.value}`}
                      className="ml-2 text-base text-basic-500"
                    >
                      {option.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* 學習節奏 */}
            <div>
              <p className="text-basic-500 mb-2">學習節奏</p>
              <div className="flex flex-col space-y-3">
                {[
                  { value: 'fast', label: '快速學習' },
                  { value: 'moderate', label: '適中節奏' },
                  { value: 'slow', label: '深入理解' },
                  { value: 'any', label: '任何節奏都可以' }
                ].map((option) => (
                  <div key={option.value} className="flex items-center">
                    <input
                      type="radio"
                      id={`pace-${option.value}`}
                      name="learningPace"
                      checked={partnerPreference.learningPace === option.value}
                      onChange={() => handlePartnerPreferenceChange('learningPace', option.value)}
                      className="w-5 h-5 text-primary-darker bg-basic-white border-primary-darker focus:ring-primary-darker"
                    />
                    <label
                      htmlFor={`pace-${option.value}`}
                      className="ml-2 text-base text-basic-500"
                    >
                      {option.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* 溝通風格 */}
            <div>
              <p className="text-basic-500 mb-2">溝通風格</p>
              <div className="flex flex-col space-y-3">
                {[
                  { value: 'direct', label: '直接明確的溝通' },
                  { value: 'balanced', label: '平衡的溝通' },
                  { value: 'supportive', label: '支持性的溝通' },
                  { value: 'any', label: '任何溝通風格都可以' }
                ].map((option) => (
                  <div key={option.value} className="flex items-center">
                    <input
                      type="radio"
                      id={`comm-${option.value}`}
                      name="communicationStyle"
                      checked={partnerPreference.communicationStyle === option.value}
                      onChange={() => handlePartnerPreferenceChange('communicationStyle', option.value)}
                      className="w-5 h-5 text-primary-darker bg-basic-white border-primary-darker focus:ring-primary-darker"
                    />
                    <label
                      htmlFor={`comm-${option.value}`}
                      className="ml-2 text-base text-basic-500"
                    >
                      {option.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="w-full h-[1px] bg-basic-200 my-8" />

        {/* 引導師喜好 */}
        <div className="flex flex-col w-full">
          <h3 className="font-sans font-medium text-base text-basic-500">引導師偏好</h3>
          <p className="font-sans font-medium text-sm text-basic-400 mt-2">
            設定您希望配對的引導師特質，以獲得更好的指導體驗
          </p>

          <div className="mt-4 space-y-6">
            {/* 經驗程度 */}
            <div>
              <p className="text-basic-500 mb-2">經驗程度</p>
              <div className="flex flex-col space-y-3">
                {[
                  { value: 'novice', label: '新手（1-2年經驗）' },
                  { value: 'intermediate', label: '中級（3-5年經驗）' },
                  { value: 'experienced', label: '資深（6-10年經驗）' },
                  { value: 'expert', label: '專家（10年以上經驗）' }
                ].map((option) => (
                  <div key={option.value} className="flex items-center">
                    <input
                      type="radio"
                      id={`exp-${option.value}`}
                      name="experienceLevel"
                      checked={mentorPreference.experienceLevel === option.value}
                      onChange={() => handleMentorPreferenceChange('experienceLevel', option.value)}
                      className="w-5 h-5 text-primary-darker bg-basic-white border-primary-darker focus:ring-primary-darker"
                    />
                    <label
                      htmlFor={`exp-${option.value}`}
                      className="ml-2 text-base text-basic-500"
                    >
                      {option.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* 指導風格 */}
            <div>
              <p className="text-basic-500 mb-2">指導風格</p>
              <div className="flex flex-col space-y-3">
                {[
                  { value: 'structured', label: '結構化指導（循序漸進）' },
                  { value: 'flexible', label: '彈性指導（適應學習需求）' },
                  { value: 'challengeBased', label: '挑戰式指導（以問題為導向）' },
                  { value: 'projectBased', label: '專案式指導（實作為主）' }
                ].map((option) => (
                  <div key={option.value} className="flex items-center">
                    <input
                      type="radio"
                      id={`style-${option.value}`}
                      name="mentorshipStyle"
                      checked={mentorPreference.mentorshipStyle === option.value}
                      onChange={() => handleMentorPreferenceChange('mentorshipStyle', option.value)}
                      className="w-5 h-5 text-primary-darker bg-basic-white border-primary-darker focus:ring-primary-darker"
                    />
                    <label
                      htmlFor={`style-${option.value}`}
                      className="ml-2 text-base text-basic-500"
                    >
                      {option.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="w-full h-[1px] bg-basic-200 my-8" />

        {/* 推薦頻率區塊 */}
        <div className="flex flex-col w-full">
          <h3 className="font-sans font-medium text-base text-basic-500">推薦頻率</h3>
          <p className="font-sans font-medium text-sm text-basic-400 mt-2">
            選擇您希望收到新推薦的頻率
          </p>

          <div className="mt-4">
            <div className="flex flex-col space-y-3">
              {[
                { value: 'daily', label: '每日' },
                { value: 'weekly', label: '每週' },
                { value: 'monthly', label: '每月' }
              ].map((option) => (
                <div key={option.value} className="flex items-center">
                  <input
                    type="radio"
                    id={`frequency-${option.value}`}
                    name="frequency"
                    checked={recommendationFrequency === option.value}
                    onChange={() => handleFrequencyChange(option.value as FrequencyType)}
                    className="w-5 h-5 text-primary-darker bg-basic-white border-primary-darker focus:ring-primary-darker"
                  />
                  <label
                    htmlFor={`frequency-${option.value}`}
                    className="ml-2 text-base text-basic-500"
                  >
                    {option.label}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="w-full h-[1px] bg-basic-200 my-8" />

        {/* 內容相關度區塊 */}
        <div className="flex flex-col w-full">
          <h3 className="font-sans font-medium text-base text-basic-500">內容相關度</h3>
          <p className="font-sans font-medium text-sm text-basic-400 mt-2">
            調整推薦內容的相關度，數值越高表示內容越符合您的興趣
          </p>

          <div className="w-full mt-6">
            <div className="flex items-center justify-center">
              <span className="text-sm text-basic-400 mr-3">
                {relevanceLevel}%
              </span>
              <input
                type="range"
                min="0"
                max="100"
                step="10"
                value={relevanceLevel}
                onChange={handleRelevanceChange}
                className="w-full h-2 bg-basic-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            <div className="flex justify-between mt-2">
              <span className="text-sm text-basic-400">完全多元</span>
              <span className="text-sm text-basic-400">完全相關</span>
            </div>
          </div>
        </div>

        {/* 儲存按鈕 */}
        <div className="w-full flex justify-center mt-8">
          <button
            type="button"
            onClick={saveSettings}
            className="bg-primary-darker text-basic-white rounded-full py-2 px-6 w-[120px] hover:bg-basic-500 transition-colors"
          >
            儲存設定
          </button>
        </div>
      </div>
    </div>
  );
};

export default RecommendationSetting;
