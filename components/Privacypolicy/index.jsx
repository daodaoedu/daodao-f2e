import React from 'react';
import styled from '@emotion/styled';
import { Box, Paper, Typography, Stack, Avatar } from '@mui/material';

const PrivacypolicyWrapper = styled.section`
  padding-top: 40px;
  padding-bottom: 40px;
  .title {
    font-size: 24px;
    font-weight: 500;
    margin: 0 10px 0 0;
    color: black;
    &:hover {
      cursor: pointer;
      color: #37b9eb;
      transition: 0.5s;
    }
  }
  @media (max-width: 767px) {
    .title {
      text-overflow: ellipsis;
      width: 100%;
    }
  }
`;
const LinkWrapper = styled.a`
  color: black;
  &:hover {
    opacity: 100%;
    transition: color 0.5s ease;
    color: #16b9b3;
  }
`;

const LineWrapper = styled(Typography)`
  margin: 5px 0;
`;

const PaperWrapper = styled(Paper)`
  width: 90%;
  margin: 0 auto;
  padding: 20px;
  @media (max-width: 767px) {
    padding: 10px;
  }
`;

const Privacypolicy = () => {
  return (
    <PrivacypolicyWrapper>
      <PaperWrapper>
        <h2 className="title">島島阿學資源共享自主學習網站隱私權政策</h2>
        <p>
          島島阿學的使命是透過促進自主學習來實現終身學習的能力，讓學習者可以交流真實的學習經驗，發掘和分享有價值的學習資源，並與志趣相投的人們建立聯繫。我們的隱私權政策適用於我們服務的任何註冊使用者或訪客。
          我們的註冊使用者（「會員」）分享他們的學習經驗、學習資源並與其他會員進行學習交流活動，展現個人技能、經歷與成長，發佈和查看相關內容，並尋找可能的共同成長及合作機會。非會員（「訪客」）可以查看我們某些服務的內容和資料。
          此隱私權政策存在於您及本網站管理機關島島阿學資源共享自主學習網站（https://www.daoedu.tw，以下簡稱「本網站」）（「管理者」）間。請閱讀以下條款及條件並確認，當您上傳內容至本網站時，即表示您接受本協議內容。
        </p>
        <ol>
          <li>
            <h3>1. 個人資料</h3>
            <ol>
              <li>
                <p>
                  網站會員登入後，島島阿學學習社群網站會取得會員在
                  Google上的：電子郵件地址與應用程式使用者
                  ID，用以分辨不同帳號以及聯繫會員。顯示名稱與頭像等公開顯示資訊，作為島島阿學學習社群網站的預設頭像與顯示名稱。
                </p>
              </li>
              <li>
                <p>
                  網站會員登入後的新增之資源、找夥伴與找揪團公開資料、回應內容、使用本平台之頻率等之公開訊息，將可能為島島阿學團隊用於數據分析，當進行量化或去識別化等過程與原身分識別勾脫後，會留存於開放資料隱去名稱之研究或統計。
                </p>
              </li>
              <li>
                <p>
                  本網站會嚴格保護會員之隱私及個人資料，除充分量化或去識別化後得不再視為個人資料者外，將不基於任何目的使其外流至與本服務無關之第三方。
                </p>
              </li>
              <li>
                <p>
                  網站會員可在個人頁面逕行變更自己在島島阿學網站的預設頭像與顯示名稱，使其不再與
                  Facebook、Twitter、Github 或 Google
                  上的公開資訊相同。另外，會員亦可寄信至 本網站連絡信箱（
                  contact@daoedu.tw ），請求刪除或更換取自
                  Google、Facebook、Github 或 Google
                  等平台的公開顯示資訊或電子郵件地址。
                </p>
              </li>
              <li>
                <p>
                  本網站會在確認收到請求後的最遲三十天內，比對驗證寄件者電子郵件地址無誤，足證申請者為原個人資料當事人之後進行刪除或更換處理。
                </p>
              </li>
              <li>
                <p>
                  當您註冊帳戶時，我們可能會要求您提供相關資訊，例如您的教育背景、工作經驗、技能、照片、城市或地區。您無需在個人資料中提供其他資訊；但是，個人資料資訊可幫助我們提供給您更多服務。您可以選擇是否在您的個人資料中包含敏感資訊並公開該敏感資訊。請勿在您的個人資料中發布或新增您不希望公開的個人資料。
                </p>
              </li>
            </ol>
          </li>
          <li>
            <h3>2. 來自第三方網站的嵌入內容</h3>
            <ol>
              <li>
                <p>
                  這個網站上的文章可能會嵌入視訊、圖片、文章等內容，而來自第三方網站的嵌入內容，其隱私權處理方式與使用者造訪這些網站時的規定完全相同。無論使用者是否有這些第三方網站的帳號或是否登入網站，他們都會以各種方式收集與使用者相關的資料，如
                  Cookie、嵌入第三方追蹤程式碼、監視使用者與嵌入內容的互動等。
                </p>
              </li>
            </ol>
          </li>
          <li>
            <h3>3. 使用者資料分析</h3>
            <ol>
              <li>
                <p>
                  這個網站的個人資料分享對象，如果你提出密碼重設要求，你目前進行連線的
                  IP 位址會顯示於密碼重設電子郵件中。
                </p>
              </li>
            </ol>
          </li>
          <li>
            <h3>4. 這個網站的個人資料保留期限</h3>
            <ol>
              <li>
                <p>
                  當使用者在這個網站發佈留言後，該則留言及其中繼資料將會無限期保留。這樣系統便可以自動辨識及核准任何後續留言，而不須將其保留在待審核的佇列中。
                </p>
              </li>
              <li>
                <p>
                  針對在這個網站上註冊的使用者，這個網站還會儲存他們在使用者「個人資料」頁面中提供的個人資訊。全部使用者都可以隨時查看、編輯或刪除自己的個人資訊（無法變更的使用者名稱除外）。請注意，網站管理員也可以查看及編輯這些個人資訊。
                </p>
              </li>
            </ol>
          </li>
          <li>
            <h3>5. 使用者對個人資料擁有哪些權利</h3>
            <ol>
              <li>
                <p>
                  如果使用者在這個網站擁有帳戶或曾發佈留言，便可以要求下載使用者在這個網站上的個人資料的資料匯出檔，這個檔案包含使用者提供給這個網站的全部個人資料。
                </p>
              </li>
              <li>
                <p>
                  使用者也可以要求清除曾提供給這個網站的全部個人資料，但這項要求不包含站方為了管理、法律或安全目的而必須保留的相關資料。
                </p>
              </li>
            </ol>
          </li>
        </ol>
      </PaperWrapper>
    </PrivacypolicyWrapper>
  );
};

export default Privacypolicy;
