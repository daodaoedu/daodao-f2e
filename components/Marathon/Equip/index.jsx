import styled from "@emotion/styled";
import {
  Box,
  Typography
} from "@mui/material";

const StyledGroup = styled(Box)`
  width: 100%;
  max-width: 100%;
  display: grid;
  grid-template: 1fr 1fr / 1fr 1fr;
  gap: 20px;

  @media (max-width: 767px) {
    grid-template: 1fr / 1fr;
  }
`;

const StyledCard = styled(Box)`
  height: 300px;
  border-radius: 10px;
  padding: 25px 30px;
`;

const StyledTitle = styled(Typography)`
  color: #293A3D;
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
      color: #293A3D;
      font-size: 14px;
      font-weight: 400;
      line-height: 140%;
      text-align: left;
    }
  }
`;
export default function Equip() {
  return (
    <StyledGroup>
      <StyledCard sx={{
        backgroundColor: '#DEF5F5'
      }}
      >
        <StyledTitle component="h4">「專業陪跑員」<br />陪你規劃路徑與自我釐清</StyledTitle>
        <StyledList>
          <ul>
            <li>3 次 1 小時一對一諮詢</li>
            <li>2 次 1 小時團體諮詢</li>
            <li>引導師每兩週對學員的學習進度給予回饋</li>
          </ul>
        </StyledList>
      </StyledCard>
      <StyledCard sx={{
        backgroundColor: '#DEEDF5'
      }}
      >
        <StyledTitle component="h4">「專業課程」<br />帶你掌握自主學習要領</StyledTitle>
        <StyledList>
          <ul>
            <li>「策略」目標設定與學習策略</li>
            <li>「方法」思考、提問、筆記方法</li>
            <li>「人」學習社群與個人狀態釐清</li>
            <li>「展現」成果展現與自我行銷</li>
          </ul>
        </StyledList>
      </StyledCard>
      <StyledCard sx={{
        backgroundColor: '#DEF5E7'
      }}
      >
        <StyledTitle component="h4">「百人社群」<br />讓你找到合適夥伴與各界人脈</StyledTitle>
        <StyledList>
          <ul>
            <li>5 次 1 小時全員每月聚會</li>
            <li>專屬學習小組，5 次 1 小時學習小組每月聚會</li>
            <li>島島阿學Discord社群即時交流</li>
            <li>島島阿學網站找夥伴找揪團功能</li>
          </ul>
        </StyledList>
      </StyledCard>
      <StyledCard sx={{
        backgroundColor: '#DEF5F5'
      }}
      >
        <StyledTitle component="h4">「AI個人化學習工具」<br />引導你學習方向及自律學習</StyledTitle>
        <StyledList>
          <ul>
            <li>具引導性的自主學習模板</li>
            <li>學習日誌</li>
            <li>學習任務上傳與回饋區</li>
            <li>進度安排與檢核表</li>
            <li>自我檢核表</li>
            <li>學習成果分享專區</li>
            <li>AI推薦與引導</li>
          </ul>
        </StyledList>
      </StyledCard>
    </StyledGroup>
  );
}
