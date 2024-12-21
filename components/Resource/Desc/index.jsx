import styled from '@emotion/styled';

const DescWrapper = styled.div`
  margin: 20px 0;
  h2 {
    font-size: 20px;
    font-weight: 500;
  }
  p {
    margin-top: 15px;
  }
`;

const Desc = ({ desc }) => {
  return (
    <DescWrapper>
      <h2>🎁 資源介紹</h2>
      <p>{desc}</p>
    </DescWrapper>
  );
};

export default Desc;
