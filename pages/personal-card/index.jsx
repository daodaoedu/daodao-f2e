import { useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import styled from '@emotion/styled';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { ProtectedComponent, useAuth } from '@/contexts/Auth';
import Edit from '@/components/PersonalCard/Edit';
import SEOConfig from '@/shared/components/SEO';
import MyGroup from '@/components/PersonalCard/MyGroup';
import MyResource from '@/components/PersonalCard/MyResource';
import MyNote from '@/components/PersonalCard/MyNote';
import MyMarathon from '@/components/PersonalCard/MyMarathon';
import useMediaQuery from '@mui/material/useMediaQuery';
import getEnv from '@/utils/env';

const StyledTab = styled(Tab)(({ isActive, mobileScreen }) => ({
  width: `${mobileScreen ? '33%' : '100%'}`,
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

const PersonalCardPage = () => {
  const router = useRouter();
  const mobileScreen = useMediaQuery('(max-width: 767px)');
  const { user } = useAuth();
  const tabs = [
    {
      id: 'person-setting',
      tabLabel: '個人資料編輯',
      view: <Edit />,
    },
    {
      id: 'my-group',
      tabLabel: '我的揪團',
      view: <MyGroup title="我的揪團" userId={user?._id} />,
    },
    {
      id: 'my-resource',
      tabLabel: '我的學習資源',
      view: <MyResource title="我的學習資源" userId={user?._id} />,
    },
    {
      id: 'my-project',
      tabLabel: '我的學習計畫',
    },
    {
      id: 'my-note ',
      tabLabel: '我的便利貼',
      view: <MyNote title="我的便利貼" userId={user?._id} />,
    },
    {
      id: 'my-marathon',
      tabLabel: '我的學習馬拉松',
      view: <MyMarathon title="我的學習馬拉松" userId={user?._id} />
    }
  ];

  const [value, setValue] = useState(() => {
    if (getEnv().isServerSide) return 0;
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
    const selectedTab = tabs[newValue];
    if (selectedTab.id === 'my-project') {
      router.push('/my-project');
    }
  };

  return (
    <ProtectedComponent>
      <SEOConfig {...SEOData} />
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          marginTop: '60px',
          minHeight: 'calc(100vh - 518px)',
          background: 'linear-gradient(0deg, #f3fcfc, #f3fcfc), #f7f8fa',
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
        <Box sx={{ flex: 1, maxWidth: '720px', minHeight: '50vh' }}>
          {tabs.map((tab, index) => (
            <TabPanel key={tab.id} value={value} index={index}>
              {tab.view}
            </TabPanel>
          ))}
        </Box>
      </Box>
    </ProtectedComponent>
  );
};

export default PersonalCardPage;
