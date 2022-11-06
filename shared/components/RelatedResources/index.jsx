import React, { useEffect, useMemo, useState } from 'react';
import styled from '@emotion/styled';
import { css } from '@emotion/react';
import { useRouter } from 'next/router';
import { Button, Paper, Box, Stack, Typography, Skeleton } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import Marquee from 'react-fast-marquee';
import { loadRelatedResources } from '../../../redux/actions/resource';
import Card from './Card';

const RelatedResourcesWrapper = styled.div`
  margin: 20px 0;
  h2 {
    font-size: 20px;
    font-weight: 500;
  }
`;

const CardListWrapper = styled.ul`
  display: flex;
  justify-content: space-between;
  align-items: center;
  overflow-x: scroll;
  scroll-behavior: smooth;
  margin-top: 15px;
`;

const RelatedResources = ({ title, searchScheme }) => {
  const { relatedResources, isLoading } = useSelector(
    (state) => state?.resource,
  );
  const dispatch = useDispatch();
  const router = useRouter();

  useEffect(() => {
    if (router.isReady) {
      dispatch(loadRelatedResources(searchScheme));
    }
  }, [dispatch, router.isReady, searchScheme]);

  if (isLoading) {
    return (
      <RelatedResourcesWrapper>
        <h2>{title}</h2>
        <CardListWrapper>
          <Skeleton
            variant="rectangular"
            width={200}
            height={100}
            sx={{ borderRadius: '10px', margin: '5px', flex: '0 0 200px' }}
          />
          <Skeleton
            variant="rectangular"
            width={200}
            height={100}
            sx={{ borderRadius: '10px', margin: '5px', flex: '0 0 200px' }}
          />
          <Skeleton
            variant="rectangular"
            width={200}
            height={100}
            sx={{ borderRadius: '10px', margin: '5px', flex: '0 0 200px' }}
          />
          <Skeleton
            variant="rectangular"
            width={200}
            height={100}
            sx={{ borderRadius: '10px', margin: '5px', flex: '0 0 200px' }}
          />
          <Skeleton
            variant="rectangular"
            width={200}
            height={100}
            sx={{ borderRadius: '10px', margin: '5px', flex: '0 0 200px' }}
          />
          <Skeleton
            variant="rectangular"
            width={200}
            height={100}
            sx={{ borderRadius: '10px', margin: '5px', flex: '0 0 200px' }}
          />
        </CardListWrapper>
      </RelatedResourcesWrapper>
    );
  }
  return (
    <RelatedResourcesWrapper>
      <h2>{title}</h2>
      <Marquee gradientWidth={20} delay={1} pauseOnHover>
        <CardListWrapper>
          {relatedResources.map(({ created_time, properties }) => (
            <Card
              key={created_time}
              image={
                (Array.isArray(properties['縮圖']?.files) &&
                  properties['縮圖']?.files[0]?.name) ??
                'https://www.daoedu.tw/preview.webp'
              }
              title={(
                properties['資源名稱']?.title[0]?.plain_text ?? ''
              ).trim()}
              desc={(
                (properties['介紹']?.rich_text ?? []).find(
                  (item) => item?.type === 'text',
                )?.plain_text ?? ''
              ).slice(0, 40)}
            />
          ))}
        </CardListWrapper>
      </Marquee>
    </RelatedResourcesWrapper>
  );
};

export default RelatedResources;
