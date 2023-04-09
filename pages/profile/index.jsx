import React from 'react';
import styled from '@emotion/styled';
import { useRouter } from 'next/router';
import PropTypes from 'prop-types';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Edit from '../../components/Profile/Edit';
import AccountSetting from '../../components/Profile/accountsetting';
import Footer from '../../shared/components/Footer_v2';
import Navigation from '../../shared/components/Navigation_v2';

const HomePageWrapper = styled.div`
  --section-height: calc(100vh - 80px);
  --section-height-offset: 80px;
  background: linear-gradient(0deg, #f3fcfc, #f3fcfc), #f7f8fa;
`;

function TabPanel(props) {
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
        <Box sx={{ p: 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

function a11yProps(index) {
  return {
    id: `vertical-tab-${index}`,
    'aria-controls': `vertical-tabpanel-${index}`,
  };
}

const ProfilePage = () => {
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
          marginTop:'60px'
        }}
      >
        <Box
          sx={{
            width: '272px',
            height: '118px',
            backgroundColor: 'white',
            borderRadius: '8px',
            margin: '26px 40px 0 0'
          }}
        >
          <Tabs
            orientation="vertical"
            variant="scrollable"
            value={value}
            onChange={handleChange}
            aria-label="Vertical tabs example"
          >
            <Tab label="個人資料編輯" {...a11yProps(0)} />
            <Tab label="帳號設定" {...a11yProps(1)} />
          </Tabs>
        </Box>
        <Box>
          <TabPanel value={value} index={0}>
            <Edit />
          </TabPanel>
          <TabPanel value={value} index={1}>
            <AccountSetting />
          </TabPanel>
        </Box>
      </Box>
      <Footer />
    </HomePageWrapper>
  );
};

export default ProfilePage;

// const ProfilePage = () => {
//   return (
//     <HomePageWrapper>
//       <Navigation />
//       <Profile />
//       <Footer />
//     </HomePageWrapper>
//   );
// };

// export default ProfilePage;
