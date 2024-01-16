import { useState } from 'react';
import { Box } from '@mui/material';
import Tab from '@mui/material/Tab';
import { TabContext } from '@mui/lab';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import {
  StyledTabContextBox,
  StyledPanelBox,
  StyledPanelText,
} from './UserTabs.styled';

const UserTabs = ({ description = '', wantToDoList = [], share = '' }) => {
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
              <span>{share || '尚未填寫'}</span>
            </StyledPanelText>
            <StyledPanelText
              sx={{ borderBottom: '1px solid #F3F3F3', padding: '6px 0' }}
            >
              <p>想一起</p>
              <span>{wantToDoList || '尚未填寫'}</span>
            </StyledPanelText>
            <StyledPanelText sx={{ paddingTop: '6px' }}>
              <p>簡介</p>
              <span>{description || '尚未填寫'}</span>
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
