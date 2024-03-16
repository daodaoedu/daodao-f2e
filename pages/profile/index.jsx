import { useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import styled from '@emotion/styled';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Edit from '@/components/Profile/Edit';
import Footer from '@/shared/components/Footer_v2';
import SEOConfig from '@/shared/components/SEO';
import Navigation from '@/shared/components/Navigation_v2';
import MyGroup from '@/components/Profile/MyGroup';
import AccountSetting from '@/components/Profile/Accountsetting';
import useMediaQuery from '@mui/material/useMediaQuery';

const HomePageWrapper = styled.div`
  --section-height: calc(100vh - 80px);
  --section-height-offset: 80px;
  background: linear-gradient(0deg, #f3fcfc, #f3fcfc), #f7f8fa;
`;

const tabs = [
  {
    id: 'person-setting',
    tabLabel: '個人資料編輯',
    view: <Edit />,
  },
  {
    id: 'my-group',
    tabLabel: '我的揪團',
    view: <MyGroup />,
  },
  {
    id: 'account-setting',
    tabLabel: '帳號設定',
    view: <AccountSetting />,
  },
];

const StyledTab = styled(Tab)(({ isActive, mobileScreen }) => ({
  width: `${mobileScreen ? '50%' : '100%'}`,
  color: '#536166',
  borderRadius: '8px',
  '&.Mui-selected': {
    borderColor: 'transparent',
    backgroundColor: `${isActive && '#DEF5F5'}`,
    color: `${isActive && '#16B9B3'}`,
  },
}));

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
  const router = useRouter();
  const mobileScreen = useMediaQuery('(max-width: 767px)');
  const [value, setValue] = useState(() => {
    const id = new URLSearchParams(location.search).get('id');
    const tabIndex = tabs.findIndex((tab) => tab.id === id);
    if (tabIndex > -1) return tabIndex;
    return 0;
  });

  const SEOData = useMemo(
    () => ({
      title: '編輯我的島島資料｜島島阿學',
      description:
        '「島島阿學」盼能透過建立多元的學習資源網絡，讓自主學習者能找到合適的成長方法，進一步成為自己想成為的人，從中培養共好精神。目前正積極打造「可共編的學習資源平台」。',
      keywords: '島島阿學',
      author: '島島阿學',
      copyright: '島島阿學',
      imgLink: 'https://www.daoedu.tw/preview.webp',
      link: `${process.env.HOSTNAME}${router?.asPath}`,
    }),
    [router?.asPath],
  );

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <HomePageWrapper>
      <SEOConfig data={SEOData} />
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
            {tabs.map((tab, index) => (
              <StyledTab
                key={tab.id}
                label={tab.tabLabel}
                mobileScreen={mobileScreen}
                isActive={value === index}
                {...a11yProps(index)}
              />
            ))}
          </Tabs>
        </Box>
        <Box sx={{ flex: 1, maxWidth: '672px' }}>
          {tabs.map((tab, index) => (
            <TabPanel key={tab.id} value={value} index={index}>
              {tab.view}
            </TabPanel>
          ))}
        </Box>
      </Box>
      <Footer />
    </HomePageWrapper>
  );
};

export default ProfilePage;
