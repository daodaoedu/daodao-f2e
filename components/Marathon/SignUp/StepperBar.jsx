import styled from '@emotion/styled';
import { Box } from '@mui/material';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';

export const StyledStepperBar = styled(Box)`
  background-color: #FFF;
  padding: 15px 6.9vw;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  flex-wrap: nowrap;
  gap: 20px;
  box-shadow: 0px 2px 4px -1px rgba(0,0,0,0.2),0px 4px 5px 0px rgba(0,0,0,0.14),0px 1px 10px 0px rgba(0,0,0,0.12);
  position: sticky;
  z-index: 99;
  top: 105px;
  width: 100%;
  left: 0;

  .top {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    width: 100%;
  }
    
  .bottom {
    width: 100%;
  }
      
  h2 {
    color: #16B9B3;
    flex-shrink: 0;
    font-family: "Noto Sans TC";
    font-size: 22px;
    font-weight: 700;
    line-height: 140%
  }

  .MuiStepLabel-iconContainer {
    .MuiStepIcon-text {
      fill: #FFF;
    }
  }

  @media (max-width: 767px) {
    padding: 8px 6.9vw;
    .top h2 {
      font-size: 18px;
    }
    .MuiStepLabel-label {
      display: none;
    }
  }
`;

export default function StepperBar({ currentStep }) {
  return (
    <StyledStepperBar>
      <div className="top">
        <h2>申請參加學習馬拉松</h2>
      </div>
      <div className="bottom">
        <Stepper activeStep={currentStep}>
          <Step sx={{ paddingLeft: '0px' }}>
            <StepLabel>編輯個人頁面</StepLabel>
          </Step>
          <Step>
            <StepLabel>學習計畫填寫</StepLabel>
          </Step>
          <Step sx={{ paddingRight: '0px' }}>
            <StepLabel>核對學習計畫內容</StepLabel>
          </Step>
        </Stepper>
      </div>
    </StyledStepperBar>
  );
}
