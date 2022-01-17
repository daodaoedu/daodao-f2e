import React from "react";
import { css } from "@emotion/react";
import styled from "@emotion/styled";
// import useSWR from "swr";
// import { useRouter } from "next/router";
// import Image from "next/image";
// import fetcher from "../../../../utils/fetcher";
// import { LOCAL } from "../../../constants/home";
import Item from "./item";

const TagsWrapper = styled.ul`
  display: flex;
  justify-content: flex-start;
  align-items: center;
  margin: auto 5px;
  float: left;
  white-space: nowrap;
  overflow-x: scroll;

  -ms-overflow-style: none; /* IE */
  scrollbar-width: none; /* Firefox */
  &::-webkit-scrollbar {
    display: none; /* Chrome, Safari, Edge and Opera */
  }
`;

const TrendingWrapper = styled.div`
  display: flex;
  justify-content: flex-start;
  margin-top: 10px;
  width: 100%;

  @media (max-width: 767px) {
    z-index: -1;
    position: absolute;
    margin-top: 40px;
    top: 50%;
    left: 5px;
    justify-content: flex-start;

    ${({ isPrivaBrowser }) =>
      isPrivaBrowser &&
      css`
        margin-top: 20px;
      `}
  }
`;

const Tags = () => {
  // const { locale } = useRouter();
  // const { data = {} } = useSWR(
  //   `/api/search/tags?country=${LOCAL[locale]}`,
  //   fetcher
  // );
  // eslint-disable-next-line no-unused-vars
  const data = {};
  const tags = [
    {
      title: "王力宏",
    },
    {
      title: "精算媽咪的家計簿",
    },
    {
      title: "你不知道的事",
    },
    {
      title: "Podcast 眾議院",
    },
    {
      title: "流浪記",
    },
    {
      title: "兔子妮妮原創童話",
    },
  ];
  // const tags = useMemo(
  //   () => (data?.result?.items ?? []).slice(0, isMobile ? 3 : 5),
  //   [data, isMobile]
  // );

  return (
    <TrendingWrapper>
      <TagsWrapper>
        {tags.map(({ title }) => (
          <Item key={`${title}`} title={title} />
        ))}
      </TagsWrapper>
    </TrendingWrapper>
  );
};

export default Tags;
