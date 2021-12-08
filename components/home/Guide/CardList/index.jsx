import styled from '@emotion/styled';
import { css } from "@emotion/react";

const CardListWrapper = styled.ul`
    display: flex;
    justify-content: space-between;
    align-items: center;
`;

const CardWrapper = styled.li`
  width: 350px;   
  height: 430px;
  padding-top: 15%;
  padding-left: 20px;
  .title {
    color: #F0F0F0;
    font-size: 36px;
    line-height: 45px;
    letter-spacing: 0.08em;
    font-weight: bold;
  }

  .desc {
    color: #F0F0F0;
    font-size: 17px;
    line-height: 45px;
    letter-spacing: 0.08em;
    font-weight: bold;

  }

  ${({ image }) => css`
    background-image: ${`url(${image})`};
    background-size: cover;
    background-repeat: no-repeat;
    background-position: 50% 50%;
    filter: brightness(50%);
    cursor: pointer;
    object-fit: cover;
    &:hover {
        transform: scale(1.05);
        transition: transform .4s;
    }
  `}
`;

const data = [{
  id: 0,
  title: '英語',
  image: '/assets/images/english.png',
}, {
  id: 1,
  title: '程式設計',
  image: '/assets/images/programming.png',
}, {
  id: 2,
  title: '數位工具',
  image: '/assets/images/digital.png',
}];

const CardList = () => {
  return (
    <CardListWrapper>
      {
        data.map(({ image, title }) => (
          <CardWrapper image={image}>
            <p className="title">{title}</p>
            <p className="desc">學習夥伴成長中</p>
          </CardWrapper>
        ))
    }
    </CardListWrapper>
  );
};

export default CardList;
