import { useRef, useState } from "react";
import styled from "@emotion/styled";
import { css } from "@emotion/react";
import { slideInUp } from "../../../../shared/styles/animation";
import useIntersectionObserver from "../../../../hooks/useIntersectionObserver";

const CardWrapper = styled.li`
  width: 30%;
  height: 430px;
  padding-top: 12%;
  padding-left: 20px;
  border-radius: 20px;
  opacity: 0;

  .title {
    color: #f0f0f0;
    font-size: 36px;
    line-height: 45px;
    letter-spacing: 0.08em;
    font-weight: bold;
  }

  .desc {
    color: #f0f0f0;
    font-size: 17px;
    line-height: 45px;
    letter-spacing: 0.08em;
    font-weight: bold;
  }

  ${({ isShow }) =>
    isShow &&
    css`
      opacity: 1;
      animation: 1.5s ${slideInUp} forwards;
    `}

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
      transition: transform 0.4s;
    }
  `}

  @media (max-width: 767px) {
    display: flex;
    flex-direction: column;
    justify-content: center;
    width: 100%;
    padding-top: 0;
    padding-left: 0;
    text-align: center;
  }
`;

const CardListWrapper = styled.ul`
  display: flex;
  justify-content: space-between;
  align-items: center;

  ${CardWrapper} {
    margin: 10px;
  }

  @media (max-width: 767px) {
    display: flex;
    flex-direction: column;
  }
`;

const data = [
  {
    id: 0,
    title: "英語",
    image: "/assets/images/english.png",
  },
  {
    id: 1,
    title: "程式設計",
    image: "/assets/images/programming.png",
  },
  {
    id: 2,
    title: "數位工具",
    image: "/assets/images/digital.png",
  },
];

const CardList = () => {
  const [isShow, setIsShow] = useState(false);
  const trigger = useRef();

  useIntersectionObserver({
    onIntersect: () => setIsShow(true),
    target: trigger,
  });

  return (
    <CardListWrapper ref={trigger}>
      {data.map(({ image, title, id }) => (
        <CardWrapper key={id} image={image} isShow={isShow}>
          <p className="title">{title}</p>
          <p className="desc">學習夥伴成長中</p>
        </CardWrapper>
      ))}
    </CardListWrapper>
  );
};

export default CardList;
