import { useState } from 'react';
import { Box } from '@mui/material';
import Tab from '@mui/material/Tab';
import { TabContext } from '@mui/lab';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import { StyledTabContextBox } from './UserTabs.styled';

const UserTabs = ({ panels = [] }) => {
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
            {panels.length > 0 &&
              panels.map((panel) => (
                <Tab
                  key={panel.id}
                  style={{ flexGrow: 1 }}
                  label={panel.title}
                  value={panel.id}
                />
              ))}
          </TabList>
        </StyledTabContextBox>
        {panels.length > 0 &&
          panels.map((panel) => (
            <TabPanel key={panel.id} value={panel.id} sx={{ padding: '0' }}>
              {panel.content}
            </TabPanel>
          ))}
      </TabContext>
    </Box>
  );
};

export default UserTabs;
