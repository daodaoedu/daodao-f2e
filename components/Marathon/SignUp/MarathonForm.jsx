import { useState, useEffect, useReducer } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import {
  updateNewMarathon
} from '@/redux/actions/marathon';
import { initialState as reduxInitMarathonState } from '@/redux/reducers/marathon';
import { getMarathonErrorsStorage } from '@/utils/storage';

import {
  Box,
  Typography,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import ClearIcon from '@mui/icons-material/Clear';

import MilestoneGroup from './MilestoneGroup';
import {
  StyledGroup,
  StyledSection,
  StyledButtonGroup,
  StyledButton,
  StyledInputBase,
  StyledTextareaAutosize,
} from './Edit.styled';
import MultiSelectDropdown from './MultiSelectDropdown';
import PricingForm from './PricingForm';

const marathonFormReducer = (state, action) => {
  const { key, value } = action.payload;
  switch (action.type) {
    case 'SET_NEW_MARATHON':
      return {
        ...state,
        ...action.payload.value
      };
    case 'UPDATE_FIELD':
      return {
        ...state,
        [key]: value
      };
    case 'UPDATE_MOTIVATION_FIELD':
      return {
        ...state,
        motivation: {
          ...state.motivation,
          [key]: value,
        }
      };
    case 'UPDATE_STRATEGIES_FIELD':
      return {
        ...state,
        strategies: {
          ...state.strategies,
          [key]: value,
        }
      };
    case 'UPDATE_OUTCOMES_FIELD':
      return {
        ...state,
        outcomes: {
          ...state.outcomes,
          [key]: value,
        }
      };
    default:
      return state;
  }
};

export default function MarathonForm({
  setCurrentStep,
  currentStep,
}) {
  const reduxDispatch = useDispatch();
  const [hasLoaded, setHasLoaded] = useState(false);
  const [errors, setErrors] = useState({});
  const marathonState = useSelector((state) => { return state.marathon; });
  const localStorgeStored = window.localStorage.getItem('newMarathon');
  const editingMarathon = localStorgeStored ? JSON.parse(localStorgeStored) : null;

  const initialState = () => {
    // 優先使用編輯中的資料，其次使用暫存在 marathonState 的資料，最後使用 reduxInit 預設模板
    return editingMarathon || marathonState || reduxInitMarathonState;
  };
  const [newMarathon, setNewMarathon] = useReducer(marathonFormReducer, initialState());

  const validators = {
    required: (value) => {
      return value.trim().length > 0;
    },
    allMilestonesNameRequired: (value, milestonesLength) => {
      const names = value.filter((milestone) => milestone?.name.trim().length > 0);
      return names.length === milestonesLength;
    }
  };

  const marathonDataMap = {
    title: {
      dispatchType: 'UPDATE_FIELD',
      dispatchKey: 'title',
      validate: validators.required,
      message: '請填寫表格',
    },
    description: {
      dispatchType: 'UPDATE_FIELD',
      dispatchKey: 'description',
      validate: validators.required,
      message: '請填寫計畫敘述',
    },
    motivationDescription: {
      dispatchType: 'UPDATE_MOTIVATION_FIELD',
      dispatchKey: 'description',
      validate: validators.required,
      message: '請填寫學習動機',
    },
    outcomesDescription: {
      dispatchType: 'UPDATE_OUTCOMES_FIELD',
      dispatchKey: 'description',
      validate: validators.required,
      message: '請填寫學習成果',
    },
    goals: {
      dispatchType: 'UPDATE_FIELD',
      dispatchKey: 'goals',
      validate: validators.required,
      message: '請填寫學習目標',
    },
    content: {
      dispatchType: 'UPDATE_FIELD',
      dispatchKey: 'content',
      validate: validators.required,
      message: '請填寫學習內容',
    },
    milestonesName: {
      dispatchType: 'UPDATE_FIELD',
      dispatchKey: 'milestones',
      validate: (value) => {
        return validators.allMilestonesNameRequired(value, newMarathon.milestones?.length);
      },
      message: '請填寫每週/隔週里程碑目標',
    },
    strategiesDescription: {
      dispatchType: 'UPDATE_STRATEGIES_FIELD',
      dispatchKey: 'description',
      validate: validators.required,
      message: '請填寫學習策略',
    },
    resources: {
      dispatchType: 'UPDATE_FIELD',
      dispatchKey: 'resources',
      validate: validators.required,
      message: '請填寫學習資源'
    }
  };

  /**
   * @param {string} name - The name of the field to validate.
   * @param {*} input - The input value to validate.
   * @returns {boolean} - Returns true if the input value passes validation, otherwise false.
   */
  const handleValidate = (name, input) => {
    const validateResult = marathonDataMap[name]?.validate(input);
    const errorMessage = marathonDataMap[name]?.message;
    if (validateResult) {
      setErrors((prevErrors) =>
        Object.fromEntries(Object.entries(prevErrors).filter(([key]) => key !== name))
      );
    } else {
      setErrors({
        ...errors,
        [name]: {
          message: errorMessage || null
        }
      });
    }
    return validateResult;
  };
  const handleValidateAll = () => {
    const newErrors = {};
    let isValid = true;
    Object.entries(marathonDataMap).forEach(([name, fieldData]) => {
      const { validate, message } = fieldData;
      let input;
      if (validate) {
        switch (name) {
          case 'milestonesName':
            input = newMarathon.milestones;
            break;
          case 'motivationDescription':
            input = newMarathon.motivation?.description;
            break;
          case 'strategiesDescription':
            input = newMarathon.strategies?.description;
            break;
          case 'outcomesDescription':
            input = newMarathon.outcomes?.description;
            break;
          default:
            input = newMarathon[name];
          break;
        }
        const validationPassed = validate(input);

        if (!validationPassed) {
          newErrors[name] = { message: message || "驗證失敗" };
          isValid = false;
        }
      }
    });
    setErrors(newErrors);
    return isValid;
  };
  const handleOnChange = (
    name,
    value,
  ) => {
    const type = marathonDataMap[name]?.dispatchType;
    const key = marathonDataMap[name]?.dispatchKey;

    if (type && key) {
      setNewMarathon({
        type,
        payload: { key, value }
      });
    }

    if (name) {
      handleValidate(name, value);
    }
  };

  const onNextStep = () => {
    const isValid = handleValidateAll();
    if (!isValid) {
      toast.error('請修正錯誤');
    } else {
      reduxDispatch(updateNewMarathon(newMarathon));
      setCurrentStep(currentStep + 1);
    }
  };

  const onPrevStep = () => {
    reduxDispatch(updateNewMarathon(newMarathon));
    setCurrentStep(currentStep - 1);
  };

  useEffect(() => {
    setHasLoaded(true);
    const storagedErrors = getMarathonErrorsStorage().get();
    if (storagedErrors) {
      setErrors(storagedErrors);
    }
  }, []);

  useEffect(() => {
    if (newMarathon && hasLoaded) {
      window.localStorage.setItem('newMarathon', JSON.stringify(newMarathon));
    }
  }, [newMarathon]);

  useEffect(() => {
    getMarathonErrorsStorage().set(errors);
  }, [errors]);

  return (
    <>
      <StyledSection className={
        (errors.title || errors.description || errors.motivationDescription || errors.goals || errors.strategiesDescription || errors.resources) ? 'error' : ''
      }
      >
        <Typography
          component="h2"
          sx={{
            fontSize: '22px',
            fontWeight: '700',
            lineHeight: '140%',
            marginBottom: '20px',
            textAlign: 'left',
            color: '#536166',
          }}
        >
          學習計畫
        </Typography>
        <Typography
          component="p"
          sx={{
            color: '#536166',
            fontSize: '14px',
            fontWeight: '400',
            lineHeight: '140%',
            marginBottom: '20px',
          }}
        >
          計劃內容在申請截止日前皆可修改。<br />
          入選公告後，所有入選者及申請者亦可持續修改學習計劃
        </Typography>

        <Box sx={{ marginTop: '24px', width: '100%' }}>
          <StyledInputBase
            title="學習主題名稱"
            value={newMarathon.title || ''}
            onChange={(e) => {
              handleOnChange('title', e.target.value);
            }}
            sx={{
              mb: '8px',
              padding: '17px 16px 12px'
            }}
            className={errors.title ? 'error' : ''}
            endAdornment={errors.title ? <ClearIcon sx={{ color: '#EF5364' }} /> : null}
            placeholder="範例：成為一位Youtuber、半世紀以來的氣候變遷紀錄研究、開一間線上甜點店"
          />
          {errors.title && (
            <Typography sx={{
              color: '#EF5364',
              marginTop: '8px',
              fontSize: '14px',
              fontWeight: 400
            }}
            >
              {errors.title?.message}
            </Typography>
          )}
          <StyledGroup>
            <Typography sx={{ fontWeight: 500, mb: '8px' }}>
              計畫簡述 *
            </Typography>
            <Typography
              sx={{ color: '#92989A', fontWeight: 400, fontSize: '14px', mb: '8px' }}
            >
              請摘要學習計畫。包含你為什麼想做此計畫？你的目標是什麼呢？預計如何達成？
            </Typography>
            <StyledTextareaAutosize
              value={newMarathon.description || ''}
              onChange={(e) => {
                handleOnChange('description', e.target.value);
              }}
              placeholder="範例：因為對剪影片和當 Youtuber 有興趣，我預計會研究搞笑型 Youtuber 的影片腳本與剪輯方式、拍攝我日常生活及練習剪輯，並建立 Youtube 頻道上傳影片。希望能藉此了解如何當一位 Youtuber。"
              className={errors.description ? 'error' : ''}
            />
            {errors.description && (
              <Typography sx={{
                color: '#EF5364',
                marginTop: '8px',
                fontSize: '14px',
                fontWeight: 400
              }}
              >
                {errors.description?.message}
              </Typography>
            )}
          </StyledGroup>
          <StyledGroup>
            <Typography sx={{ fontWeight: 500, mb: '8px' }}>
              學習動機 *
            </Typography>
            <Typography
              sx={{ color: '#92989A', fontWeight: 400, fontSize: '14px', mb: '8px' }}
            >
              為什麼會想啟動這個學習計畫？受到哪些經歷、刺激、啟發，包含相關生活、學習等經驗。
            </Typography>
            <MultiSelectDropdown
              placeholder="請選擇一個或以上的學習動機"
              listItems={[
                '好奇心驅動',
                '興趣熱情',
                '自我挑戰',
                '個人成長',
                '職涯發展',
                '升學或資格獲取',
                '社會認可',
                '探索可能性',
                '應對未來',
                '創新發展',
                '實用需求',
                '受事件啟發',
                '人際連結',
                '生活發生變化',
                '影響社會',
                '受群體影響',
                '其他：請於下方撰寫'
              ]}
              type="UPDATE_MOTIVATION_FIELD"
              onChange={setNewMarathon}
              selectedItems={newMarathon?.motivation?.tags || []}
            />
            <StyledTextareaAutosize
              onChange={(e) => {
                handleOnChange('motivationDescription', e.target.value);
              }}
              className={errors.motivationDescription ? 'error' : ''}
              value={newMarathon?.motivation?.description || ''}
              placeholder="範例：因為同學常常說我很好笑，很適合把生活日常做成影片，我也發現自己對做影片、當Youtuber有興趣，所以想要嘗試累積作品，並開一個 Youtuber 頻道。"
            />
            {errors.motivationDescription && (
              <Typography sx={{
                color: '#EF5364',
                marginTop: '8px',
                fontSize: '14px',
                fontWeight: 400
              }}
              >
                {errors.motivationDescription?.message}
              </Typography>
            )}
          </StyledGroup>
          <StyledGroup>
            <Typography sx={{ fontWeight: 500, mb: '8px' }}>
              學習目標 *
            </Typography>
            <Typography
              sx={{ color: '#92989A', fontWeight: 400, fontSize: '14px', mb: '8px' }}
            >
              你希望學習後獲得什麼收穫？例如知識或技能的習得，又或者態度或習慣的改變。
            </Typography>
            <StyledTextareaAutosize
              onChange={(e) => {
                handleOnChange('goals', e.target.value);
              }}
              value={newMarathon.goals || ''}
              placeholder="範例：
- 能收集並分析搞笑風格的 Youtuber
- 能拍攝畫面穩定、清晰且具專業感的影片"
              className={errors.goals ? 'error' : ''}
            />
            {errors.goals && (
              <Typography sx={{
                color: '#EF5364',
                marginTop: '8px',
                fontSize: '14px',
                fontWeight: 400
              }}
              >
                {errors.goals?.message}
              </Typography>
            )}
          </StyledGroup>
          <StyledGroup>
            <Typography sx={{ fontWeight: 500, mb: '8px' }}>
              學習內容 *
            </Typography>
            <Typography
              sx={{ color: '#92989A', fontWeight: 400, fontSize: '14px', mb: '8px' }}
            >
              依據你的學習目標，你具體會學哪些內容呢？例如特定的知識、技能、思維、習慣等。
            </Typography>
            <StyledTextareaAutosize
              onChange={(e) => {
                handleOnChange('content', e.target.value);
              }}
              value={newMarathon.content || ''}
              placeholder="範例：
- 內容規劃與創意發想（定位、主題、腳本）
- 基礎拍攝技術（攝影設備、燈光、語音）
- 影片剪輯與後製（剪輯軟體、配樂）"
              className={errors.content ? 'error' : ''}
            />
            {errors.content && (
              <Typography sx={{
                color: '#EF5364',
                marginTop: '8px',
                fontSize: '14px',
                fontWeight: 400
              }}
              >
                {errors.content?.message}
              </Typography>
            )}
          </StyledGroup>
          <StyledGroup>
            <Typography sx={{ fontWeight: 500, mb: '8px' }}>
              學習方法與策略 *
            </Typography>
            <Typography
              component="p"
              sx={{ color: '#92989A', fontWeight: 400, fontSize: '14px', mb: '8px' }}
            >
              你會如何學習？請先勾選預計的學習方法，並敘述各種學習方法會如何相互搭配。此外，你會如何在過程中使用什麼方式紀錄你的學習呢？例如文字筆記以部落格文章做分享等。
            </Typography>
            <MultiSelectDropdown
              placeholder="請選擇一個或以上的學習方法"
              listItems={[
                "資料蒐集/研究/分析",
                "書籍閱讀",
                "觀看影片",
                "聽Podcast",
                "考試",
                "參與競賽",
                "找學伴共學",
                "參與社群",
                "找專家學者",
                "做專案",
                "發起行動",
                "場域實習",
                "舉辦活動或課程",
                "參與活動或課程",
                "田野調查",
                "訪談",
                "問卷調查",
                "其他：請在下方補上其他原因，並詳細說明動機"
              ]}
              type="UPDATE_STRATEGIES_FIELD"
              onChange={setNewMarathon}
              selectedItems={newMarathon?.strategies?.tags || []}
            />
            <StyledTextareaAutosize
              onChange={(e) => {
                handleOnChange('strategiesDescription', e.target.value);
              }}
              value={newMarathon?.strategies?.description || ''}
              placeholder="範例：我預計會研究影片腳本、拍攝與剪輯方式，接著了解拍攝、剪輯與Youtube頻道經營，並同時練習拍攝與剪輯，開始經營頻道。我會用notion整理我收集到的資料以及筆記。"
              className={errors.strategiesDescription ? 'error' : ''}
            />
            {errors.strategiesDescription && (
              <Typography sx={{
                color: '#EF5364',
                marginTop: '8px',
                fontSize: '14px',
                fontWeight: 400
              }}
              >
                {errors.strategiesDescription?.message}
              </Typography>
            )}
          </StyledGroup>
          <StyledGroup>
            <Typography sx={{ fontWeight: 500, mb: '8px' }}>
              學習資源 *
            </Typography>
            <Typography
              component="p"
              sx={{ color: '#92989A', fontWeight: 400, fontSize: '14px', mb: '8px' }}
            >
              你會使用哪些資源呢？包含網路資源的連結、書籍名稱、人／組織、社群、活動／課程、學習工具等，請至少附上名稱與相關連結
            </Typography>
            <StyledInputBase
              sx={{ width: '100%' }}
              placeholder="範例：YouTube 創作者的實用資源"
              value={newMarathon.resources || ''}
              onChange={(e) => {
                handleOnChange('resources', e.target.value);
              }}
              className={errors.resources ? 'error' : 'warning'}
              endAdornment={errors.resources ? <ClearIcon sx={{ color: '#EF5364' }} /> : null}
            />
            {errors.resources && (
              <Typography sx={{
                color: '#EF5364',
                marginTop: '8px',
                fontSize: '14px',
                fontWeight: 400
              }}
              >
                {errors.resources?.message}
              </Typography>
            )}
          </StyledGroup>
        </Box>
      </StyledSection>
      <StyledSection
        sx={{ mt: '16px' }}
        className={errors.milestonesName ? 'error' : ''}
      >
        <Box>
          <StyledGroup>
            <MilestoneGroup
              milestones={newMarathon.milestones}
              onChangeHandler={handleOnChange}
              errorMessage={errors.milestonesName?.message}
            />
          </StyledGroup>
        </Box>
      </StyledSection>
      <StyledSection
        sx={{ mt: '16px' }}
        className={errors.outcomesDescription ? 'error' : ''}
      >
        <Typography component="h3" sx={{ fontWeight: 500, mb: '8px' }}>
          學習成果及呈現方式 *
        </Typography>
        <Typography
          component="p"
          sx={{
            color: '#92989A', fontWeight: 400, fontSize: '14px', mb: '8px'
          }}
        >
          你最終會用何種方式統整與呈現你所有學習收穫呢？
        </Typography>
        <MultiSelectDropdown
          placeholder="請選擇一個或以上的學習動機"
          listItems={[
            "架設網站",
            "經營社群媒體",
            "撰寫研究報告",
            "藝術創作",
            "發起專案或組織",
            "拍影片",
            "舉辦活動",
            "開課",
            "參與競賽",
            "其他：請在下方補上其他原因，並詳細說明動機"
          ]}
          type="UPDATE_OUTCOMES_FIELD"
          onChange={setNewMarathon}
          selectedItems={newMarathon?.outcomes?.tags || []}
        />
        <StyledTextareaAutosize
          onChange={(e) => {
            handleOnChange('outcomesDescription', e.target.value);
          }}
          value={newMarathon?.outcomes?.description || ''}
          placeholder="範例：我預計會架設一個Youtube頻道，並上傳至少5支影片，並整理觀眾回饋與相關數據。"
          className={errors.outcomesDescription ? 'error' : ''}
        />
        {errors.outcomesDescription && (
          <Typography
            component="p"
            sx={{
              color: '#EF5364',
              marginTop: '8px',
              fontSize: '14px',
              fontWeight: 400
            }}
          >
            {errors.outcomesDescription?.message}
          </Typography>
        )}
        <FormControlLabel
          label="是否公開給所有人看到 (馬拉松開始後才可以在活動網站上看到喔～）"
          sx={{
            margin: '19px 0 0',
          }}
          control={
            (
              <Checkbox
                checked={!!newMarathon.isPublic}
                onChange={(e) => {
                  setNewMarathon({
                    type: 'UPDATE_FIELD',
                    payload: {
                      key: 'isPublic',
                      value: e.target.checked
                    }
                  });
                }}
                sx={{
                  padding: '0',
                  marginRight: '5px'
                }}
              />
            )
          }
        />
      </StyledSection>
      <StyledSection sx={{ mt: '16px' }}>
        <StyledGroup>
          <PricingForm
            pricing={newMarathon?.pricing || {}}
            type="UPDATE_FIELD"
            onChange={setNewMarathon}
          />
        </StyledGroup>
      </StyledSection>
      <StyledButtonGroup>
        <StyledButton
          variant="outlined"
          onClick={onPrevStep}
        >
          上一步
        </StyledButton>
        <StyledButton
          variant="contained"
          onClick={onNextStep}
        >
          下一步
        </StyledButton>
      </StyledButtonGroup>
    </>

  );
}
