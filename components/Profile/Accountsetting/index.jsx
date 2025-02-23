import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Checkbox,
  Button,
  Divider,
  FormControlLabel,
} from '@mui/material';
import { useRouter } from 'next/router';
import styled from '@emotion/styled';
import { useAuth, useAuthDispatch } from '@/contexts/Auth';

const StyledTypographyStyle = styled(Typography)`
  font-family: Noto Sans TC;
  font-style: normal;
  font-weight: 500;
  font-size: 16px;
  line-height: 1.4;
  color: #293a3d;
`;

const StyledLogoutBtn = styled(Button)`
  border-radius: 20px;
  background: #fff;
  color: #1f4645;
  padding: 5px 0;
  width: 100%;
  /* shadow-light-gray */
  box-shadow: 0px 4px 10px 0px rgba(196, 194, 193, 0.4);
`;

const AccountSetting = () => {
  const router = useRouter();
  const authDispatch = useAuthDispatch();
  const { user } = useAuth();
  const [isSubscribeEmail, setIsSubscribeEmail] = useState(false);

  const onUpdateUser = (status) => {
    const payload = {
      id: user._id,
      email: user.email,
      isSubscribeEmail: status,
    };
    authDispatch.updateUser(payload);
  };

  const logout = () => {
    authDispatch.logout();
    router.push('/');
  };

  useEffect(() => {
    setIsSubscribeEmail(user?.isSubscribeEmail || false);
  }, [user]);

  return (
    <Box
      sx={{
        backgroundColor: '#ffffff',
        width: '100%',
        maxWidth: '672px',
        borderRadius: '16px',
        padding: { xs: '16px 20px', md: '36px 40px' },
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
          width: '100%',
          maxWidth: '544px',
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
          <StyledTypographyStyle>電子信箱</StyledTypographyStyle>
          <Box
            sx={{
              width: '100%',
              margin: '8px 0 30px 0',
              borderRadius: '8px',
              border: '1px solid #DBDBDB',
              background: '#F3F3F3',
              padding: '12px 16px',
              color: '#92989A',
              wordBreak: 'break-all',
            }}
          >
            {user?.email}
          </Box>
        </Box>
        {/* <Box sx={{ display: 'flex', flexDirection: 'column' }}>
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
        </Box> */}
        <Divider
          sx={{ width: '100%', color: '#000', margin: '30px 0', height: '2px' }}
        />
        <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
          <StyledTypographyStyle sx={{ mb: '24px' }}>
            登出帳號
          </StyledTypographyStyle>
          <StyledLogoutBtn onClick={logout}>登出</StyledLogoutBtn>
        </Box>
      </Box>
    </Box>
  );
};

export default AccountSetting;
