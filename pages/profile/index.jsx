import React from 'react';
import styled from '@emotion/styled';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Edit from '@/components/Profile/Edit';
import Footer from '@/shared/components/Footer_v2';
import Navigation from '@/shared/components/Navigation_v2';
import MyGroup from '@/components/Profile/MyGroup';
import AccountSetting from '@/components/Profile/Accountsetting';
import useMediaQuery from '@mui/material/useMediaQuery';

const HomePageWrapper = styled.div`
  --section-height: calc(100vh - 80px);
  --section-height-offset: 80px;
  background: linear-gradient(0deg, #f3fcfc, #f3fcfc), #f7f8fa;
`;

function TabPanel(props) {
  const mobileScreen = useMediaQuery('(max-width: 767px)');
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`vertical-tabpanel-${index}`}
      aria-labelledby={`vertical-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: mobileScreen ? 0 : 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

function a11yProps(index) {
  return {
    id: `vertical-tab-${index}`,
    'aria-controls': `vertical-tabpanel-${index}`,
  };
}

const ProfilePage = () => {
  const mobileScreen = useMediaQuery('(max-width: 767px)');

  const [value, setValue] = React.useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <HomePageWrapper>
      <Navigation />
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          marginTop: '60px',
          '@media (max-width: 767px)': {
            flexDirection: 'column',
            marginTop: '0',
            padding: '16px',
          },
        }}
      >
        <Box
          sx={{
            width: '272px',
            height: 'max-content',
            backgroundColor: 'white',
            borderRadius: '8px',
            margin: '26px 40px 0 0',
            padding: '8px',
            '@media (max-width: 767px)': {
              width: '100%',
              height: 'auto',
              padding: 0,
              mb: '16px',
            },
          }}
        >
          <Tabs
            orientation={mobileScreen ? 'horizontal' : 'vertical'}
            variant="scrollable"
            value={value}
            onChange={handleChange}
            aria-label="Vertical tabs example"
            indicatorColor="transparent"
          >
            <Tab
              sx={{
                width: mobileScreen ? '50%' : '100%',
                color: '#536166',
                borderRadius: '8px',
                '&.Mui-selected': {
                  borderColor: 'transparent',
                  backgroundColor: `${value === 0 && '#DEF5F5'}`,
                  color: `${value === 0 && '#16B9B3'}`,
                },
              }}
              label="個人資料編輯"
              {...a11yProps(0)}
            />
            <Tab
              sx={{
                width: mobileScreen ? '50%' : '100%',
                color: '#536166',
                borderRadius: '8px',
                '&.Mui-selected': {
                  borderColor: 'transparent',
                  backgroundColor: `${value === 0 && '#DEF5F5'}`,
                  color: `${value === 0 && '#16B9B3'}`,
                },
              }}
              label="我的揪團"
              {...a11yProps(1)}
            />
            <Tab
              sx={{
                width: mobileScreen ? '50%' : '100%',
                color: '#536166',
                borderRadius: '8px',
                '&.Mui-selected': {
                  borderColor: 'transparent',
                  backgroundColor: `${value === 1 && '#DEF5F5'}`,
                  color: `${value === 1 && '#16B9B3'}`,
                },
              }}
              label="帳號設定"
              {...a11yProps(2)}
            />
          </Tabs>
        </Box>
        <Box>
          <TabPanel value={value} index={0}>
            <Edit />
          </TabPanel>
          <TabPanel value={value} index={1}>
            <MyGroup />
          </TabPanel>
          <TabPanel value={value} index={2}>
            <AccountSetting />
          </TabPanel>
        </Box>
      </Box>
      <Footer />
    </HomePageWrapper>
  );
};

export default ProfilePage;
