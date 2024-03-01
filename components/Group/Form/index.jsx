import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Button from '@/shared/components/Button';
import StyledPaper from '../Paper.styled';
import {
  StyledHeading,
  StyledDescription,
  StyledContainer,
  StyledFooter,
} from './Form.styled';
import Fields from './Fields';
import useGroupForm, {
  areasOptions,
  categoriesOptions,
  eduOptions,
} from './useGroupForm';

export default function GroupForm({ mode, isLoading, onSubmit }) {
  const { control, values, errors, handleSubmit } = useGroupForm();
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
          <Fields.TextField
            label="主題"
            name="title"
            control={control}
            value={values.title}
            error={errors.title}
            placeholder="為你的揪團取個響亮的主題吧！"
            required
          />
          <Fields.Upload
            name="file"
            label="活動圖片"
            value={values.photoURL}
            control={control}
          />
          <Fields.Select
            label="學習領域"
            name="category"
            control={control}
            value={values.category}
            error={errors.category}
            options={categoriesOptions}
            placeholder="這個活動的學習領域？"
            multiple
            required
          />
          <Fields.AreaCheckbox
            label="地點"
            name="area"
            control={control}
            value={values.area}
            error={errors.area}
            options={areasOptions}
            required
          />
          <Fields.TextField
            label="時間"
            name="time"
            control={control}
            value={values.time}
            error={errors.time}
            placeholder="希望在什麼時間舉行？"
          />
        </StyledPaper>
        <StyledPaper sx={{ p: '40px' }}>
          <Fields.TextField
            label="想找的夥伴"
            name="partnerStyle"
            control={control}
            value={values.partnerStyle}
            error={errors.partnerStyle}
            placeholder="想找什麼類型的夥伴？"
          />
          <Fields.Select
            label="適合的教育階段"
            name="partnerEducationStep"
            control={control}
            value={values.partnerEducationStep}
            error={errors.partnerEducationStep}
            placeholder="活動適合什麼教育階段的夥伴？"
            options={eduOptions}
            multiple
            required
          />
          <Fields.TextField
            label="描述"
            name="description"
            control={control}
            value={values.description}
            error={errors.description}
            placeholder="簡單的跟大家介紹你是誰，說明你的揪團活動內容、運作方式，邀請志同道合的夥伴一起來參與！"
            required
            multiline
          />
          <Fields.TagsField
            label="標籤"
            name="tagList"
            control={control}
            value={values.tagList}
            error={errors.tagList}
            placeholder="搜尋或新增標籤"
            tooltip="填入適當的標籤，能讓你的文章更容易被搜尋到喔！"
            helperText="標籤填寫完成後，會用 Hashtag 的形式呈現，例如： #一起學日文"
          />
        </StyledPaper>
        <StyledFooter>
          <Button
            sx={{ width: '100%', maxWidth: '287px' }}
            disabled={isLoading}
            onClick={handleSubmit(onSubmit)}
          >
            送出
            {isLoading && (
              <CircularProgress
                size={24}
                sx={{
                  color: 'primary.main',
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  marginTop: '-12px',
                  marginLeft: '-12px',
                }}
              />
            )}
          </Button>
        </StyledFooter>
      </StyledContainer>
    </Box>
  );
}
