import { Box, Typography, Divider, Skeleton } from '@mui/material';
import Tab from '@mui/material/Tab';
import { TabContext } from '@mui/lab';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import { useState } from 'react';
import { WANT_TO_DO_WITH_PARTNER } from '../../../constants/member';
import { mapToTable } from '../../../utils/helper';

const UserTabs = ({
  description = '',
  wantToLearnList = [],
  isLoading = false,
}) => {
  console.log('description', description);
  console.log('wantToLearnList', wantToLearnList);

  const [value, setValue] = useState('1');
  if (isLoading) {
    return (
      <Box
        sx={{
          width: '720px',
          '@media (max-width: 767px)': {
            width: '316px',
          },
        }}
      >
        <TabContext value={value}>
          <Box
            sx={{
              borderBottom: 1,
              borderColor: 'divider',
              '@media (max-width: 767px)': {
                width: '316px',
              },
            }}
          >
            <TabList
              onChange={(_, newValue) => setValue(newValue)}
              aria-label="lab API tabs example"
              centered
              sx={{
                width: '100%',
              }}
            >
              <Tab
                label="基本資訊"
                value="1"
                sx={{
                  width: '100%',
                  '@media (max-width: 767px)': {
                    width: '158px',
                  },
                }}
              />
              <Tab
                label="推薦資源"
                value="2"
                sx={{
                  width: '100%',
                  '@media (max-width: 767px)': {
                    width: '158px',
                  },
                }}
              />
            </TabList>
          </Box>
          <TabPanel
            value="1"
            sx={{
              padding: '0',
            }}
          >
            <Box
              sx={{
                width: '720px',
                padding: '40px 30px ',
                marginTop: '10px',
                bgcolor: '#fff',
                borderRadius: '20px',
                '@media (max-width: 767px)': {
                  width: '316px',
                },
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'flex-start',
                  alignItems: 'center',
                }}
              >
                <Typography sx={{ color: '#293A3D', fontWeight: 500 }}>
                  可分享
                </Typography>
                <Skeleton
                  variant="text"
                  width={200}
                  sx={{ marginLeft: '10px' }}
                />
              </Box>
              <Divider sx={{ color: '#F3F3F3', margin: '6px 0' }} />
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'flex-start',
                  alignItems: 'center',
                }}
              >
                <Typography sx={{ color: '#293A3D', fontWeight: 500 }}>
                  想一起
                </Typography>
                <Skeleton
                  variant="text"
                  width={200}
                  sx={{ marginLeft: '10px' }}
                />
              </Box>
              <Divider sx={{ color: '#F3F3F3', margin: '6px 0' }} />
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'flex-start',
                  alignItems: 'center',
                }}
              >
                <Typography sx={{ color: '#293A3D', fontWeight: 500 }}>
                  個人網站
                </Typography>
                <Skeleton
                  variant="text"
                  width={200}
                  sx={{ marginLeft: '10px' }}
                />
              </Box>
              <Divider sx={{ color: '#F3F3F3', margin: '6px 0' }} />
              <Box>
                <Typography sx={{ color: '#293A3D', fontWeight: 500 }}>
                  簡介
                </Typography>
                <Skeleton variant="text" width={200} />
                <Skeleton variant="text" width={200} />
                <Skeleton variant="text" width={200} />
              </Box>
            </Box>
          </TabPanel>
          <TabPanel
            value="2"
            sx={{
              padding: '0',
            }}
          >
            <Box
              sx={{
                width: '720px',
                padding: '40px 30px ',
                marginTop: '10px',
                bgcolor: '#fff',
                borderRadius: '20px',
                '@media (max-width: 767px)': {
                  width: '316px',
                },
              }}
            />
          </TabPanel>
        </TabContext>
      </Box>
    );
  }
  return (
    <Box
      sx={{
        width: '720px',
        '@media (max-width: 767px)': {
          width: '316px',
        },
      }}
    >
      <TabContext value={value}>
        <Box
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            '@media (max-width: 767px)': {
              width: '316px',
            },
          }}
        >
          <TabList
            onChange={(_, newValue) => setValue(newValue)}
            aria-label="lab API tabs example"
            centered
            sx={{
              width: '100%',
            }}
          >
            <Tab
              label="基本資訊"
              value="1"
              sx={{
                width: '100%',
                '@media (max-width: 767px)': {
                  width: '158px',
                },
              }}
            />
            <Tab
              label="推薦資源"
              value="2"
              sx={{
                width: '100%',
                '@media (max-width: 767px)': {
                  width: '158px',
                },
              }}
            />
          </TabList>
        </Box>
        <TabPanel
          value="1"
          sx={{
            padding: '0',
          }}
        >
          <Box
            sx={{
              width: '720px',
              padding: '40px 30px ',
              marginTop: '10px',
              bgcolor: '#fff',
              borderRadius: '20px',
              '@media (max-width: 767px)': {
                width: '316px',
              },
            }}
          >
            <Box>
              <Typography sx={{ color: '#293A3D', fontWeight: 500 }}>
                可分享
              </Typography>
              <Typography sx={{ marginLeft: '12px' }}>-</Typography>
            </Box>
            <Divider sx={{ color: '#F3F3F3', margin: '6px 0' }} />
            <Box>
              <Typography sx={{ color: '#293A3D', fontWeight: 500 }}>
                想一起
              </Typography>
              <Typography sx={{ marginLeft: '12px' }}>
                {wantToLearnList
                  .map((item) => mapToTable(WANT_TO_DO_WITH_PARTNER)[item])
                  .join(', ') || '-'}
              </Typography>
            </Box>
            <Divider sx={{ color: '#F3F3F3', margin: '6px 0' }} />
            <Box>
              <Typography sx={{ color: '#293A3D', fontWeight: 500 }}>
                個人網站
              </Typography>
              <Typography sx={{ marginLeft: '12px' }}>-</Typography>
            </Box>
            <Divider sx={{ color: '#F3F3F3', margin: '6px 0' }} />
            <Box>
              <Typography sx={{ color: '#293A3D', fontWeight: 500 }}>
                簡介
              </Typography>
              <Typography component="p" sx={{}}>
                {description || '-'}
              </Typography>
            </Box>
          </Box>
        </TabPanel>
        <TabPanel
          value="2"
          sx={{
            padding: '0',
          }}
        >
          <Box
            sx={{
              width: '720px',
              padding: '40px 30px ',
              marginTop: '10px',
              bgcolor: '#fff',
              borderRadius: '20px',
              '@media (max-width: 767px)': {
                width: '316px',
              },
            }}
          >
            即將推出，敬請期待
          </Box>
        </TabPanel>
      </TabContext>
    </Box>
  );
};

export default UserTabs;
