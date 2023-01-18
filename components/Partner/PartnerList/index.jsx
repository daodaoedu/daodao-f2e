import React, { useRef } from 'react';
import styled from '@emotion/styled';
import { Box, Typography, Divider, Skeleton } from '@mui/material';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import PartnerCard from './PartnerCard';

const LIST = [
  {
    name: '許浪手',
    image:
      'https://images.unsplash.com/photo-1502680390469-be75c86b636f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8c3VyZnxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=800&q=60',
    subTitle: '實驗教育老師',
    canShare: '心智圖法',
    canTogether: '學習交流、教學相長',
    tags: ['實驗教育'],
    location: '台北市松山區',
  },
  {
    name: '許浪手2',
    image:
      'https://images.unsplash.com/photo-1502680390469-be75c86b636f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8c3VyZnxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=800&q=60',
    subTitle: '實驗教育老師',
    canShare: '心智圖法',
    canTogether: '學習交流、教學相長',
    tags: ['實驗教育'],
    location: '台北市松山區',
  },
  {
    name: '許浪手3',
    image:
      'https://images.unsplash.com/photo-1502680390469-be75c86b636f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8c3VyZnxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=800&q=60',
    subTitle: '實驗教育老師',
    canShare: '心智圖法',
    canTogether: '學習交流、教學相長',
    tags: ['實驗教育'],
    location: '台北市松山區',
  },
  {
    name: '許浪手4',
    image:
      'https://images.unsplash.com/photo-1502680390469-be75c86b636f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8c3VyZnxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=800&q=60',
    subTitle: '實驗教育老師',
    canShare: '心智圖法',
    canTogether: '學習交流、教學相長',
    tags: ['實驗教育'],
    location: '台北市松山區',
  },
];

const PartnerList = () => {
  return (
    <Box
      sx={{
        marginTop: '24px',
        borderRadius: '20px',
        boxShadow: '0px 4px 6px rgba(196, 194, 193, 0.2)',
      }}
    >
      <Box sx={{ minHeight: '100vh', padding: '5%' }}>
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          {LIST.map(({ name, image, subTitle, canShare, canTogether }) => (
            <PartnerCard
              key={name}
              image={image}
              name={name}
              subTitle={subTitle}
              canShare={canShare}
              canTogether={canTogether}
            />
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default PartnerList;
