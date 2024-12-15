import styled from "@emotion/styled";
import {
  Box,
  Typography
} from "@mui/material";
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';

const StyledGroup = styled(Box)`
  width: 100%;
  max-width: 100%;

  &.showDecorateImg {
    position: relative;
  }

  &.showDecorateImg:after {
    content: '';
    display: block;
    position: absolute;
    right: 0;
    top: -90px;
    background-image: url('/assets/pen.png');
    background-size: cover;
    background-repeat: no-repeat;
    width: 167px;
    height: 124px;
  }
`;

const StyledList = styled(Box)`
  ul {
    list-style-type: disc;
    padding-left: 1.4em;

    li {
      color: #536166;
      font-size: 16px;
      font-weight: 400;
      line-height: 140%;
      text-align: left;
      }
  }
`;

const StyledParagraph = styled(Typography)`
  font-size: 16px;
  font-style: normal;
  font-weight: 400;
  line-height: 140%;
  color: #536166;
`;

const StyledYear = styled(Typography)`
  color: #16B9B3;
  font-family: Roboto;
  font-size: 20px;
  font-style: normal;
  font-weight: 700;
  line-height: 140%;
`;
const StyledTimelineGroup = styled(Box)`
  display: flex;
  flex-direction: row;
  align-items: stretch;
  justify-content: flex-start;
  border-radius: 4px;
  gap: 4px;
`;

const StyledDateCard = styled(Box)`
  background-color: #FFF;
  border-radius: 4px;
  width: 120px;
  flex-shrink: 0;
  padding: 6px 12px;
  text-align: center;
`;

const StyledTime = styled(Typography)`
  font-family: Roboto;
  font-size: 16px;
  font-weight: 400;
  line-height: 140%; 
  color: #536166;
  word-break: none;
  text-align: center;
`;

const StyledContent = styled(Typography)`
  color: #536166;
  font-size: 16px;
  font-style: normal;
  font-weight: 700;
  line-height: 140%;
  background-color: #FFF;
  border-radius: 4px;
  width: 100%;
  padding: 10px 20px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
`;

