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
import { useDispatch, useSelector } from 'react-redux';
import { updateUser, userLogout } from '@/redux/actions/user';

const TypographyStyle = {
  fontFamily: 'Noto Sans TC',
  fontStyle: 'normal',
  fontWeight: '500',
  fontSize: '16px',
  lineHeight: '140%',
  color: '#293A3D',
};

const AccountSetting = () => {
  const dispatch = useDispatch();
  const router = useRouter();

  const [isSubscribeEmail, setIsSubscribeEmail] = useState(false);
  const user = useSelector((state) => state.user);

  const onUpdateUser = () => {
    const payload = {
      email: user.email,
      isSubscribeEmail,
    };
    dispatch(updateUser(payload));
  };

  const logout = () => {
    dispatch(userLogout());
    router.push('/');
  };

  useEffect(() => {
    setIsSubscribeEmail(user?.isSubscribeEmail || false);
  }, [user]);

  return (
    <Box
      sx={{
        backgroundColor: '#ffffff',
        width: '672px',
        borderRadius: '16px',
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
            {user.email}
          </Button>
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
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <Typography sx={TypographyStyle}>電子報</Typography>
          <FormControlLabel
            sx={{
              marginTop: '20px',
            }}
            control={
              // eslint-disable-next-line react/jsx-wrap-multilines
              <Checkbox
                checked={isSubscribeEmail}
                onChange={(event) => {
                  setIsSubscribeEmail(event.target.checked);
                  // onUpdateUser();//待處理取消訂閱
                }}
              />
            }
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
            onClick={logout}
          >
            登出
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default AccountSetting;
