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
    title: "語言與文學",
    image: "/assets/images/english.png",
  },
  {
    id: 1,
    title: "資訊與工程",
    image: "/assets/images/programming.png",
  },
  {
    id: 2,
    title: "學習/教學工具",
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
        <Card
          key={id}
          id={id}
          image={image}
          title={title}
          desc="學習夥伴成長中"
        />
      ))}
    </CardListWrapper>
  );
};

export default CardList;
