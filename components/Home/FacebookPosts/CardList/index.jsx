import React from "react";
import styled from "@emotion/styled";
import Card from "./Card";
import { Box, Skeleton } from "@mui/material";
import Marquee from "react-fast-marquee";

const CardListWrapper = styled.ul`
  display: flex;
  justify-content: space-between;
  align-items: center;
  overflow-x: scroll;
  scroll-behavior: smooth;

`;

const SubHeaderWrapper = styled.h3`
  font-size: 20px;
  color: #536166;
  font-weight: bold;
  margin-bottom: 10px;
   @media (max-width: 767px) {
    display: flex;
    flex-direction: column;
  }
`;


const CardList = ({ title, list, direction = "left", isLoading }) => {
  if (isLoading) {
    return (
      <Box>
        <SubHeaderWrapper>{title}</SubHeaderWrapper>
        <CardListWrapper>
          <Skeleton
            variant="rectangular"
            width={200}
            height={120}
            sx={{ margin: "5px", flex: "0 0 200px", borderRadius: "20px" }}
          />
          <Skeleton
            variant="rectangular"
            width={200}
            height={120}
            sx={{ margin: "5px", flex: "0 0 200px", borderRadius: "20px" }}
          />
          <Skeleton
            variant="rectangular"
            width={200}
            height={120}
            sx={{ margin: "5px", flex: "0 0 200px", borderRadius: "20px" }}
          />
          <Skeleton
            variant="rectangular"
            width={200}
            height={120}
            sx={{ margin: "5px", flex: "0 0 200px", borderRadius: "20px" }}
          />
          <Skeleton
            variant="rectangular"
            width={200}
            height={120}
            sx={{ margin: "5px", flex: "0 0 200px", borderRadius: "20px" }}
          />
          <Skeleton
            variant="rectangular"
            width={200}
            height={120}
            sx={{ margin: "5px", flex: "0 0 200px", borderRadius: "20px" }}
          />
        </CardListWrapper>
      </Box>
    );
  }
    return (
      <Box>
        <SubHeaderWrapper>{title}</SubHeaderWrapper>
        <Marquee
          // gradient={false}
          gradientWidth={50}
          delay={3}
          pauseOnHover
          direction={direction}
        >
          <CardListWrapper>
            {list.map(({ id, message, created_time, updated_time }) => (
              <Card
                key={id}
                id={id}
                message={message}
                date={created_time ?? updated_time}
                title={title}
              />
            ))}
          </CardListWrapper>
        </Marquee>
      </Box>
    );
};

export default CardList;
