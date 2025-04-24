import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/Auth';
import { 
  PREFERENCE_TYPES, 
  PREFERENCE_OPTIONS, 
  PreferenceType, 
  PreferenceOption 
} from '@/constants/preferences';

// 使用者偏好設定的介面
interface UserPreferences {
  [key: number]: number; // option_id: level (1-10的偏好程度)
}

// 分組後的偏好選項類型
interface GroupedPreferenceOptions {
  [key: string]: PreferenceOption[];
}

const RecommendationSetting = () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { user: _user } = useAuth();

  // 選項分組和使用者偏好的狀態
  const [groupedOptions, setGroupedOptions] = useState<GroupedPreferenceOptions>({});
  const [userPreferences, setUserPreferences] = useState<UserPreferences>({});
  const [relevanceLevel, setRelevanceLevel] = useState<number>(70);

  // 初始化選項分組和模擬使用者偏好
  useEffect(() => {
    // 將選項按類型分組
    const grouped: GroupedPreferenceOptions = {};
    
    PREFERENCE_OPTIONS.forEach(option => {
      const typeValue = PREFERENCE_TYPES.find(type => type.id === option.preference_type_id)?.value || '';
      if (!grouped[typeValue]) {
        grouped[typeValue] = [];
      }
      grouped[typeValue].push(option);
    });
    
    setGroupedOptions(grouped);
    
    // 模擬已有的使用者偏好設定
    // 在實際應用中，這應該從API取得
    setUserPreferences({
      1: 8, // 文字為主 - 偏好程度8
      7: 9, // 詳細指導型 - 偏好程度9
      16: 7, // 實作引導 - 偏好程度7
      21: 8, // 同儕學習型 - 偏好程度8
    });
  }, []);

  // 處理偏好程度變更
  const handlePreferenceLevelChange = (optionId: number, level: number) => {
    setUserPreferences(prev => ({
      ...prev,
      [optionId]: level
    }));
  };
  
  // 處理偏好選擇變更
  const handlePreferenceOptionChange = (optionId: number, checked: boolean) => {
    if (checked) {
      // 如果選中，設定一個預設值 (例如 7)
      setUserPreferences(prev => ({
        ...prev,
        [optionId]: 7
      }));
    } else {
      // 如果取消選中，移除此偏好
      setUserPreferences(prev => {
        const newPreferences = { ...prev };
        delete newPreferences[optionId];
        return newPreferences;
      });
    }
  };
  
  // 檢查選項是否被選中
  const isOptionSelected = (optionId: number) => {
    return userPreferences[optionId] !== undefined;
  };
  
  // 取得選項的偏好程度
  const getPreferenceLevel = (optionId: number) => {
    return userPreferences[optionId] || 5; // 預設值是5
  };

  // 處理相關度滑桿變更
  const handleRelevanceChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(event.target.value);
    setRelevanceLevel(value);
  };

  // 取得滑桿進度寬度百分比
  const getProgressWidth = (value: number, max: number) => {
    return `${(value / max) * 100}%`;
  };

  // 儲存設定
  const saveSettings = () => {
    // 轉換使用者偏好為API格式
    const userPreferencesData = Object.entries(userPreferences).map(([optionId, level]) => ({
      preference_option_id: Number(optionId),
      preference_level: level
    }));
    
    // 這裡可以加入實際的 API 呼叫來儲存設定
    console.log('儲存設定', {
      userPreferences: userPreferencesData,
      relevanceLevel,
    });

    // 顯示成功訊息或其他反饋
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
        {/* 動態渲染偏好設定分類 */}
        {PREFERENCE_TYPES.map((type) => (
          <div key={type.id} className="flex flex-col w-full">
            <h3 className="font-sans font-medium text-base text-basic-500">{type.name}</h3>
            <p className="font-sans font-medium text-sm text-basic-400 mt-2">
              {type.description}
            </p>

            <div className="mt-4 w-full">
              {/* 檢查此類型是否有選項可用 */}
              {groupedOptions[type.value] && groupedOptions[type.value].length > 0 ? (
                <div className="flex flex-col space-y-4">
                  {groupedOptions[type.value].map((option) => (
                    <div key={option.id} className="flex flex-col">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id={`option-${option.id}`}
                          checked={isOptionSelected(option.id)}
                          onChange={(e) => handlePreferenceOptionChange(option.id, e.target.checked)}
                          className="w-5 h-5 accent-[#295E5C] border-[#295E5C] rounded cursor-pointer"
                        />
                        <label
                          htmlFor={`option-${option.id}`}
                          className="ml-2 text-base text-basic-500 cursor-pointer"
                        >
                          {option.name}
                        </label>
                      </div>
                      
                      {/* 如果選項被選中，顯示滑動條來調整偏好程度 */}
                      {isOptionSelected(option.id) && (
                        <div className="ml-7 mt-3 w-full max-w-sm">
                          <div className="flex items-center mb-1">
                            <span className="text-sm text-basic-400 mr-3 w-5 text-center">
                              {getPreferenceLevel(option.id)}
                            </span>
                            <div className="relative w-full h-8 flex items-center">
                              {/* 背景軌道 */}
                              <div className="absolute w-full h-2 bg-[#E6E6E6] rounded"></div>
                              
                              {/* 進度條 */}
                              <div 
                                className="absolute h-2 bg-[#295E5C] rounded-l" 
                                style={{ width: getProgressWidth(getPreferenceLevel(option.id), 10) }}
                              ></div>
                              
                              {/* 圓點位置 */}
                              <div 
                                className="absolute h-4 w-4 bg-[#295E5C] rounded-full z-10"
                                style={{ left: getProgressWidth(getPreferenceLevel(option.id), 10), marginLeft: '-8px' }}
                              ></div>
                              
                              {/* 實際的輸入元素 (隱藏但可操作) */}
                              <input
                                type="range"
                                min="1"
                                max="10"
                                step="1"
                                value={getPreferenceLevel(option.id)}
                                onChange={(e) => handlePreferenceLevelChange(option.id, Number(e.target.value))}
                                className="absolute w-full opacity-0 cursor-pointer z-20 h-8"
                              />
                            </div>
                          </div>
                          <div className="flex justify-between ml-8">
                            <span className="text-xs text-basic-400">較低</span>
                            <span className="text-xs text-basic-400">較高</span>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-basic-300 italic">暫無此類型的選項</p>
              )}
            </div>
            
            <div className="w-full h-[1px] bg-basic-200 my-8" />
          </div>
        ))}

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
