import Box from '@mui/material/Box';
import { CATEGORIES } from '@/constants/category';
import { AREAS } from '@/constants/areas';
import StyledPaper from '../Paper.styled';
import FormItem from './FormItem';
import {
  StyledHeading,
  StyledDescription,
  StyledContainer,
} from './Form.styled';

const TaiwanAreas = AREAS.filter((area) => area.label !== '線上');

export default function GroupForm({ mode }) {
  const isCreateMode = mode === 'create';

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
          <FormItem
            label="主題"
            placeholder="為你的揪團取個響亮的主題吧！"
            required
          />
          <FormItem label="活動圖片" />
          <FormItem
            type="select"
            label="學習領域"
            options={CATEGORIES}
            placeholder="這個活動的學習領域？"
            required
          />
          <FormItem
            type="location"
            label="地點"
            options={TaiwanAreas}
            itemValue="label"
            required
          />
          <FormItem
            type="datePicker"
            label="時間"
            placeholder="希望在什麼時間舉行？"
          />
        </StyledPaper>
        <StyledPaper sx={{ p: '40px' }}>
          <FormItem label="想找的夥伴" placeholder="想找什麼類型的夥伴？" />
          <FormItem
            label="適合的教育階段"
            placeholder="活動適合什麼教育階段的夥伴？"
            required
          />
          <FormItem
            label="描述"
            placeholder="簡單的跟大家介紹你是誰，說明你的揪團活動內容、運作方式，邀請志同道合的夥伴一起來參與！"
            required
          />
          <FormItem label="標籤" placeholder="搜尋或新增標籤" />
        </StyledPaper>
      </StyledContainer>
    </Box>
  );
}
