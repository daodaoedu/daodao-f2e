import styled from '@emotion/styled';

const SiderBarWrapper = styled.div`
    display: flex;
    flex-direction: column;
`;

const FieldWrapper = styled.div`
    display: flex;
    flex-direction: column;
    background-color: white;
    width: 300px;
    border-radius: 10px;
    padding: 20px;

    & > h3 {
      font-size: 14px;
      font-weight: 500;
    }

    & > div {
      margin-top: 10px;
    }

    & + & {
      margin-top: 20px;
    }
`;

const thanksList = [
  '臺灣實驗教育推動中心',
  '唐光華 老師',
  '丁志仁 老師',
  '曲智鑛 老師',
  'g0v零時小學校',
  '柯君翰',
  '高婷柔',
  '向恩霈',
  '詹喬智',
  '米苔目',
  '王玠堯',
  'Ael',
];

const SiderBar = () => {
  return (
    <SiderBarWrapper>
      <FieldWrapper>
        <h3>標籤</h3>
        <div>
          <p>123</p>
        </div>
      </FieldWrapper>
      <FieldWrapper>
        <h3>分類導覽</h3>
        <div>
          <p>下拉選單</p>
        </div>
      </FieldWrapper>
      <FieldWrapper>
        <h3>感謝名單</h3>
        <div>
          <p>「島島阿學－學習資源平台」是從一個人到一群人，並透過自學從無到有的過程。</p>
          <p>這一路上，感謝每一位曾經參與其中的夥伴，論是針對組織、平台給予建議，又或者協助新增資源，都讓我們由衷的感謝，島島阿學是在每一位橋樑互助共好下誕生的。</p>
          { thanksList.map((person) => <p key={person}>{person}</p>) }
        </div>
      </FieldWrapper>
    </SiderBarWrapper>
  );
};

export default SiderBar;
