import { useState } from 'react';
import styled from '@emotion/styled';
import { Box, Typography, Divider, Skeleton } from '@mui/material';
import Tab from '@mui/material/Tab';
import { TabContext } from '@mui/lab';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import { WANT_TO_DO_WITH_PARTNER } from '@/constants/member';
import { mapToTable } from '@/utils/helper';

const StyledTabContextBox = styled(Box)(({ theme }) => ({
  borderBottom: '1px solid #536166',
  color: theme.secondary, // Assuming secondary is a valid theme property
  borderColor: theme.secondary, // Use borderColor for indicator color
  '@media (max-width: 767px)': {
    width: '100%',
  },
}));

const StyledPanelBox = styled(Box)`
  width: 720px;
  padding: 40px 30px;
  margin-top: '10px';
  @media (max-width: 767px) {
    width: 100%;
    padding: 30px;
  }
`;

const StyledPanelText = styled(Box)`
  display: flex;
  p {
    color: #293a3d;
    font-weight: 500;
    white-space: nowrap;
    min-width: 50px;
  }
  span {
    color: #536166;
    font-size: 14px;
    font-style: normal;
    font-weight: 400;
    line-height: 140%;
    margin-left: 12px;
  }
  @media (max-width: 767px) {
    flex-direction: column;
    span {
      margin-left: 0px;
    }
  }
`;

const UserTabs = ({
  description = '',
  wantToLearnList = [],
  isLoading = false,
}) => {
  const [value, setValue] = useState('1');

  return (
    <Box
      sx={{
        width: '720px',
        bgcolor: '#fff',
        borderRadius: '8px',
        '@media (max-width: 767px)': {
          width: '100%',
        },
      }}
    >
      <TabContext value={value}>
        <StyledTabContextBox>
          <TabList
            onChange={(_, newValue) => setValue(newValue)}
            centered
            sx={{ width: '100%' }}
          >
            <Tab style={{ flexGrow: 1 }} label="基本資訊" value="1" />
            <Tab style={{ flexGrow: 1 }} label="推薦的資源" value="2" />
            <Tab style={{ flexGrow: 1 }} label="發起的揪團" value="3" />
          </TabList>
        </StyledTabContextBox>
        <TabPanel value="1" sx={{ padding: '0' }}>
          <StyledPanelBox>
            <StyledPanelText
              sx={{ borderBottom: '1px solid #F3F3F3', paddingBottom: '6px' }}
            >
              <p>可分享</p>
              <span sx={{ marginLeft: '12px' }}>自學心得</span>
            </StyledPanelText>
            <StyledPanelText
              sx={{ borderBottom: '1px solid #F3F3F3', padding: '6px 0' }}
            >
              <p>想一起</p>
              <span>學習交流、組課、共學、交朋友</span>
            </StyledPanelText>
            <StyledPanelText sx={{ paddingTop: '6px' }}>
              <p>簡介</p>
              <span>
                休學一年，目前是高二自學生，一直在探索自己喜歡什麼，
                喜歡聽音樂，最近要開始準備英文考試中檢
                有興趣想交流可以來私訊我～
              </span>
            </StyledPanelText>
          </StyledPanelBox>
        </TabPanel>
        <TabPanel value="2" sx={{ padding: '0' }}>
          <StyledPanelBox>即將推出，敬請期待</StyledPanelBox>
        </TabPanel>
        <TabPanel value="3" sx={{ padding: '0' }}>
          <StyledPanelBox>即將推出，敬請期待</StyledPanelBox>
        </TabPanel>
      </TabContext>
    </Box>
  );
};

export default UserTabs;
