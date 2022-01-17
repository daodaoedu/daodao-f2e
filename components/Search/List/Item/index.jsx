import React, { useMemo } from "react";
import styled from "@emotion/styled";
import { css } from "@emotion/react";
import { useRouter } from "next/router";
// import Link from "next/link";
import Tags from "./Tags";

const ItemWrapper = styled.li`
  display: flex;
  margin: 10px 0;
`;
const ContentWrapper = styled.div`
  width: calc(100% - 200px);
  padding: 0 10px;
  @media (max-width: 767px) {
    width: 100%;
  }
`;

const ImageWrapper = styled.div`
  width: 200px;
  height: 200px;
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

const Item = ({ data }) => {
  const hashTags = useMemo(
    () => data?.properties["標籤 / Hashtag"]?.multi_select,
    [data]
  );
  const resourcesTags = useMemo(
    () => data?.properties["資源類型"]?.multi_select,
    [data]
  );
  const feeTags = useMemo(() => [data?.properties["費用"]?.select], [data]);
  const areaTags = useMemo(() => [data?.properties["地區"]?.select], [data]);
  const ageOfUserTags = useMemo(
    () => data?.properties["年齡層 / Age of users"]?.multi_select,
    [data]
  );

  const link = useMemo(() => data?.properties["連結 / Link"]?.url, [data]);

  return (
    <ItemWrapper>
      <ImageWrapper
        onClick={() => window.open(link, "_blank")}
        image={
          data?.properties["縮圖 / Thumbnail"]?.files[0].name ?? "/preview.webp"
        }
      />
      <ContentWrapper>
        <TitleWrapper>
          <h2 className="title" onClick={() => window.open(link, "_blank")}>
            {data?.properties["資源名稱 / Name"]?.title[0]?.plain_text ?? ""}
          </h2>
          <Tags tags={feeTags} />
          <Tags tags={areaTags} />
        </TitleWrapper>
        <Tags tags={[...resourcesTags, ...hashTags]} />
        <Tags tags={ageOfUserTags} />
      </ContentWrapper>
    </ItemWrapper>
  );
};

export default Item;
