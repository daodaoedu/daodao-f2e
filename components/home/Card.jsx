import styled from '@emotion/styled';
import Link from 'next/link';

const CardWrapper = styled.li`
    border-radius: 10px;
    width: 260px;
    height: 320px;
    overflow: hidden;
    cursor: pointer;
`;

const ContentWrapper = styled.div`
    background-color: #16b9b3;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 260px;
    font-size: 36px;
    color: white;
`;

const FooterWrapper = styled.div`
    background-color: #ffffff;
    display: flex;
    align-items: center;
    height: 60px;
    padding-left: 20px;
    font-weight: 500;
`;

const Card = ({ title, link }) => {
  return (
    <Link href={link}>
      <CardWrapper>
        <ContentWrapper>
          {title}
        </ContentWrapper>
        <FooterWrapper>
          {title}
        </FooterWrapper>
      </CardWrapper>
    </Link>
  );
};

export default Card;
