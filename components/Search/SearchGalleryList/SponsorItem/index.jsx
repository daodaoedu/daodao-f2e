import React, { useMemo } from 'react';
import styled from '@emotion/styled';
import { Typography, Box } from '@mui/material';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import { Whatshot } from '@mui/icons-material';
import Tags from './Tags';
import LogoImage from './LogoImage';
import Contributors from './Contributors';

dayjs.extend(isBetween);

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

  const ageOfUserTags = useMemo(
    () => data?.properties['年齡層']?.multi_select ?? [],
    [data],
  );

  const title = useMemo(
    () =>
      (data?.properties['資源名稱']?.title ?? []).find(
        (item) => item?.type === 'text',
      )?.plain_text,
    [data?.properties],
  );

  const contributors = useMemo(
    () => data?.properties['創建者']?.multi_select ?? [],
    [data?.properties],
  );

  // const link = useMemo(() => data?.properties["連結"]?.url ?? "", [data]);
  const link = useMemo(() => `/resource/${title}`, [title]);

  return (
    <ItemWrapper>
      <LogoImage link={link} data={data} />
      <ContentWrapper>
        <TitleWrapper>
          <a target="_blank" href={link} rel="noopener noreferrer">
            <h2 className="title">{`📌 ${title ?? '未命名'}`}</h2>
          </a>
          <Tags type="fee" tags={feeTags} />
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'flex-start',
              alignItems: 'center',
              margin: '0 5px',
            }}
          >
            <img
              src="/assets/animated-fire.gif"
              alt="animated-fire"
              width={30}
              height={30}
            />
            <Typography sx={{ marginLeft: '5px', fontWeight: 'bold' }}>
              合作夥伴
            </Typography>
          </Box>
        </TitleWrapper>
        <Tags
          type="tags"
          tags={[...resourcesTags, ...hashTags]}
          queryTags={queryTags}
        />
        <Tags type="ages" tags={ageOfUserTags} />
        {contributors.length > 0 && (
          <Contributors contributors={contributors} />
        )}
        <Box
          sx={{
            margin: '10px 0',
            display: 'flex',
            justifyContent: 'flex-start',
            alignItems: 'center',
          }}
        >
          <Whatshot sx={{ color: 'red' }} />
          <a
            href="https://www.facebook.com/daodao.edu/posts/461381185679750"
            target="_blank"
            rel="noreferrer"
          >
            <Typography
              sx={{
                color: 'black',
                fontWeight: 'bold',
                marginLeft: '10px',
                '&:hover': {
                  color: '#16b9b3',
                  transition: '0.4s',
                },
              }}
            >
              2022/03/12（六）23:59前 分享貼文，抽線上課程與折價券！！
            </Typography>
          </a>
        </Box>
      </ContentWrapper>
    </ItemWrapper>
  );
};

export default Item;
