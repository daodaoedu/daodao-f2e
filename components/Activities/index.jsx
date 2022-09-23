import React from 'react';
import styled from '@emotion/styled';
// import { css } from "@emotion/react";
import { Box, Paper, Typography } from '@mui/material';

const ResourceWrapper = styled.section`
  padding-top: 40px;
  padding-bottom: 40px;
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

const ContributeResource = () => {
  return (
    <ResourceWrapper>
      <Paper
        sx={{
          width: '95%',
          margin: '0 auto',
          padding: '20px',
        }}
      >
        <Box>
          <Typography
            variant="h1"
            sx={{
              margin: '10px 0',
            }}
          >
            活動
          </Typography>
          <Typography
            sx={{
              margin: '20px 0',
            }}
          >
            你知道什麼活動，抑或是想主辦一個呢？ 歡迎來信至
            daodaoedunetwork@gmail.com 讓好的活動被更多人看見！
          </Typography>
          {/* eslint-disable-next-line jsx-a11y/iframe-has-title */}
          <iframe
            src="https://calendar.google.com/calendar/embed?src=9e60bdus3ht4umgkgvmqdrsjag%40group.calendar.google.com&ctz=Asia%2FTaipei"
            style={{
              border: 0,
              marginTop: '20px',
            }}
            width="100%"
            height="600"
            frameBorder="0"
            scrolling="no"
          />
        </Box>
      </Paper>
    </ResourceWrapper>
  );
};

export default ContributeResource;
