import styled from "@emotion/styled";
import {
  Box,
  Typography
} from "@mui/material";
import BoomImage from "@/public/assets/booming.png";

const StyledGroup = styled(Box)`
  width: 100%;
  max-width: 100%;
  display: block;
  gap: 20px;

  @media (max-width: 767px) {
    grid-template: 1fr / 1fr;
  }
`;

const StyledCard = styled(Box)`
  border-radius: 10px;
  padding: 25px 30px;
  position: relative;

  &.boom:after {
    position: absolute;
    content: '';
    background-image: url(/assets/booming.png);
    background-size: cover;
    background-repeat: no-repeat;
    display: block;
    width: 185px;
    height: 140px;
    right: -70px;
    bottom: -22px;
  }
`;

const StyledTitle = styled(Typography)`
  color: #FFF;
  font-size: 18px;
  font-style: normal;
  font-weight: 700;
  line-height: 140%;
  margin-bottom: 30px;
`;

const StyledList = styled(Box)`
  ul {
    list-style-type: disc;
    padding-left: 1em;

    li {
      color: #FFF;
      font-size: 14px;
      font-weight: 400;
      line-height: 140%;
      text-align: left;
    }
  }
`;

const StyledParagraph = styled(Typography)`
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: 140%;
  color: #FFF;
`;

export default function Spotlight() {
  return (
    <StyledGroup>
      <StyledCard sx={{
        backgroundColor: '#1F4645',
        marginBottom: '20px'
      }}
      >
        <StyledTitle component="h4">專業且客製化的陪跑方式</StyledTitle>
        <StyledParagraph component="p">不只重視成果，更重視過程與你的全人發展，並強調「Knowing知識經驗、Being個人形塑、Doing行動」三者的交織。不只這樣...</StyledParagraph>
        <StyledList>
          <ul>
            <li>萃取多位自我導向學習實踐者之經驗</li>
            <li>結合被譽為全球最接近民主教育的美國百年民主大學 Goddard College 教學方法（首次在台灣公開）</li>
            <li>結合 High Performance Learning Journeys 學習引導法</li>
            <li>AI智慧推薦與引導</li>
          </ul>
        </StyledList>
      </StyledCard>
      <StyledCard
        sx={{
          backgroundColor: '#16B9B3'
        }}
        className="boom"
      >
        <StyledTitle component="h4">AI 個人化學習工具Ｘ社群支持</StyledTitle>
        <StyledParagraph component="p">有 AI 推薦與引導外，也重視人與人真實地互動！</StyledParagraph>
        <br />
        <StyledList>
          <ul>
            <li>結合 AI 給你更好的資源與人脈推薦，以及學習引導</li>
            <li>跨領域、跨年齡的百人社群，讓你可以找到同儕，也可以找到業界前輩</li>
          </ul>
        </StyledList>
      </StyledCard>
    </StyledGroup>
  );
}
