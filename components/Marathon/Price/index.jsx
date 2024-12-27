import styled from "@emotion/styled";
import {
  Box,
  Typography
} from "@mui/material";

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
  ol {
    list-style-type: decimal;
    padding-left: 1.4em;

    li {
      color: #536166;
      font-size: 16px;
      font-weight: 400;
      line-height: 140%;
      text-align: left;
    }
  }

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

const StyledDiscount = styled(Box)`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  color: #516166;

  .price-type {
    font-size: 18.023px;
    font-style: normal;
    font-weight: 500;
    line-height: 140%;
    margin-right: 0.5em;
  }
  .curr {
    font-family: Roboto;
    font-size: 19.31px;
    font-weight: 400;
    line-height: 140%;
    margin-right: 0.5em;
  }
  .count {
    font-family: Roboto;
    font-size: 25.746px;
    font-style: normal;
    font-weight: 700;
    line-height: 140%
  }

  .price {
    position: relative;
    &:after {
      content: '';
      width: 110%;
      height: 2px;
      background-color: #516166;
      top: 50%;
      left: 50%;
      transform: translate(-50%);
      position: absolute;
    }
  }

  @media (max-width: 767px) {
    justify-content: center;

    .price-type {
      font-size: 14px;
    }
    .curr {
      font-size: 15px;
    }
    .count {
      font-size: 20px;
    }
    .price:after {
      height: 1px;
    }
  }
`;
const StyledPriceCardGroup = styled(Box)`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0 25.75px;
  max-width: 100%;
  @media (max-width: 767px) {
    gap: 0px 10px;
  }
`;

const StyledPriceCard = styled(Box)`
  padding: 25.75px;
  border-radius: 12.873px;
  background-color: #F3F3F3;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: space-between;

  .title {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-start;
    color: #536166;
    font-size: 20px;
    font-style: normal;
    font-weight: 700;
    line-height: 140%;
    margin-bottom: 20px;
  }

  .note {
    margin-left: 0.5em;
    font-weight: 400;
    font-size: 16px;
  }

  .price {
    margin-top: auto;
    display: flex;
    flex-direction: row;
    align-items: flex-end;
    justify-content: flex-start;
  }

  .curr {
    font-family: Roboto;
    font-size: 20px;
    font-weight: 400;
    line-height: 140%;
    margin-right: 0.5em;
    height: 100%;
    display: flex;
    align-items: flex-end;
    color: #536166;
  }

  .count {
    height: 100%;
    font-family: Roboto;
    font-size: 45px;
    font-weight: 500;
    line-height: 100%;
    letter-spacing: -0.496px;
    display: flex;
    align-items: flex-end;
    height: auto;
  }

  @media (max-width: 767px) {
    border-radius: 10px;
    padding: 20px;

    .title {
      flex-direction: column;
      align-items: flex-start;
      font-size: 16px;
      margin-bottom: 12px;
    }
    .note {
      font-weight: 400;
      font-size: 12px;
      margin: 0;
    }
    .curr {
      font-size: 15px;
    }
    .count {
      font-size: 30px;
    }
  }
`;

