import styled from "@emotion/styled";
import {
  Typography,
  FormControlLabel,
  Box,
  Radio,
  RadioGroup,
} from '@mui/material';

import {
  StyledInputBase
} from './Edit.styled';

const StyledRadioGroup = styled(RadioGroup)`
  width: 100%;
  .MuiFormControlLabel-root {
    margin: 8px 0;
  }
  .MuiSvgIcon-root {
    font-size: 20px;
  }

  .MuiButtonBase-root {
    padding: 0;
    margin-right: 5px;

    + .MuiTypography-root {
      font-size: 14px;
      font-weight: 400;
      line-height: 140%;
      color: #92989A;
    }    
    
    &.Mui-checked + .MuiTypography-root {
      color: #293A3D;
    }
  }
`;
const StyledNote = styled(Typography)`
  font-size: 14px;
  font-weight: 400;
  line-height: 140%;
  height: 40px;
  display: flex;
  flex-direction: row;
  align-items: center;

`;

export default function PricingForm({
  pricing,
  onChange,
  type
}) {
  const handleCheckOption = (e) => {
    onChange({
      type,
      payload: {
        key: 'pricing',
        value: {
          ...pricing,
          option: e.target.value,
          email: [],
          file: ""
        }
      }
    });
  };
  const handleChangeFile = (e) => {
    onChange({
      type,
      payload: {
        key: 'pricing',
        value: {
          ...pricing,
          file: e.target.value
        }
      }
    });
  };

  const handleChangeEmail = (e, index) => {
    const emails = pricing.email || [];
    emails[index] = e.target.value;
    onChange({
      type,
      payload: {
        key: 'pricing',
        value: {
          ...pricing,
          email: emails
        }
      }
    });
  };

  return (
    <>
      <Typography sx={{ fontWeight: 500, mb: '8px' }}>
        請選擇你報名的資格
      </Typography>
      <StyledRadioGroup>
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <FormControlLabel
            value="中低收入戶：將提供三位免費參與資格"
            control={
              (
                <Radio
                  onChange={handleCheckOption}
                  checked={(pricing.option === "中低收入戶：將提供三位免費參與資格")}
                />
              )
            }
            label="中低收入戶：將提供三位免費參與資格"
          />
          {(pricing.option === "中低收入戶：將提供三位免費參與資格") && (
            <Box sx={{ paddingLeft: '20px' }}>
              <Typography
                sx={{
                  color: '#92989A',
                  fontWeight: 400,
                  fontSize: '14px',
                  margin: '0 0 8px',
                }}
                component="p"
              >
                請將證明文件上傳至雲端空間後，將連結填入以下欄位
              </Typography>
              <StyledInputBase
                fullWidth
                variant="outlined"
                placeholder="證明文件的連結"
                onChange={handleChangeFile}
                value={pricing.file || ''}
              />
            </Box>
          )}
        </Box>
        <FormControlLabel
          value="優惠價：8000 元"
          control={
            (
              <Radio
                onChange={handleCheckOption}
                checked={(pricing.option === "優惠價：8000 元")}
              />
            )
          }
          label="優惠價：8000 元"
        />
        <FormControlLabel
          value="個人早鳥價：6000 元"
          control={
            (
              <Radio
                onChange={handleCheckOption}
                checked={(pricing.option === "個人早鳥價：6000 元")}
              />
            )
          }
          label="個人早鳥價：6000 元（早鳥優惠截止至 2024年12月31日 23：59 分）"
        />
        <Box>
          <FormControlLabel
            value="2人團報價：10000元（一人5000元）"
            control={
              (
                <Radio
                  onChange={handleCheckOption}
                  checked={(pricing.option === "2人團報價：10000元（一人5000元）")}
                />
              )
            }
            label="2人團報價：10000元（一人5000元）"
          />
          {(pricing.option === '2人團報價：10000元（一人5000元）') && (
            <Box sx={{ paddingLeft: '20px' }}>
              <Typography
                sx={{
                  color: '#92989A',
                  fontWeight: 400,
                  fontSize: '14px',
                  margin: '0 0 8px',
                  width: '100%',
                }}
                component="p"
              >
                請填入夥伴的 Email
              </Typography>
              <StyledInputBase
                fullWidth
                variant="outlined"
                placeholder="夥伴的 email"
                onChange={(e) => handleChangeEmail(e, 0)}
                sx={{ marginBottom: '8px' }}
                value={pricing.email[0] || ''}
              />
            </Box>
          )}
        </Box>
        <Box>
          <FormControlLabel
            value="3人團報價：12000元（一人4000元）"
            control={
              (
                <Radio
                  onChange={handleCheckOption}
                  checked={(pricing.option === "3人團報價：12000元（一人4000元）")}
                />
              )
            }
            label="3人團報價：12000元（一人4000元）"
          />
          {(pricing.option === "3人團報價：12000元（一人4000元）") && (
            <Box sx={{ paddingLeft: '20px' }}>
              <Typography
                sx={{
                  color: '#92989A',
                  fontWeight: 400,
                  fontSize: '14px',
                  margin: '0 0 8px',
                }}
                component="p"
              >
                請填入夥伴的 Email
              </Typography>
              <StyledInputBase
                variant="outlined"
                placeholder="夥伴的 email"
                onChange={(e) => handleChangeEmail(e, 0)}
                sx={{ marginBottom: '8px' }}
                value={pricing.email[0] || ''}
              />
              <StyledInputBase
                fullWidth
                variant="outlined"
                placeholder="夥伴的 email"
                onChange={(e) => handleChangeEmail(e, 1)}
                sx={{ marginBottom: '8px' }}
                value={pricing.email[1] || ''}
              />
            </Box>
          )}
        </Box>
        <Box>
          <FormControlLabel
            value="4人團報價：12000元（一人3000元）"
            control={
              (
                <Radio
                  onChange={handleCheckOption}
                  checked={(pricing.option === "4人團報價：12000元（一人3000元）")}
                />
              )
            }
            label="4人團報價：12000元（一人3000元）"
          />
          {(pricing.option === "4人團報價：12000元（一人3000元）") && (
            <Box sx={{ paddingLeft: '20px' }}>
              <Typography
                sx={{
                  color: '#92989A',
                  fontWeight: 400,
                  fontSize: '14px',
                  margin: '0 0 8px',
                }}
                component="p"
              >
                請填入夥伴的 Email
              </Typography>
              <StyledInputBase
                fullWidth
                variant="outlined"
                placeholder="夥伴的 email"
                onChange={(e) => handleChangeEmail(e, 0)}
                sx={{ marginBottom: '8px' }}
                value={pricing.email[0] || ''}
              />
              <StyledInputBase
                fullWidth
                variant="outlined"
                placeholder="夥伴的 email"
                onChange={(e) => handleChangeEmail(e, 1)}
                sx={{ marginBottom: '8px' }}
                value={pricing.email[1] || ''}
              />
              <StyledInputBase
                fullWidth
                variant="outlined"
                placeholder="夥伴的 email"
                onChange={(e) => handleChangeEmail(e, 2)}
                sx={{ marginBottom: '8px' }}
                value={pricing.email[2] || ''}
              />
            </Box>
          )}
        </Box>
      </StyledRadioGroup>
      <StyledNote
        component="p"
      >
        主辦單位將於報名成功後，確認並通知各報名者須繳交之費用
      </StyledNote>
    </>
  );
}
