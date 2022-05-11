import { useRef, useEffect } from "react";
import styled from "@emotion/styled";
// import { css } from "@emotion/react";
// import { slideInUp } from "../../../../shared/styles/animation";
import Card from "./Card";
import { useSelector, useDispatch } from "react-redux";
import { getFacebookFansPagePost, getFacebookGroupPost } from '../../../../redux/actions/shared';
import { Box } from "@mui/material";
// import useIntersectionObserver from "../../../../hooks/useIntersectionObserver";

const CardListWrapper = styled.ul`
  display: flex;
  justify-content: space-between;
  align-items: center;
  overflow-x: scroll;
  scroll-behavior: smooth;

  @media (max-width: 767px) {
    display: flex;
    flex-direction: column;
  }
`;

const SubHeaderWrapper = styled.h3`
  font-size: 20px;
  color: #536166;
  font-weight: bold;
   @media (max-width: 767px) {
    display: flex;
    flex-direction: column;
  }
`;


const CardList = () => {
  const dispatch = useDispatch();
  const { groupPosts, fanpagesPosts } = useSelector((state) => state?.shared);
  // const [isShow, setIsShow] = useState(false);
  // useIntersectionObserver({
  //   onIntersect: () => setIsShow(true),
  //   target: trigger,
  // });

  useEffect(() => {
    dispatch(getFacebookFansPagePost(6));
    dispatch(getFacebookGroupPost(6));
  }, [dispatch]);

  return (
    <Box>
      <Box>
        <SubHeaderWrapper>粉絲專頁</SubHeaderWrapper>
        <CardListWrapper>
          {fanpagesPosts.map(({ id, message, created_time }) => (
            <Card
              key={id}
              id={id}
              message={message}
              date={created_time}
              title="粉絲專頁"
              link="https://www.facebook.com/daodao.edu"
            />
          ))}
        </CardListWrapper>
      </Box>
      <Box sx={{ marginTop: "20px" }}>
        <SubHeaderWrapper>學習社群</SubHeaderWrapper>
        <CardListWrapper>
          {groupPosts.map(({ id, message, created_time }) => (
            <Card
              key={id}
              id={id}
              message={message}
              date={created_time}
              title="學習社群"
              link="https://www.facebook.com/groups/2237666046370459"
            />
          ))}
        </CardListWrapper>
      </Box>
    </Box>
  );
};

export default CardList;