const StyledDateGroup = styled(Box)`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  
  .date {
    margin-right: 4px;
    font-size: 20px;
    font-style: normal;
    font-weight: 700;
    line-height: 140%;
    color: #536166;
    width: 3em;
    text-align: right;
  }
  
  .weekday {
    display: flex;
    align-self: center;
    width: 24px;
    height: 24px;
    flex-shrink: 0;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    border-radius: 4px;
    background: #FFA10B;
    text-align: center;

    span {
      color: #FFF;
      text-align: center;
      font-family: Roboto;
      font-size: 16px;
      font-style: normal;
      font-weight: 700;
      line-height: 140%;
    }
  }
`;
export default function Apply() {
  return (
    <StyledGroup className="showDecorateImg">
      <Box sx={{ marginBottom: '36px' }}>
        <StyledParagraph component="p" sx={{ marginBottom: '12px' }}>
          （一）重要時程
        </StyledParagraph>
        <StyledYear component="p" sx={{ marginBottom: '8px' }}>
          2024
        </StyledYear>
        <StyledTimelineGroup sx={{ marginBottom: '8px' }}>
          <StyledDateCard>
            <StyledDateGroup>
              <div className="date">12/15</div>
              <div className="weekday"><span>日</span></div>
            </StyledDateGroup>
          </StyledDateCard>
          <StyledContent>
            計畫開始申請
          </StyledContent>
        </StyledTimelineGroup>
        <StyledTimelineGroup sx={{ marginBottom: '8px' }}>
          <StyledDateCard className="time">
            <StyledDateGroup>
              <div className="date">12/29</div>
              <div className="weekday"><span>六</span></div>
            </StyledDateGroup>
            <StyledTime component="p" sx={{ lineBreak: 'none' }}>15:00-16:30</StyledTime>
          </StyledDateCard>
          <StyledContent>
            自主學習工作坊暨說明會（線上）
          </StyledContent>
        </StyledTimelineGroup>
        <StyledYear component="p" sx={{ marginBottom: '8px' }}>
          2025
        </StyledYear>
        <StyledTimelineGroup sx={{ marginBottom: '8px' }}>
          <StyledDateCard className="time">
            <StyledDateGroup>
              <div className="date">01/19</div>
              <div className="weekday"><span>日</span></div>
            </StyledDateGroup>
          </StyledDateCard>
          <StyledContent>
            申請截止
          </StyledContent>
        </StyledTimelineGroup>
        <StyledTimelineGroup sx={{ marginBottom: '8px' }}>
          <StyledDateCard className="time">
            <StyledDateGroup>
              <div className="date">01/27</div>
              <div className="weekday"><span>一</span></div>
            </StyledDateGroup>
          </StyledDateCard>
          <StyledContent>
            入選與備取公告
          </StyledContent>
        </StyledTimelineGroup>

        <StyledTimelineGroup sx={{ marginBottom: '8px' }}>
          <StyledDateCard className="time">
            <StyledDateGroup>
              <div className="date">02/03</div>
              <div className="weekday"><span>一</span></div>
            </StyledDateGroup>
            <StyledTime component="p" sx={{ lineBreak: 'none' }}>23:59</StyledTime>
          </StyledDateCard>
          <StyledContent>
            繳費期限
          </StyledContent>
        </StyledTimelineGroup>

        <StyledTimelineGroup sx={{ marginBottom: '8px' }}>
          <StyledDateCard className="time">
            <StyledDateGroup>
              <div className="date">02/05</div>
              <div className="weekday"><span>三</span></div>
            </StyledDateGroup>
          </StyledDateCard>
          <StyledContent>
            備取遞補公告
          </StyledContent>
        </StyledTimelineGroup>

        <StyledTimelineGroup sx={{ marginBottom: '8px' }}>
          <StyledDateCard className="time">
            <StyledDateGroup>
              <div className="date">02/09</div>
              <div className="weekday"><span>日</span></div>
            </StyledDateGroup>
            <ArrowDownwardIcon sx={{ color: '#536166' }} />
            <StyledDateGroup>
              <div className="date">07/12</div>
              <div className="weekday"><span>六</span></div>
            </StyledDateGroup>
          </StyledDateCard>
          <StyledContent>
            計畫期間
          </StyledContent>
        </StyledTimelineGroup>

        <StyledTimelineGroup sx={{ marginBottom: '8px' }}>
          <StyledDateCard className="time">
            <StyledDateGroup>
              <div className="date">02/09</div>
              <div className="weekday"><span>日</span></div>
            </StyledDateGroup>
            <StyledTime component="p" sx={{ lineBreak: 'none' }}>14:00-15:00</StyledTime>
          </StyledDateCard>
          <StyledContent>
            暖身活動（線上）
          </StyledContent>
        </StyledTimelineGroup>

        <Box sx={{
          marginBottom: '8px',
          borderRadius: '4px',
          backgroundColor: '#FFF',
          padding: '10px 20px'
        }}
        >
          <Typography
            component="h4"
            sx={{
              fontSize: '16px',
              fontWeight: '700',
              color: '#536166',
              lineHeight: '140%'
            }}
          >
            線上課時間
          </Typography>
          <StyledList>
            <ul>
              <li>2025/2/15（六）、2025/2/22（六）、2025/3/1（六）14:00-15:30</li>
            </ul>
          </StyledList>
        </Box>
        <StyledTimelineGroup sx={{ marginBottom: '8px' }}>
          <StyledDateCard className="time">
            <StyledDateGroup>
              <div className="date">07/12</div>
              <div className="weekday"><span>六</span></div>
            </StyledDateGroup>
            <StyledTime component="p" sx={{ lineBreak: 'none' }}>10:00-16:00</StyledTime>
          </StyledDateCard>
          <StyledContent>
            成果分享日
          </StyledContent>
        </StyledTimelineGroup>

        <Box sx={{
          borderRadius: '4px',
          backgroundColor: '#FFF',
          padding: '10px 20px'
        }}
        >
          <Typography
            component="h4"
            sx={{
              fontSize: '16px',
              fontWeight: '700',
              color: '#536166',
              lineHeight: '140%'
            }}
          >
            社群交流線上與實體時間
          </Typography>
          <StyledList>
            <ul>
              <li>線上：2/23（日）19:30-21:00、4/20（日）19:30-21:00、6/22（日）19:30-21:00</li>
              <li>實體：3/23（日）15:00-16:30 台北、5/25（日）15:00-16:30 台中</li>
              <li>地點與時間將依入選學員進行調整</li>
            </ul>
          </StyledList>
        </Box>
      </Box>

      <Box sx={{ marginBottom: '36px' }}>
        <StyledParagraph component="p">
          （二）申請方式
        </StyledParagraph>
        <StyledList>
          <ul>
            <li>進入島島阿學網站，點選學習馬拉松頁面「立即申請」</li>
            <li>在申請截止日前皆可修改申請內容</li>
            <li>入選名額：20 位</li>
          </ul>
        </StyledList>
      </Box>

      <Box>
        <StyledParagraph component="p">
          （三）評選標準
        </StyledParagraph>
        <StyledParagraph component="p">
          為確保學習計畫的品質和有效性，評選將依據以下標準進行：
        </StyledParagraph>
        <StyledParagraph component="p">
          1、計畫完整性 （30%）
        </StyledParagraph>
        <StyledList>
          <ul>
            <li>計畫簡述：願景清晰明確，具體可行，例如實現願景的步驟合理、邏輯性強，且有階段性規劃。</li>
            <li>學習動機：動機強烈且具說服力，能清楚連結個人經驗與學習主題。</li>
            <li>學習內容：學習內容具體且聚焦，與學習主題密切相關。</li>
          </ul>

          <br />
        </StyledList>
        <StyledParagraph component="p">
          2、目標與方法 （30%）
        </StyledParagraph>
        <StyledList>
          <ul>
            <li>學習目標 ：目標明確、可衡量、可達成、具相關性。</li>
            <li>學習方法與策略：方法和策略多元且有效，能促進學習目標的達成。</li>
          </ul>
          <br />
        </StyledList>
        <StyledParagraph component="p">
          3、資源與時程 （20%）
        </StyledParagraph>
        <StyledList>
          <ul>
            <li>學習資源：資源類型多元且可靠，包含線上線下資源、書籍、師資、社群等。</li>
            <li>學習時程表：時程安排合理，學習進度規劃明確。</li>
          </ul>
          <br />
        </StyledList>
        <StyledParagraph component="p">
          4、評量與成果 （20%）
        </StyledParagraph>
        <StyledList>
          <ul>
            <li>學習評量：評量方式客觀且有效，能真實反映學習成果。</li>
            <li>學習成果呈現方式：成果呈現方式具體且多元，並與學習目標相符，能有效展現學習成果。</li>
          </ul>
          <br />
        </StyledList>
        <StyledParagraph>
          評選委員將依據上述標準，綜合考量申請者的學習計畫，進行評分和排序。
        </StyledParagraph>
      </Box>
    </StyledGroup>
  );
}
