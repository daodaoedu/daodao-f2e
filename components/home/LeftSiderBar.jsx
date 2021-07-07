import styled from '@emotion/styled';

const SiderBarWrapper = styled.div`
    position: absolute;
    display: flex;
    flex-direction: column;
    width: 80px;
    height: 100vh;
    background-color: #16b9b3;
    top: 0;
    left: 0;
`;

const LeftSiderBar = () => {
  return (
    <SiderBarWrapper />
  );
};

export default LeftSiderBar;
