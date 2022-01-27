import styled from "@emotion/styled";
import { css } from "@emotion/react";
import { slideInUp } from "../../../../../shared/styles/animation";

const CardWrapper = styled.li`
  position: relative;
  width: 30%;
  height: 430px;
  border-radius: 20px;
  opacity: 0;

  margin: 10px;

  cursor: pointer;
  object-fit: cover;
  &:hover {
    transform: scale(1.05);
    transition: transform 0.4s;
  }

  ${({ isShow }) =>
    isShow &&
    css`
      opacity: 1;
      animation: 1.5s ${slideInUp} forwards;
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

const ContentWrapper = styled.div`
  margin: auto;
  padding-top: 100px;
  width: 200px;
  height: 200px;
  .title {
    color: #f0f0f0;
    font-size: 36px;
    line-height: 45px;
    letter-spacing: 0.08em;
    font-weight: bold;
    text-align: left;
  }

  .desc {
    color: #f0f0f0;
    font-size: 20px;
    line-height: 45px;
    letter-spacing: 0.08em;
    font-weight: bold;
    text-align: left;
    margin-top: 20px;
  }
`;

const BackgroundWrapper = styled.div`
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  border-radius: 20px;
  z-index: -1;
  ${({ image }) => css`
    background-image: ${`url(${image})`};
    background-size: cover;
    background-repeat: no-repeat;
    background-position: 50% 50%;
    filter: brightness(50%);
  `}
`;

const Card = ({ id, image, title }) => {
  return (
    <CardWrapper
      key={id}
      isShow
      // isShow={isShow}
    >
      <BackgroundWrapper image={image} />
      <ContentWrapper>
        <p className="title">{title}</p>
        <p className="desc">學習夥伴成長中</p>
      </ContentWrapper>
    </CardWrapper>
  );
};

export default Card;
