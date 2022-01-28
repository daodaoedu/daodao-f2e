import React, { useMemo } from "react";
import styled from "@emotion/styled";
import { css } from "@emotion/react";
// import Link from "next/link";
import Tags from "./Tags";

const ItemWrapper = styled.li`
  display: flex;
  padding-top: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid rgba(168, 168, 168, 0.3);
`;
const ContentWrapper = styled.div`
  width: calc(100% - 200px);
  padding: 0 10px;
  margin-left: 20px;
  @media (max-width: 767px) {
    width: calc(100% - 100px);
  }
`;

const ImageWrapper = styled.div`
  width: 200px;
  height: 200px;
  background-color: #f5f5f5;
  filter: drop-shadow(0px 1px 1px rgba(0, 0, 0, 0.25));
  ${({ image }) => css`
    background-image: ${`url(${image})`};
    background-size: cover;
    background-repeat: no-repeat;
    background-position: 50% 50%;
  `}
  border-radius: 20px;
  /* opacity: 0; */

  cursor: pointer;
  /* object-fit: cover; */
  &:hover {
    transform: scale(1.05);
    transition: transform 0.4s;
  }
  @media (max-width: 767px) {
    width: 100px;
    height: 100px;
  }
`;

const TitleWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  /* flex-direction: column; */
  justify-content: flex-start;
  align-items: center;
  .title {
    font-size: 24px;
    font-weight: 500;
    margin: 0 10px 0 0;
    &:hover {
      cursor: pointer;
      color: #37b9eb;
      transition: 0.5s;
    }
  }
  @media (max-width: 767px) {
    .title {
      text-overflow: ellipsis;
      width: 100%;
    }
  }
`;

const Item = ({ data, queryTags }) => {
  const hashTags = useMemo(
    () => data?.properties["標籤"]?.multi_select ?? [],
    [data]
  );
  const resourcesTags = useMemo(
    () => data?.properties["資源類型"]?.multi_select ?? [],
    [data]
  );
  const feeTags = useMemo(
    () =>
      data?.properties["費用"]?.select
        ? [data?.properties["費用"]?.select]
        : [],
    [data]
  );
  // const areaTags = useMemo(
  //   () =>
  //     data?.properties["地區"]?.multi_select
  //       ? data?.properties["地區"]?.multi_select
  //       : [],
  //   [data]
  // );
  const ageOfUserTags = useMemo(
    () => data?.properties["年齡層"]?.multi_select ?? [],
    [data]
  );

  // const link = useMemo(() => data?.properties["連結"]?.url ?? "", [data]);
  const link = useMemo(
    () => `/resource/${data?.properties["資源名稱"]?.title[0]?.plain_text}`,
    [data]
  );

  return (
    <ItemWrapper>
      <ImageWrapper
        onClick={() => window.open(link, "_blank")}
        image={data?.properties["縮圖"]?.files[0].name ?? "/preview.webp"}
      />
      <ContentWrapper>
        <TitleWrapper>
          <h2 className="title" onClick={() => window.open(link, "_blank")}>
            {data?.properties["資源名稱"]?.title[0]?.plain_text ?? ""}
          </h2>
          <Tags type="fee" tags={feeTags} />
          {/* <Tags tags={areaTags} queryTags={queryTags} /> */}
        </TitleWrapper>
        <Tags
          type="tags"
          tags={[...resourcesTags, ...hashTags]}
          queryTags={queryTags}
        />
        <Tags type="ages" tags={ageOfUserTags} />
      </ContentWrapper>
    </ItemWrapper>
  );
};

export default Item;
