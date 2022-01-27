import { useRef } from "react";
import styled from "@emotion/styled";
// import { css } from "@emotion/react";
// import { slideInUp } from "../../../../shared/styles/animation";
import Card from "./Card";
// import useIntersectionObserver from "../../../../hooks/useIntersectionObserver";

const CardListWrapper = styled.ul`
  display: flex;
  justify-content: space-between;
  align-items: center;

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
  // const [isShow, setIsShow] = useState(false);
  const trigger = useRef();

  // useIntersectionObserver({
  //   onIntersect: () => setIsShow(true),
  //   target: trigger,
  // });

  return (
    <CardListWrapper ref={trigger}>
      {data.map(({ image, title, id }) => (
        <Card key={id} id={id} image={image} title={title} />
      ))}
    </CardListWrapper>
  );
};

export default CardList;
