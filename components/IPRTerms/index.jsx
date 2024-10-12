import React from 'react';
import styled from '@emotion/styled';
import { Paper } from '@mui/material';

const IPRWrapper = styled.section`
  padding-top: 40px;
  padding-bottom: 40px;
`;

const PaperWrapper = styled(Paper)`
  width: min(90%, 800px);
  margin: 0 auto;
  padding: 40px 20px;

  @media (max-width: 767px) {
    padding: 20px;
  }

  h2 {
    font-size: 24px;
    font-size: min(max(24px, 5vw), 24px);
    text-wrap: balance;
    margin: 0 auto 1em;
    color: #293a3d;
    text-align: center;
    font-weight: 500;
  }

  @media (max-width: 767px) {
    .title {
      text-overflow: ellipsis;
      width: 100%;
    }
  }

  h3 {
    font-size: 18px;
    font-weight: 500;
    margin: 1.5em 0 1em 0;
    color: #293a3d;
  }

  p {
    font-size: 16px;
    margin: 0 0 1em 0;
    color: #536166;
    line-height: 150%;
  }

  ol {
    counter-reset: section;

    li {
      counter-increment: section;
      margin-bottom: 0.5em;
    }
  }

  ol li ol {
    counter-reset: item;
    list-style-type: none;
    margin-left: 20px;

    li {
      counter-increment: item;
      list-style-type: none;
      display: flex;
      flex-direction: row;
      align-items: flex-start;
      justify-content: flex-start;
      line-height: 150%;

      &:before {
        content: counter(section) '.' counter(item) '.';
        font-weight: 400;
        display: inline-block;
        width: 2em;
        flex-shrink: 0;
      }

      p {
        display: inline-block;
        padding-left: 0.5em;
        margin-bottom: 0;
      }
    }
  }
`;

