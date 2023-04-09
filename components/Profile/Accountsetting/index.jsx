import React from 'react';
import {
  Box,
  Typography,
  Checkbox,
  Button,
  Divider,
  FormControlLabel,
} from '@mui/material';
import { useRouter } from 'next/router';
import useFirebase from '../../../hooks/useFirebase';

const TypographyStyle = {
  fontFamily: 'Noto Sans TC',
  fontStyle: 'normal',
  fontWeight: '500',
  fontSize: '16px',
  lineHeight: '140%',
  color: '#293A3D',
};

const AccountSetting = () => {
  const { push } = useRouter();
  const { auth, user, signInWithFacebook, signOutWithGoogle } = useFirebase();
  return (
    <Box
      sx={{
        backgroundColor: '#ffffff',
        width: '672px',
        borderRadius: '16px',
        // border: '1px solid black',
        padding: '36px 40px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Typography sx={{ fontSize: '22px', color: '#536166' }}>
        帳號設定
      </Typography>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          width: '544px',
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
          <Typography sx={TypographyStyle}>電子信箱</Typography>
          <Button
            variant="contained"
            disabled
            sx={{ width: '100%', margin: '8px 0 30px 0' }}
          >
            daodao@gmail.com
          </Button>
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <Typography sx={TypographyStyle}>電話驗證</Typography>
          <Button
            variant="contained"
            size="small"
            sx={{
              width: '100%',
              margin: '8px 0 30px 0',
              backgroundColor: 'white',
            }}
          >
            進行驗證
          </Button>
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <Typography sx={TypographyStyle}>電子報</Typography>
          <FormControlLabel
            sx={{
              marginTop: '20px',
              color: '#536166',
            }}
            control={<Checkbox />}
            label="訂閱電子報與島島阿學的新資訊"
          />
        </Box>
        <Divider sx={{ color: '#F3F3F3', margin: '6px 0' }} />
        <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
          <Typography sx={TypographyStyle}>登出帳號</Typography>
          <Button
            variant="contained"
            sx={{
              width: '100%',
              margin: '24px 0 30px 0',
              backgroundColor: 'white',
            }}
            onClick={() => {
              signOutWithGoogle();
              push('/');
            }}
          >
            登出
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default AccountSetting;