const StyledPartnerPrice = styled(Box)`
  padding: 25.75px;
  border-radius: 12.873px;
  border: 1px solid #89DAD7;

  .group {
    border-bottom: 1px solid #DBDBDB;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-start;
  }

  .type {
    padding: 12.87px 25.75px;
    flex-grow: 1;
    width: 50%;
  }

  .type p {
      color: #536166;
      font-size: 20.597px;
      font-style: normal;
      font-weight: 700;
      line-height: 140%;
  }

  .price {
    flex-shrink: 0;
    padding: 7.72px 25.75px;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }

  .total {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-start;
  }
  
  .total .curr {
    font-family: Roboto;
    font-size: 19.31px;
    font-weight: 400;
    line-height: 140%;
    color: #536166;
    margin-right: 0.25em;
  }
  
  .total .count {
    font-family: Roboto;
    font-size: 25.746px;
    font-style: normal;
    font-weight: 700;
    line-height: 140%;
    color: #536166;
  }

  .single {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-start;
  }

  .single .curr {
    margin-right: 0.25em;
    font-family: Roboto;
    font-size: 19.31px;
    font-style: normal;
    font-weight: 400;
    line-height: 140%;
    color: #536166;
  }

  .single .count {
    color: #FFA10B;
    font-family: Roboto;
    font-size: 30.896px;
    font-style: normal;
    font-weight: 500;
    line-height: 150%;
    letter-spacing: -0.34px;
  }

  @media (max-width: 767px) {
    padding: 20px;
    border-radius: 10px;

    .type {
      width: auto;
      padding: 10px;
      flex-shrink: 0;
    }

    .type p {
      font-size: 16px;
    }

    .price {
      padding: 6px 20px;
      flex-direction: column;
      align-items: flex-start;
    }

    .total .curr {
      font-size: 15px;
    }
    .total .count {
      font-size: 20px;
    }
    .single .curr {
      font-size: 15px;
    }
    .single .count {
      font-size: 24px;
    }
  }
`;
export default function Price() {
  return (
    <StyledGroup>
      <StyledParagraph component="p" sx={{ marginBottom: '36px' }}>
        申請無需費用，入選後才需繳交！<br />
        完賽可退全額，完賽標準請見退費標準！
      </StyledParagraph>
      <StyledDiscount sx={{ marginBottom: '16px' }}>
        <span className="price-type">原價</span>
        <div className="price flex items-center">
          <span className="curr">NT$</span>
          <span className="count">32,000</span>
        </div>
      </StyledDiscount>
      <StyledPriceCardGroup className="mb-[10px] md:mb-[28px]">
        <StyledPriceCard>
          <div className="title">
            <span>優惠價</span>
          </div>
          <div className="price">
            <p className="curr">NT$</p>
            <Typography className="count" sx={{ color: '#16B9B3' }}>8,000</Typography>
          </div>
        </StyledPriceCard>
        <StyledPriceCard>
          <div className="title">
            <span>早鳥價</span>
            <span className="note">12/31 23:59 前申請</span>
          </div>
          <div className="price">
            <p className="curr">NT$</p>
            <Typography className="count" sx={{ color: '#FFA10B' }}>6,000</Typography>
          </div>
        </StyledPriceCard>
      </StyledPriceCardGroup>
      <StyledPartnerPrice sx={{ marginBottom: '36px' }}>
        <div className="group">
          <div className="type"><p>2人團報價</p></div>
          <div className="price">
            <div className="total">
              <p className="curr">NT$</p>
              <p className="count">10,000</p>
            </div>
            <div className="single">
              <p className="curr">/ 一人NT$ </p>
              <p className="count">5,000</p>
            </div>
          </div>
        </div>
        <div className="group">
          <div className="type"><p>3人團報價</p></div>
          <div className="price">
            <div className="total">
              <p className="curr">NT$</p>
              <p className="count">12,000</p>
            </div>
            <div className="single">
              <p className="curr">/ 一人NT$ </p>
              <p className="count">4,000</p>
            </div>
          </div>
        </div>
        <div className="group">
          <div className="type"><p>4人團報價</p></div>
          <div className="price">
            <div className="total">
              <p className="curr">NT$</p>
              <p className="count">12,000</p>
            </div>
            <div className="single">
              <p className="curr">/ 一人NT$ </p>
              <p className="count">3,000</p>
            </div>
          </div>
        </div>
      </StyledPartnerPrice>
      <StyledList sx={{ marginBottom: '36px' }}>
        <ul>
          <li>活動費用於入選公告後再繳費即可，主辦單位將會寄發繳費通知到入選者信箱</li>
          <li>若完成指定的條件，會退回活動費用</li>
          <li>島島阿學提供三名中低收入戶學習者免活動費用的參與機會，申請時須提供證明</li>
          <li>申請期間有不定期的折價優惠活動，至高可折 500 元，歡迎追蹤島島阿學 Instagram 與 FB 粉絲專頁。</li>
        </ul>
      </StyledList>
      <Typography
        component="h2"
        sx={{
          marginBottom: '36px',
          fontSize: '22px',
          fontWeight: '700',
          lineHeight: '140%',
          color: "#293A3D"
        }}
      >
        退費標準
      </Typography>
      <StyledList>
            需符合以下三項要求
            <ol>
              <li>
                工作坊、學習小組會議、團體諮詢及 1對1 諮詢，加總不得請假超過5小時。
              </li>
              <li>
                提交所有每兩週的進度報告。
              </li>
              <li>
                參與7/12成果發表日。
              </li>
              <li>
                於 2025/7/10 前完成以下資料
                <ul>
                  <li>
                    完成並上傳所有成果發表資料。
                  </li>
                  <li>
                    分享至少三個於計劃期間使用的學習資源，並分享使用心得。
                  </li>
                  <li>
                    完成學習馬拉松回饋問卷。
                  </li>
                </ul>
              </li>
            </ol>
      </StyledList>

    </StyledGroup>
  );
}