const IPRTerms = () => {
  return (
    <IPRWrapper>
      <PaperWrapper>
        <h2>島島阿學資源共享自主學習網站智慧財產權</h2>
        <p>
          島島阿學資源共享自主學習網站（https://www.daoedu.tw，以下簡稱「本網站」）尊重他人的智慧財產權，希望提供一個不包含侵犯這些權利的內容平台。我們的使用者協議要求會員發布的資訊準確、合法且不侵犯第三方的權利，這個要求包含本網站所舉辦的任何型態活動。
        </p>
        <p>
          請注意，無論我們是否禁止存取或刪除內容，本網站都可能會善意地嘗試將書面通知（包括投訴人的聯絡資訊）轉發給發布該內容的會員和/或採取其他合理措施來通知該會員。表示本網站
          已收到涉嫌侵犯智慧財產權或其他內容違規的通知。我們的政策也是，在適當的情況下，我們可以自行決定停用和/或終止侵犯或反覆侵犯他人權利或以其他方式發布非法內容的會員或團體（視情況而定）的帳戶。
        </p>
        <p>
          請注意，您提交的任何通知或反通知必須真實，且必須遵守偽證罪的處罰規定。虛假通知或反通知可能會導致個人責任。因此，您可能需要在提交通知或反通知之前尋求法律顧問的建議。
        </p>
        <ol>
          <li>
            <h3>1. 著作權</h3>
            <ol>
              <li>
                <p>
                  網站協作者查核後所撰寫的回應、補充或評價等資訊，若有產生著作權利保護之可能，撰寫之編輯同意採公眾領域宣告（CC0-1.0）無償提交至本網站所維運之電腦或相關設備進行存放。
                </p>
              </li>
              <li>
                <p>
                  網站協作者若使用第三方之資料來源進行佐證，其引用之資料來源之著作仍屬於原創作之第三方所有，此時協作者同意為查證目的，在合理範圍內引用第三方資料，並於提交時提供原創作出處。
                </p>
              </li>
              <li>
                <p>
                  網站協作者及聊天機器人使用者採 CC0-1.0
                  提交資訊後，本網站將存放於電腦或其相關設備的該等資訊進行編輯性整理後，得採
                  CC BY-SA 4.0
                  或其他授權模式，將具編輯性保護之資料集發布於島島阿學學習社群網站、島島阿學學習社群聊天機器人或島島阿學學習社群所提供資料存檔等處。
                </p>
              </li>
              <li>
                <p>
                  若資料利用者有違反前項授權模式的情事，將由 本網站主張權利。
                </p>
              </li>
              <li>
                <p>
                  本網站將就社會公益及開放性進行綜合評估，來選擇發布資料時使用之授權模式，亦歡迎您透過
                  本網站
                  的聯繫方式，隨時將授權釋出政策有關的寶貴意見提供給我們。
                </p>
              </li>
            </ol>
          </li>
          <li>
            <h3>2. 貢獻內容之合法及適當狀態</h3>
            <ol>
              <li>
                <p>
                  您的資料貢獻不應侵害他人之智慧財產權利。如您貢獻內容，代表就您所知您表示，您有權授權管理者及本網站的使用者，依管理者指定、揀選的授權條款，來使用並散布這些內容。請注意管理者並不必然需要將您貢獻的內容包括於本網站上，並且得以在任何時候，將您的貢獻於本網站移除。對您貢獻的內容，管理者並無負擔保管責任。
                </p>
              </li>
            </ol>
          </li>
          <li>
            <h3>3. 授與權利</h3>
            <ol>
              <li>
                <p>
                  您在此授與管理者全球性、免授權金、非專屬、永久、不可撤回之著作權及其他司法管轄區域可能定義之鄰接權及資料庫權之權利，讓其能夠不受前述權利限制使用內容之任何內含物，無論是就原始載體，或採其他型態進行利用。所授與的權利明示包括商業性使用，並且不排除任何領域內的利用。此一授權包括並不限於，將作品進行後續再授權利用，並允許多階的被授權人皆得採再授權方式再作利用。就現行法及著作權契約可容許的最大範圍內，您對管理者或經其授權利用內容之人，亦拋棄或不主張任何著作人格權。除本處訂明之範圍，您所貢獻內容之所有權利、地位，及利益，仍保留在您。
                </p>
              </li>
            </ol>
          </li>
          <li>
            <h3>4. 免責聲明</h3>
            <ol>
              <li>
                <p>
                  在現行法容許的範圍內，您是以現狀及現有之基礎提供本內容，但應保證該內容無侵權之虞。除依法不得事先排除或限縮之責任外，您或管理者皆不應依此協議，為其他歸責理論導致任何損害賠償。
                </p>
              </li>
            </ol>
          </li>
          <li>
            <h3>5. 其他事項</h3>
            <ol>
              <li>
                <p>
                  您所提送之表單及因之所需之註冊、登入程序裡，產生或由您填註的個人資訊，您在此同意管理者後續蒐集、處理及利用該個人資料。本「條款」依據中華民國法律。當本協議任一條款被視為無效時不影響其他部份之有效性。
                </p>
              </li>
            </ol>
          </li>
          <li>
            <h3>6. 輔助條款</h3>
            <ol>
              <li>
                <p>
                  除採前述貢獻提供內容外，您亦可透過表格、附錄，補充「描述」欄位說明的方式，表達您指定特一款或多款公眾授權條款，或宣告模式為輔助授權條款之意向。此時該等貢獻內容，除依本條款第2條規定之方式授權本網站外，同時亦依指定條款雙重／多重授權予本網站。您所指定的輔助條款，並不拘束管理者，但在處理方式容許的前提下，管理者得尊重您的指定，除依管理者指定、揀選的授權條款外，同時一併採用輔助條款來散布該等貢獻內容。倘您於輔助條款裡列入「CC0
                  公眾領域貢獻宣告」，該宣告模式為著作權及相關權利的拋棄聲明，解釋上本網站得不受任何著作權利與相關權利之限制，自由使用該等貢獻內容，並亦得再採
                  CC0 宣告模式散布該等貢獻內容。
                </p>
              </li>
            </ol>
          </li>
          <li>
            <h3>7. 聯絡方式</h3>
            <ol>
              <li>
                <p>
                  如果您對於本使用者條款、著作權、資料庫處理爭議、服務內容或隱私等有任何疑慮，請寄信至本網站之聯絡信箱
                  contact@daoedu.tw，由本網站在固定會議中或透過其他管道為您處理。紛爭解決和管轄法院。依本使用者條款所產生之爭議，雙方合意以臺灣臺北地方法院為第一審管轄法院。
                </p>
              </li>
            </ol>
          </li>
        </ol>
      </PaperWrapper>
    </IPRWrapper>
  );
};

export default IPRTerms;
