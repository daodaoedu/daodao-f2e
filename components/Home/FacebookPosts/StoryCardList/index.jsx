import React from 'react';
import styled from '@emotion/styled';
import { Box, Skeleton } from '@mui/material';
import Marquee from 'react-fast-marquee';
import Card from './Card';

const CardListWrapper = styled.ul`
  display: flex;
  justify-content: flex-start;
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
const StoryCardList = ({ title, list, direction = 'left', isLoading }) => {
  if (isLoading) {
    return (
      <Box sx={{ marginTop: '20px' }}>
        <SubHeaderWrapper>{title}</SubHeaderWrapper>
        <CardListWrapper>
          <Skeleton
            variant="rectangular"
            sx={{
              margin: '5px',
              width: '150px',
              height: 'calc(calc(150px / 9) * 16)',
              flex: '0 0 150px',
            }}
          />
          <Skeleton
            variant="rectangular"
            sx={{
              margin: '5px',
              width: '150px',
              height: 'calc(calc(150px / 9) * 16)',
              flex: '0 0 150px',
            }}
          />
          <Skeleton
            variant="rectangular"
            sx={{
              margin: '5px',
              width: '150px',
              height: 'calc(calc(150px / 9) * 16)',
              flex: '0 0 150px',
            }}
          />
          <Skeleton
            variant="rectangular"
            sx={{
              margin: '5px',
              width: '150px',
              height: 'calc(calc(150px / 9) * 16)',
              flex: '0 0 150px',
            }}
          />
          <Skeleton
            variant="rectangular"
            sx={{
              margin: '5px',
              width: '150px',
              height: 'calc(calc(150px / 9) * 16)',
              flex: '0 0 150px',
            }}
          />
          <Skeleton
            variant="rectangular"
            sx={{
              margin: '5px',
              width: '150px',
              height: 'calc(calc(150px / 9) * 16)',
              flex: '0 0 150px',
            }}
          />
          <Skeleton
            variant="rectangular"
            sx={{
              margin: '5px',
              width: '150px',
              height: 'calc(calc(150px / 9) * 16)',
              flex: '0 0 150px',
            }}
          />
          <Skeleton
            variant="rectangular"
            sx={{
              margin: '5px',
              width: '150px',
              height: 'calc(calc(150px / 9) * 16)',
              flex: '0 0 150px',
            }}
          />
          <Skeleton
            variant="rectangular"
            sx={{
              margin: '5px',
              width: '150px',
              height: 'calc(calc(150px / 9) * 16)',
              flex: '0 0 150px',
            }}
          />
        </CardListWrapper>
      </Box>
    );
  }

  if (list.length === 0) {
    return <></>;
  }

  return (
    <Box sx={{ marginTop: '20px' }}>
      <SubHeaderWrapper>{title}</SubHeaderWrapper>
      {list.length > 4 ? (
        <Marquee
          gradientWidth={50}
          delay={3}
          pauseOnHover
          direction={direction}
        >
          <CardListWrapper>
            {list.map(
              ({
                id,
                caption,
                media_url,
                timestamp,
                permalink,
                like_count,
                media_type,
              }) => (
                <Card
                  key={id}
                  id={id}
                  type={media_type}
                  message={caption}
                  date={timestamp}
                  title={title}
                  media={media_url}
                  url={permalink}
                  likeCount={like_count}
                />
              ),
            )}
          </CardListWrapper>
        </Marquee>
      ) : (
        <CardListWrapper>
          {list.map(
            ({
              id,
              caption,
              media_url,
              timestamp,
              permalink,
              like_count,
              media_type,
            }) => (
              <Card
                key={id}
                id={id}
                type={media_type}
                message={caption}
                date={timestamp}
                title={title}
                media={media_url}
                url={permalink}
                likeCount={like_count}
              />
            ),
          )}
        </CardListWrapper>
      )}
    </Box>
  );
};

export default StoryCardList;
