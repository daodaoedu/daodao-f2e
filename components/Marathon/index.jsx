import { useMemo, useRef, useState } from 'react';
import styled from '@emotion/styled';
import { Divider, Typography, Box, Grid } from '@mui/material';
import Banner from './Banner';
import About from './About';
import Edm from './Edm';

const LearningMarathonWrapper = styled.div``;

const StyledGuideTitle = styled(Typography)`
  color: #293A3D;
  font-weight: bold;
  line-height: 140%;
  margin-left: 0;
  text-align: left;
  font-size: 22px;
`;

const StyledGuideSubtitle = styled(Typography)`
  font-size: 16px;
  font-width: 500;
  line-height: 140%;
`;
const StyledGuideParagraph = styled(Typography)`
  font-size: 16px;
  font-style: normal;
  font-weight: 400;
  line-height: 140%;
  display: block;
  text-align: left;
  color: #536166;
`;

const GuideWrapper = styled.div`
  width: 52vw;
  margin: 0 auto;
  padding-top: 100px;
  padding-bottom: 100px;

  @media (max-width: 767px) {
    width: 100%;
    padding-top: 40px;
    padding-bottom: 20px;
  }
`;

const StyledList = styled(Box)`

  ul {
    list-style-type: inherit;
    padding-left: 1.5em;
  }

  ol {
   list-style-type: decimal;
   padding-left: 1.5em; 
  }
  
  li {
    font-size: 16px;
    font-style: normal;
    font-weight: 400;
    line-height: 140%;
    color: #536166;
  }

  p, span {
    font-size: 16px;
    font-style: normal;
    font-weight: 400;
    line-height: 140%;
    color: #536166;
  }
`;
const StyledMethodCard = styled(Box)`
  display: flex;
  width: 100%;
  height: 300px;
  padding: 25px 30px;
  flex-direction: column;
  align-items: flex-start;
  gap: 30px;
  align-self: stretch;
  border-radius: 10px;

  h3 {
    color: #293A3D;
    font-size: 18px;
    font-style: normal;
    font-weight: 700;
    line-height: 140%;
  }

  ul {
    list-style-type: inherit;
    padding-left: 1.5em;
  }

  li {
    font-size: 14px;
    font-style: normal;
    font-weight: 400;
    line-height: 140%;
    color: #293A3D;
  }
`;

const StyledSpotlightCard = styled(Box)`
  padding: 25px 30px;
  color: #FFF;
  border-radius: 10px;

  ul {
    padding-left: 1.5em;
    list-style-type: inherit;
  }
  
  h3 {
    color: #FFF;
    font-size: 18px;
    font-style: normal;
    font-weight: 700;
    line-height: 140%;
    margin-bottom: 36px;
  }
  
  p, li {
    font-size: 14px;
    font-style: normal;
    font-weight: 400;
    line-height: 140%;
  }
`;

