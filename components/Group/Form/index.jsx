import { useState } from 'react';
import Link from 'next/link';
import styled from '@emotion/styled';
import Box from '@mui/material/Box';
import Switch from '@mui/material/Switch';
import CircularProgress from '@mui/material/CircularProgress';
import Button from '@/shared/components/Button';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import { activityCategoryList } from '@/constants/activityCategory';
import StyledPaper from '../Paper.styled';
import {
  StyledHeading,
  StyledDescription,
  StyledContainer,
  StyledFooter,
  StyledSwitchWrapper,
} from './Form.styled';
import Fields from './Fields';
import useGroupForm, {
  areasOptions,
  categoriesOptions,
  eduOptions,
} from './useGroupForm';

const StyledDesc = styled.p`
  font-size: 14px;
  color: #92989a;

  a {
    color: #92989a;
    text-decoration: underline;
  }
`;

export default function GroupForm({
  mode,
  defaultValues,
  isLoading,
  onSubmit,
}) {
  const {
    notLogin,
    control,
    values,
    errors,
    isDirty,
    handleSubmit,
  } = useGroupForm({
    ...defaultValues,
    originPhotoURL: defaultValues?.photoURL,
  });
  const [isChecked, setIsChecked] = useState(false);
  const isCreateMode = mode === 'create';

  const desc = (
    <StyledDesc>
      請確認揪團未涉及不雅內容並符合本網站{' '}
      <Link href="/terms/service" target="_blank">
        使用者條款
      </Link>
    </StyledDesc>
  );

  const checkbox = (
    <Checkbox size="small" onClick={() => setIsChecked((pre) => !pre)} />
  );

  if (notLogin) {
    return <Box sx={{ minHeight: '50vh' }} />;
  }

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
            name="photoURL"
            label="活動圖片"
            value={values.photoURL}
            control={control}
          />
          <Fields.CheckboxGroup
            label="揪團類型"
            name="activityCategory"
            transformCheckboxValues={(action, value, activityCategory) => {
              if (action === 'add' && value === '其他') {
                return ['其他'];
              }
              if (action === 'remove' && !activityCategory.length) {
                return ['其他'];
              }
              return activityCategory.filter((item) => item !== '其他');
            }}
            control={control}
            value={values.activityCategory}
            options={activityCategoryList}
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
          <Fields.TextField
            label="期望的夥伴人數"
            name="participator"
            control={control}
            value={values.participator}
            error={errors.participator}
            placeholder="請輸入整數，需大於 0，不可超過 100"
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
        <StyledPaper sx={{ p: '40px', mb: '16px' }}>
          <Fields.TextField
            label="想找的夥伴"
            name="partnerStyle"
            control={control}
            value={values.partnerStyle}
            error={errors.partnerStyle}
            placeholder="想找什麼類型的夥伴？"
            required
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
            label="揪團動機"
            name="motivation"
            control={control}
            value={values.motivation}
            error={errors.motivation}
            placeholder="讓大家更了解你為什麼發起這次揪團～"
            required
          />
          <Fields.TextField
            label="揪團內容與運作方式"
            name="content"
            control={control}
            value={values.content}
            error={errors.content}
            placeholder="說明你的揪團活動內容、運作方式，邀請志同道合的夥伴一起來參與！"
            required
            multiline
          />
          <Fields.TextField
            label="期待成果"
            name="outcome"
            control={control}
            value={values.outcome}
            error={errors.outcome}
            placeholder="希望大家參與後能有的收獲或達成的目標"
            required
          />
          <Fields.TextField
            label="注意事項"
            name="notice"
            control={control}
            value={values.notice}
            error={errors.notice}
            placeholder="如參與者必須參與的次數和遵守的規則等"
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
        <StyledPaper>
          <Fields.DateRadio
            label="揪團期限"
            name="deadline"
            customValueName="isNeedDeadline"
            value={values.deadline}
            isCustomValue={values.isNeedDeadline}
            control={control}
          />
        </StyledPaper>
        {!isCreateMode && (
          <StyledPaper sx={{ p: '40px', mt: '16px' }}>
            <StyledSwitchWrapper>
              {values.isGrouping ? '開放揪團中' : '已關閉揪團'}
              <Switch
                name="isGrouping"
                checked={values.isGrouping}
                onClick={() =>
                  control.onChange({
                    target: { name: 'isGrouping', value: !values.isGrouping },
                  })
                }
              />
            </StyledSwitchWrapper>
          </StyledPaper>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <FormControlLabel
            control={checkbox}
            label={desc}
            checked={isChecked}
          />
        </Box>

        <StyledFooter>
          <Button
            sx={{ width: '100%', maxWidth: '287px', mt: 0 }}
            disabled={isLoading || !isDirty || !isChecked}
            onClick={handleSubmit(onSubmit)}
          >
            {isCreateMode ? '送出' : '發布修改'}
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
