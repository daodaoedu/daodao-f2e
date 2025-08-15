import Box from '@mui/material/Box';
import { Typography, Button, Paper } from '@mui/material';
import { Facebook } from 'lucide-react';
import Chip from '@mui/material/Chip';
import { CATEGORIES } from '@/constants/category';

export default function NotExist() {
  return (
    <>
      <Paper
        sx={{
          width: '90%',
          margin: '20px auto',
          padding: '20px',
          minHeight: '60vh',
        }}
      >
        <Typography
          variant="h2"
          sx={{
            color: '#536166',
            marginTop: '10px',
            fontWeight: 'bold',
            fontSize: '30px',
            letterSpacing: '0.08em',
            textAlign: 'center',
            marginRight: '20px',
          }}
        >
          這座島已經搬新家囉
        </Typography>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <img
            src="/assets/nobody-land.gif"
            alt="nobody-land"
            width="300"
            height="300"
          />
        </Box>
        <Typography
          variant="body1"
          sx={{
            fontSize: '20px',
            textAlign: 'center',
            width: '100%',
          }}
        >
          近期網站改版，可能有部分頁面無法使用，可以參觀其他地方唷～
        </Typography>
        <Typography
          variant="body1"
          sx={{
            fontSize: '20px',
            textAlign: 'center',
            width: '100%',
            marginTop: '10px',
          }}
        >
          要不要試試我們新版的資源搜尋或是參觀其他地方呢？
        </Typography>
        <div className="my-5">
          <Typography
            variant="body1"
            sx={{
              fontWeight: 'bold',
            }}
          >
            豐富的學習類別
          </Typography>
          <Box sx={{ margin: '10px 0' }}>
            {CATEGORIES.map(({ value, label }) => (
              <Chip label={label} key={value} sx={{ margin: '5px' }} />
            ))}
          </Box>
        </div>
        <div className="mb-2.5 mt-10">
          <Typography
            variant="body1"
            sx={{
              fontWeight: 'bold',
            }}
          >
            加入島島社群
          </Typography>
          <Box
            sx={{ margin: '20px 0' }}
          >
            <Button variant="outlined" component="a" href="/join">
              <Facebook style={{ margin: '5px 0' }} />
              <Typography variant="body1">加入社群</Typography>
            </Button>
          </Box>
        </div>
      </Paper>
    </>
  );
}