function Marathon() {
  const guideRef = useRef(null);
  return (
    <LearningMarathonWrapper>
      <Banner guideRef={guideRef} />
      <Box component="section">
        <GuideWrapper>
          <StyledGuideTitle
            variant="h2"
            className="guide-title"
            sx={{ marginBottom: '10px' }}
          >
            活動介紹
          </StyledGuideTitle>
          <Typography
            variant="body1"
            component="p"
            sx={{
              color: '#536166',
              fontWeight: '400',
              fontSize: '16px',
              lineHeight: '140%',
              letterSpacing: 'normal',
              textAlign: 'left',
              marginBottom: '1.5em'
            }}
          >
            學習這趟漫長的馬拉松，我可不可以用我的方式跑向屬於我的終點？<br />
            發展興趣、改變生活習慣、上理想的大學、生涯規劃、發起社會行動，每一個生活大小事都是一場學習馬拉松。然而，每一次的奮力前行總會遇到「不知道怎麼計畫」、「好難自律」、「沒有伴」、「資源與人脈有限」、「無限自我質疑」等難題...
          </Typography>
          <StyledGuideParagraph
            variant="body1"
            component="p"
          >
            島島盃將提供你四大裝備：
          </StyledGuideParagraph>
          <StyledList sx={{ marginBottom: '1.5em' }}>
            <ul>
              <li>
                「專業陪跑員」陪你規劃路徑與自我釐清
              </li>
              <li>
                「百人社群」讓你找到合適夥伴與各界人脈
              </li>
              <li>
                「AI個人化數位工具」讓你在紀錄與覆盤中自律學習、AI智慧推薦與引導
              </li>
              <li>
                「專業課程」帶你掌握自主學習要領
              </li>
            </ul>
          </StyledList>

          <Typography
            variant="body1"
            component="p"
            sx={{
              color: '#536166',
              fontWeight: '400',
              fontSize: '16px',
              lineHeight: '140%',
              letterSpacing: 'normal',
              textAlign: 'left',
              marginBottom: '1.5em'
            }}
          >如果你有些想做的計畫，正在等待個契機開始，現在就是時候。<br />
            五個月的馬拉松後，你將會在計畫過程中「豐富知識經驗、在學習中形塑自我、為生活與社會帶來實際行動」，而最終的成果發表你還有機會獲得獎助金。
          </Typography>
          <Typography
            variant="body1"
            component="p"
            sx={{
              color: '#536166',
              fontWeight: '400',
              fontSize: '16px',
              lineHeight: '140%',
              letterSpacing: 'normal',
              textAlign: 'left',
            }}
          >
            島島盃 2025 春季學習馬拉松，將以學習者以自我需求出發設計學習計畫，開啟一趟自我導向學習馬拉松，往哪跑？怎麼跑？跑多快？終點在哪由你決定，島島阿學陪你一起跑。<br />
            邀請你一起「為自己重新打造喜歡的學習生活」，讓我們陪伴彼此，成就自我與他人。
          </Typography>
        </GuideWrapper>
      </Box>
      <Box
        component="section"
        sx={{ backgroundColor: '#DEF5F5' }}
      >
        <GuideWrapper>
          <StyledGuideTitle variant="h2" sx={{ marginBottom: '36px' }}>
            誰適合參加？
          </StyledGuideTitle>
          <StyledList
            sx={{
              marginBottom: '36px'
            }}
          >
            <ul>
              <li>16歲以上學習者皆可報名，優先以高中及大學生為主</li>
              <li>有意願為自己打造專屬學習旅程的學習者</li>
            </ul>
          </StyledList>
          <StyledList sx={{ marginBottom: '36px' }}>
            <StyledGuideParagraph>
              如果你符合下列一項，那你也許就是適合的參加的人：
            </StyledGuideParagraph>
            <ol>
              <li>有模糊的職涯／生涯方向，想開始做準備與鋪路</li>
              <li>學校課程好無聊，希望可以用自己的方式學自己有興趣的事情</li>
              <li>考試不適合我，更想用個人經歷上大學</li>
              <li>想自主學習，有方向但不確定可以怎麼開始</li>
            </ol>
          </StyledList>
          <StyledGuideParagraph
            variant="body1"
            component="p"
          >
            特別提醒：<br />
            活動重視社群互動與共學，若無法在計劃期間投入時間參與並和其他夥伴和 Mentor 互動，請斟酌報名。
          </StyledGuideParagraph>
        </GuideWrapper>
      </Box>
      <Box
        component="section"
        sx={{ backgroundColor: '#FFF' }}
      >
        <GuideWrapper>
          <StyledGuideTitle
            variant="h2"
            sx={{
              marginBottom: '36px',
            }}
          >
            馬拉松進行方式
          </StyledGuideTitle>
          <Typography
            variant="h3"
            sx={{
              fontSize: '18px',
              fontWeight: '700',
              fontStyle: 'normal',
              lineHeight: '120%',
              marginBottom: '36px',
              color: '#293A3D'
            }}
          >
            我們提供的裝備
          </Typography>
          <Grid
            container
            columnSpacing={2}
            rowSpacing={2}
            sx={{
              marginBottom: '36px'
            }}
          >
            <Grid item xs={12} sm={6}>
              <StyledMethodCard sx={{ backgroundColor: '#DEF5F5' }}>
                <h3>「專業陪跑員」 <br />陪你規劃路徑與自我釐清</h3>
                <ul>
                  <li>3 次 1 小時一對一諮詢</li>
                  <li> 2 次 1 小時團體諮詢</li>
                  <li>Mentor 每兩週對學員的學習進度給予回饋</li>
                </ul>
              </StyledMethodCard>
            </Grid>
            <Grid item xs={12} sm={6}>
              <StyledMethodCard sx={{ backgroundColor: '#DEEDF5' }}>
                <h3>「專業課程」<br /> 帶你掌握自主學習要領</h3>
                <ul>
                  <li>「策略」目標設定與學習策略</li>
                  <li>「方法」思考、提問、筆記方法</li>
                  <li>「人」學習社群與個人狀態釐清</li>
                  <li>「展現」成果展現與自我行銷</li>
                </ul>
              </StyledMethodCard>
            </Grid>
            <Grid item xs={12} sm={6}>
              <StyledMethodCard sx={{ backgroundColor: '#DEF5E7' }}>
                <h3>「百人社群」 讓你找到合適夥伴與各界人脈</h3>
                <ul>
                  <li>5 次 1 小時全員每月聚會</li>
                  <li>專屬學習小組，5 次 1 小時學習小組每月聚會</li>
                  <li>島島阿學 Discord 社群即時交流 島島阿學網站找夥伴找揪團功能</li>
                </ul>
              </StyledMethodCard>
            </Grid>

            <Grid item xs={12} sm={6}>
              <StyledMethodCard sx={{ backgroundColor: '#DEF5F5' }}>
                <h3>「AI 個人化學習工具」 引導你學習方向及自律學習</h3>
                <ul>
                  <li>具引導性的自主學習模板</li>
                  <li>學習日誌</li>
                  <li>學習任務上傳與回饋區</li>
                  <li>進度安排與檢核表</li>
                  <li>自我檢核表</li>
                  <li>學習成果分享專區</li>
                  <li>AI智慧推薦與引導</li>
                </ul>
              </StyledMethodCard>
            </Grid>
          </Grid>
          <Typography
            variant="h3"
            sx={{
              fontSize: '18px',
              fontWeight: '700',
              fontStyle: 'normal',
              lineHeight: '120%',
              marginBottom: '36px'
            }}
          >
            這場馬拉松有什麼不一樣？
          </Typography>
          <Grid container columnSpacing={1}>
            <Grid item xs={12} sx={{ marginBottom: '20px' }}>
              <StyledSpotlightCard sx={{ backgroundColor: '#1F4645' }}>
                <h3>專業且客製化的陪跑方式</h3>
                <p>不只重視成果，更重視過程與你的全人發展，並強調「Knowing知識經驗、Being個人形塑、Doing行動」三者的交織。不只這樣...</p>
                <ul>
                  <li>萃取多位自我導向學習實踐者之經驗</li>
                  <li>結合被譽為全球最接近民主教育的美國百年民主大學 Goddard College 教學方法（首次在台灣公開）</li>
                  <li>結合 High Performance Learning Journeys 學習引導法</li>
                  <li>AI智慧推薦與引導</li>
                </ul>
              </StyledSpotlightCard>
            </Grid>
            <Grid item xs={12}>
              <StyledSpotlightCard sx={{ backgroundColor: '#16B9B3' }}>
                <h3>AI 個人化學習工具Ｘ社群支持</h3>
                <p>有 AI 推薦與引導外，也重視人與人真實地互動！</p>
                <ul>
                  <li>結合 AI 給你更好的資源與人脈推薦，以及學習引導</li>
                  <li>跨領域、跨年齡的百人社群，讓你可以找到同儕，也可以找到業界前輩</li>
                </ul>
              </StyledSpotlightCard>
            </Grid>
          </Grid>
        </GuideWrapper>
      </Box>

      <Box
        component="section"
        sx={{ backgroundColor: '#DEF5F5' }}
      >
        <GuideWrapper>
          <StyledGuideTitle variant="h2" sx={{ marginBottom: '36px' }}>
            你可以預期的收穫
          </StyledGuideTitle>
          <StyledGuideParagraph
            component="p"
            variant="body1"
            sx={{
              marginBottom: '1.5em'
            }}
          >
            只要報名，不論有無入選，就可以優先使用島島阿學 AI 個人化學習工具，包含自主學習模板、學習日誌、學習進度追蹤、AI 智慧與引導等功能！
          </StyledGuideParagraph>

          <StyledList sx={{ marginBottom: '36px' }}>
            <StyledGuideParagraph
              variant="body1"
              component="p"
            >
              而入選後，你還可以與專屬引導師與學習夥伴跑完一趟自我導向學習的馬拉松，完成遲遲未開始的計畫，並在過程中...
            </StyledGuideParagraph>
            <ol>
              <li>習得AI世代不可或缺的「自主學習力、協作力、跨領域學習力」</li>
              <li>更深入認識自己，將學習與自身需求連結，找到學習的內在動機</li>
              <li>豐富學習資源與人脈，讓學習不再孤單，並增加學習可能性</li>
              <li>完成一份具體的學習計畫與成果，兼顧各自需求與外界認可</li>
              <li>成為助人者，完成整趟學習馬拉松者將獲得自主學習引導師優先培訓機會</li>
            </ol>
          </StyledList>
        </GuideWrapper>
      </Box>

      <Box
        component="section"
        sx={{ backgroundColor: '#FFF' }}
      >
        <GuideWrapper>
          <StyledGuideTitle variant="h2" sx={{ marginBottom: '12px' }}>
            成果發表與獎勵
          </StyledGuideTitle>
          <StyledGuideParagraph
            variant="body1"
            component="p"
            sx={{
              marginBottom: '1.5em'
            }}
          >
            在學習馬拉松尾聲，針對入選的20位學員，島島阿學將舉辦成果分享日，並邀請引導師及入選者作為評審，更提供NT$ 5000元獎金支持優秀計畫持續發展！
          </StyledGuideParagraph>
          <StyledGuideSubtitle variant="h3" sx={{ marginBottom: '12px' }}>
            獎勵
          </StyledGuideSubtitle>
          <StyledList sx={{ marginBottom: '1.5em' }}>
            <ul>
              <li>
                成果分享活動將選出5位優選參與者，每位可獲 NT$ 5000元獎金、優選證明，以及島島阿學專訪與媒體曝光。
              </li>
              <li>
                評選標準：
                <ul>
                  <li>
                    學習歷程紀錄與反思完成度（60%）：可以清楚學習每一個過程的狀態（如遇的困難、解決方法、心態等）、反思以及下一步行動的改變。
                  </li>
                  <li>
                    學習成果完成度（40%）：學習成果達到預期的學習目標的程度。
                  </li>
                </ul>
              </li>
            </ul>
          </StyledList>
          <StyledList>
            <StyledGuideSubtitle variant="h3" sx={{ marginBottom: '12px' }}>
              分享路上的風景
            </StyledGuideSubtitle>
            <ul>
              <li>每位參與者在計劃結束時需在島島阿學網站公開學習計劃。</li>
              <li>每位參與者在計劃結束時須分享至少三個於計劃期間使用的學習資源，並分享使用心得。</li>
              <li>每位參與者需完成學習馬拉松回饋問卷。</li>
            </ul>
          </StyledList>
        </GuideWrapper>
      </Box>

      <Box
        component="section"
        sx={{ backgroundColor: '#DEF5F5' }}
      >
        <GuideWrapper>
          <StyledGuideTitle variant="h2" sx={{ marginBottom: '36px' }}>
            如何申請
          </StyledGuideTitle>

          <StyledGuideParagraph variant="body1" component="p">（一）重要時程：</StyledGuideParagraph>
          <StyledList
            sx={{
              marginBottom: '36px'
            }}
          >
            <ul>
              <li>計畫開始報名：2024/12/15</li>
              <li>線上說明會暨自主學習小小工作坊：2024/12/21（六）15:00-16:30</li>
              <li>申請截止：2025/1/19 23:59</li>
              <li>入選與備取公告：2025/1/27</li>
              <li>繳費期限：2025/2/2 23:59</li>
              <li>備取遞補公告：2025/2/4</li>
              <li>計劃期間：2025/2/9-2025/7/12</li>
              <li>線上暖身活動：2025/2/9（日）14:00-15:30</li>
              <li>線上課時間：待確認，前三堂課程將於 2/10-3/10 之間舉行。</li>
              <li>成果分享日：2025/7/12（六）10:00-16:00</li>
              <li>社群交流線上與實體時間：
                <ul>
                  <li>線上：2/23（日）19:30-21:00、4/20（日）19:30-21:00、6/22（日）19:30-21:00</li>
                  <li>實體：3/23（日）15:00-16:30 台北、5/25（日）15:00-16:30 台中</li>
                </ul>
              </li>
            </ul>
          </StyledList>
          <StyledGuideParagraph variant="body1" component="p">（二）申請方式：</StyledGuideParagraph>
          <StyledList
            sx={{
              marginBottom: '36px'
            }}
          >
            <ul>
              <li>透過註冊島島阿學官網會員系統並同時填寫線上表單申請本計劃</li>
              <li>請透過此連結申請</li>
              <li>在報名截止日前皆可修改申請內容</li>
              <li>入選名額：20 位</li>
            </ul>
          </StyledList>
          <StyledGuideParagraph
            variant="body1"
            component="p"
          >
            （三）評選標準：
          </StyledGuideParagraph>
          <StyledGuideParagraph
            variant="body1"
            component="p"
          >
            為確保學習計畫的品質和有效性，評選將依據以下標準進行：
          </StyledGuideParagraph>
          <StyledGuideParagraph variant="body1" component="p">
            1、計畫完整性 （30%）
          </StyledGuideParagraph>
          <StyledList>
            <ul>
              <li>計畫簡述：願景清晰明確，具體可行，例如實現願景的步驟合理、邏輯性強，且有階段性規劃。</li>
              <li>學習動機：動機強烈且具說服力，能清楚連結個人經驗與學習主題。</li>
              <li>學習內容：學習內容具體且聚焦，與學習主題密切相關。</li>
            </ul>
          </StyledList>
          <StyledGuideParagraph variant="body1" component="p">
            2、目標與方法 （30%）
          </StyledGuideParagraph>
          <StyledList>
            <ul>
              <li>學習目標：目標明確、可衡量、可達成、具相關性。</li>
              <li>學習方法與策略：方法和策略多元且有效，能促進學習目標的達成。</li>
            </ul>
          </StyledList>
          <StyledGuideParagraph variant="body1" component="p">
            3、資源與時程 （20%）
          </StyledGuideParagraph>
          <StyledList>
            <ul>
              <li>學習資源：資源類型多元且可靠，包含線上線下資源、書籍、師資、社群等。</li>
              <li>學習時程表：時程安排合理，學習進度規劃明確。</li>
            </ul>
          </StyledList>
          <StyledGuideParagraph variant="body1" component="p">
            4、評量與成果 （20%）
          </StyledGuideParagraph>
          <StyledList>
            <ul>
              <li>學習評量：評量方式客觀且有效，能真實反映學習成果。</li>
              <li>學習成果呈現方式：成果呈現方式具體且多元，並與學習目標相符，能有效展現學習成果。</li>
            </ul>
          </StyledList>
          <StyledGuideParagraph variant="body1" component="p">
            評選委員將依據上述標準，綜合考量申請者的學習計畫，進行評分和排序。
          </StyledGuideParagraph>
        </GuideWrapper>
      </Box>

    </LearningMarathonWrapper>
  );
}

export default Marathon;
