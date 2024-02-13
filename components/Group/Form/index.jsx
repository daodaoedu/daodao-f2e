import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';
import Box from '@mui/material/Box';
import { CATEGORIES } from '@/constants/category';
import { AREAS } from '@/constants/areas';
import { EDUCATION_STEP } from '@/constants/member';
import Button from '@/shared/components/Button';
import StyledPaper from '../Paper.styled';
import {
  StyledHeading,
  StyledDescription,
  StyledContainer,
  StyledFooter,
} from './Form.styled';
import Fields from './Fields';

const TaiwanAreas = AREAS.filter((area) => area.label !== '線上');
const EduStep = EDUCATION_STEP.slice(0, 7);

EduStep.push({ key: 'noLimit', value: 'noLimit', label: '不限' });

export default function GroupForm({ mode }) {
  const router = useRouter();
  const user = useSelector((state) => state.user);
  const [resource, setResource] = useState({
    userId: user._id,
    title: '',
    photoURL: '',
    photoAlt: '',
    category: [],
    area: [],
    time: '',
    partnerStyle: '',
    partnerEducationStep: [],
    description: '',
    tagList: [],
    isGrouping: true,
  });
  const isCreateMode = mode === 'create';

  const handleChange = ({ target: { name, value } }) => {
    setResource((pre) => ({ ...pre, [name]: value }));
  };

  useEffect(() => {
    if (!user?._id) router.push('/login');
  }, [user, router]);

  return (
    <Box sx={{ background: '#f3fcfc', py: '60px' }}>
      <StyledContainer>
        <StyledPaper sx={{ p: '40px', mb: '16px' }}>
          <StyledHeading>
            {isCreateMode ? '發起揪團' : '編輯揪團'}
          </StyledHeading>
          <StyledDescription>
            填寫完整資訊可以幫助其他夥伴更了解揪團內容哦！
          </StyledDescription>
          <Fields.TextField
            label="主題"
            name="title"
            onChange={handleChange}
            value={resource.title}
            placeholder="為你的揪團取個響亮的主題吧！"
            errorMessage="請輸入50字以內的標題"
            max={50}
            required
          />
          <Fields.Upload
            name="photo"
            label="活動圖片"
            onChange={handleChange}
          />
          <Fields.Select
            label="學習領域"
            name="category"
            onChange={handleChange}
            value={resource.category}
            options={CATEGORIES}
            placeholder="這個活動的學習領域？"
            multiple
            required
          />
          <Fields.AreaCheckbox
            label="地點"
            name="area"
            onChange={handleChange}
            value={resource.area}
            options={TaiwanAreas}
            required
          />
          <Fields.TextField
            label="時間"
            name="time"
            onChange={handleChange}
            value={resource.time}
            placeholder="希望在什麼時間舉行？"
          />
        </StyledPaper>
        <StyledPaper sx={{ p: '40px' }}>
          <Fields.TextField
            label="想找的夥伴"
            name="partnerStyle"
            onChange={handleChange}
            value={resource.partnerStyle}
            placeholder="想找什麼類型的夥伴？"
          />
          <Fields.Select
            label="適合的教育階段"
            name="partnerEducationStep"
            onChange={handleChange}
            value={resource.partnerEducationStep}
            placeholder="活動適合什麼教育階段的夥伴？"
            options={EduStep}
            multiple
            required
          />
          <Fields.TextField
            label="描述"
            name="description"
            onChange={handleChange}
            value={resource.description}
            placeholder="簡單的跟大家介紹你是誰，說明你的揪團活動內容、運作方式，邀請志同道合的夥伴一起來參與！"
            required
            multiline
          />
          <Fields.TagsField
            label="標籤"
            name="tagList"
            onChange={handleChange}
            value={resource.tagList}
            placeholder="搜尋或新增標籤"
            tooltip="填入適當的標籤，能讓你的文章更容易被搜尋到喔！"
            helperText="標籤填寫完成後，會用 Hashtag 的形式呈現，例如： #一起學日文"
          />
        </StyledPaper>
        <StyledFooter>
          <Button
            sx={{ width: '100%', maxWidth: '287px' }}
            onClick={() => alert('目前功能還在測試階段，敬請期待！')}
          >
            送出
          </Button>
        </StyledFooter>
      </StyledContainer>
    </Box>
  );
}
