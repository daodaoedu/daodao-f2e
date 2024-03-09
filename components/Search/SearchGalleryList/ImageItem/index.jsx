/* eslint-disable react/jsx-wrap-multilines */
import React, { useMemo } from 'react';
import styled from '@emotion/styled';
import { css, keyframes } from '@emotion/react';
import {
  Typography,
  Box,
  ImageList,
  ImageListItem,
  ImageListItemBar,
  IconButton,
} from '@mui/material';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import { getResourceTitle } from '../../../../utils/date';
// import { TikTokFont } from '../../../../shared/styles/css';
dayjs.extend(isBetween);

function srcset(image, width, height, rows = 1, cols = 1) {
  return {
    src: `${image}?w=${width * cols}&h=${height * rows}&fit=crop&auto=format`,
    srcSet: `${image}?w=${width * cols}&h=${
      height * rows
    }&fit=crop&auto=format&dpr=2 2x`,
  };
}

const ItemWrapper = styled.li`
  display: flex;
  padding-top: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid rgba(168, 168, 168, 0.3);
`;

const ContentWrapper = styled.article`
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
  ${({ image }) => css`
    background-image: ${`url(${image})`};
    background-size: cover;
    background-repeat: no-repeat;
    background-position: 50% 50%;
  `}
  border-radius: 20px;
  /* object-fit: cover; */
  /* opacity: 0; */

  @media (max-width: 767px) {
    width: 100px;
    height: 100px;
  }
`;

const TitleWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
  align-items: center;
  .title {
    font-size: 24px;
    font-weight: 500;
    margin: 0 10px 0 0;
    color: black;
    &:hover {
      cursor: pointer;
      color: #16b9b3;
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

const Item = ({ data, margin }) => {
  const hashTags = useMemo(
    () => data?.properties['標籤']?.multi_select ?? [],
    [data],
  );
  const resourcesTags = useMemo(
    () => data?.properties['資源類型']?.multi_select ?? [],
    [data],
  );
  const feeTags = useMemo(
    () =>
      data?.properties['費用']?.select
        ? [data?.properties['費用']?.select]
        : [],
    [data],
  );

  const isNewResource = useMemo(() => {
    const today = dayjs();
    const createDay = dayjs(data?.created_time);
    const isRecent = dayjs(createDay).isBetween(
      today,
      dayjs(today).subtract(1, 'month'),
    );
    return isRecent;
  }, [data]);

  const ageOfUserTags = useMemo(
    () => data?.properties['年齡層']?.multi_select ?? [],
    [data],
  );

  const title = useMemo(
    () => getResourceTitle(data?.properties),
    [data?.properties],
  );

  const contributors = useMemo(
    () => data?.properties['創建者']?.multi_select ?? [],
    [data?.properties],
  );

  // const link = useMemo(() => data?.properties["連結"]?.url ?? "", [data]);
  const link = useMemo(() => `/resource/${title}`, [title]);

  return (
    <ImageListItem>
      <img
        // {...srcset(
        //   (Array.isArray(data?.properties["縮圖"]?.files) &&
        //     data.properties["縮圖"]?.files[0]?.name) ??
        //     "https://www.daoedu.tw/preview.webp",
        //   250,
        //   200,
        //   rows,
        //   cols
        // )}
        src={
          (Array.isArray(data?.properties['縮圖']?.files) &&
            data.properties['縮圖']?.files[0]?.name) ??
          'https://www.daoedu.tw/preview.webp'
        }
        alt={title}
        loading="lazy"
      />
      <ImageListItemBar
        sx={{
          background:
            'linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, ' +
            'rgba(0,0,0,0.3) 70%, rgba(0,0,0,0) 100%)',
        }}
        title={title}
        position="top"
        actionIcon={
          <IconButton sx={{ color: 'white' }} aria-label={`star ${title}`}>
            {/* <StarBorderIcon /> */}
          </IconButton>
        }
        actionPosition="left"
      />
    </ImageListItem>
  );
};

export default Item;
