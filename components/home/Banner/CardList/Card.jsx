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
    height: 260px;
    background-image: url(${(props) => props.image});
    background-repeat:no-repeat;
    background-size: 100% 100%;
`;

const FooterWrapper = styled.div`
    background-color: #ffffff;
    display: flex;
    align-items: center;
    height: 60px;
    padding-left: 20px;
    font-weight: 500;
`;

const Card = ({ title, link, image }) => {
  return (
    <Link href={link}>
      <CardWrapper>
        <ContentWrapper image={image} />
        <FooterWrapper>
          {title}
        </FooterWrapper>
      </CardWrapper>
    </Link>
  );
};

export default Card;
