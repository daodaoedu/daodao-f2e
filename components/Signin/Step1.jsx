import { GENDER, ROLE } from '@/constants/member';
import dayjs from 'dayjs';
import { Box, Button, Typography, Skeleton, TextField } from '@mui/material';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import { MobileDatePicker } from '@mui/x-date-pickers/MobileDatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import {
  StyledContentWrapper,
  StyledQuestionInput,
} from '@/components/Signin/Signin.styled';
import ErrorMessage from '@/components/Signin/ErrorMessage';

// TODO: 待重構
function Step1({ errors, onChangeHandler, userState = {}, onNext }) {
  const handleRoleListChange = (value) => {
    const { roleList = [] } = userState;
    const updatedRoleList = roleList.includes(value)
      ? roleList.filter((role) => role !== value)
      : [...roleList, value];
    onChangeHandler({ key: 'roleList', value: updatedRoleList });
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ minHeight: '100vh' }}>
        <StyledContentWrapper>
          <h2>基本資料</h2>
          <Box sx={{ marginTop: '24px', width: '100%', padding: '0 5%' }}>
            <StyledQuestionInput>
              <Typography>生日 *</Typography>
              <MobileDatePicker
                maxDate={dayjs().subtract(16, 'year')}
                defaultCalendarMonth={dayjs().subtract(18, 'year')}
                label="birthDay"
                inputFormat="YYYY/MM/DD"
                value={userState.birthDay}
                onChange={(date) =>
                  onChangeHandler({ key: 'birthDay', value: date })
                }
                renderInput={(params) => (
                  <TextField {...params} sx={{ width: '100%' }} label="" />
                )}
              />
              <ErrorMessage errText={errors.birthDay} />
            </StyledQuestionInput>
            <StyledQuestionInput>
              <Typography>性別 *</Typography>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  width: '100%',
                }}
              >
                {GENDER.map(({ label, value }) => (
                  <Box
                    key={label}
                    onClick={() =>
                      onChangeHandler({ key: 'gender', value })
                    }
                    sx={{
                      border: '1px solid #DBDBDB',
                      borderRadius: '8px',
                      padding: '10px',
                      width: 'calc(calc(100% - 16px) / 3)',
                      display: 'flex',
                      justifyItems: 'center',
                      alignItems: 'center',
                      cursor: 'pointer',
                      ...(userState.gender === value
                        ? {
                          backgroundColor: '#DEF5F5',
                          border: '1px solid #16B9B3',
                        }
                        : {}),
                    }}
                  >
                    <Typography sx={{ margin: 'auto' }}>{label}</Typography>
                  </Box>
                ))}
              </Box>
              <ErrorMessage errText={errors.gender} />
            </StyledQuestionInput>
            <StyledQuestionInput>
              <Typography>身份 *</Typography>
              <Box
                sx={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  width: '100%',
                  marginTop: '10px',
                }}
              >
                {ROLE.map(({ label, value, image }) => (
                  <Box
                    key={label}
                    onClick={() => handleRoleListChange(value)}
                    sx={{
                      border: '1px solid #DBDBDB',
                      borderRadius: '8px',
                      padding: '10px',
                      margin: '4px',
                      width: 'calc(calc(100% - 24px) / 3)',
                      flexBasis: 'calc(calc(100% - 24px) / 3)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyItems: 'center',
                      alignItems: 'center',
                      cursor: 'pointer',
                      ...(userState.roleList.includes(value)
                        ? {
                          backgroundColor: '#DEF5F5',
                          border: '1px solid #16B9B3',
                        }
                        : {}),
                      '@media (max-width: 767px)': {
                        height: '100% auto',
                        width: 'calc(calc(100% - 24px) / 2)',
                        flexBasis: 'calc(calc(100% - 24px) / 2)',
                      },
                    }}
                  >
                    <LazyLoadImage
                      alt={label}
                      src={image}
                      effect="opacity"
                      style={{
                        height: '100px',
                        width: '100%',
                        borderRadius: '6px',
                        // background: 'rgba(240, 240, 240, .8)',
                        objectFit: 'cover',
                        objectPosition: 'center',
                        '@media (maxWidth: 767px)': {
                          width: '100%',
                        },
                      }}
                      placeholder={
                        // eslint-disable-next-line react/jsx-wrap-multilines
                        <Skeleton
                          sx={{
                            height: '100px',
                            width: '100%',
                            borderRadius: '6px',
                            background: 'rgba(240, 240, 240, .8)',
                            marginTop: '4px',
                          }}
                          variant="rectangular"
                          animation="wave"
                        />
                      }
                    />
                    <Typography
                      sx={{
                        margin: 'auto',
                        marginTop: '10px',
                        ...(userState.roleList.includes(value)
                          ? {
                            fontWeight: 700,
                          }
                          : {}),
                      }}
                    >
                      {label}
                    </Typography>
                  </Box>
                ))}
              </Box>
              <ErrorMessage errText={errors.roleList} />
            </StyledQuestionInput>
            <FormControlLabel
              sx={{
                marginTop: '20px',
              }}
              control={
                // eslint-disable-next-line react/jsx-wrap-multilines
                <Checkbox
                  checked={userState.isSubscribeEmail}
                  onChange={(event) =>
                    onChangeHandler({
                      key: 'isSubscribeEmail',
                      value: event.target.checked,
                    })
                  }
                />
              }
              label="訂閱電子報與島島阿學的新資訊"
            />
            <Button
              sx={{
                width: '100%',
                height: '40px',
                borderRadius: '20px',
                margin: '24px 0px 45px 0px',
                color: '#ffff',
                bgcolor: '#16B9B3',
              }}
              variant="contained"
              onClick={onNext}
            >
              下一步
            </Button>
            {Object.values(errors).length > 0 && (
              <ErrorMessage errText="請將資訊填寫完整" />
            )}
          </Box>
        </StyledContentWrapper>
      </Box>
    </LocalizationProvider>
  );
}

export default Step1;
