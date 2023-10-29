import React from 'react';
import styled from '@emotion/styled';
import { Grid, Box, Typography, Skeleton } from '@mui/material';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import {
  WANT_TO_DO_WITH_PARTNER,
  CATEGORIES,
} from '../../../../constants/member';
import { mapToTable } from '../../../../utils/helper';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';

const WANT_TO_DO_WITH_PARTNER_TABLE = mapToTable(WANT_TO_DO_WITH_PARTNER);
const CATEGORIES_TABLE = mapToTable(CATEGORIES);

const CardWrapper = styled(Box)`
  display: flex;
  padding: 12px;
  background-color: #fff;
  justify-content: space-between;
  align-items: flex-start;
  width: 100%;
`;
const CardContent = styled(Box)`
  width: 100%;
`;
const ImageWrapper = styled(LazyLoadImage)`
  display: block;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: rgba(240, 240, 240, 0.8);
  object-fit: cover;
  object-position: center;
`;

const TypoCaption = styled(Typography)`
  color: #92989a;
  font-family: 'Noto Sans TC';
  font-size: 12px;
  font-style: normal;
  line-height: 1.4;
`;

const TagWrap = styled(Grid)`
  display: flex;
  align-items: center;
`;
const TagText = styled(Grid)`
  color: var(--black-white-gray, #536166);
  text-align: center;
  font-family: 'Noto Sans TC';
  font-size: 12px;
  font-style: normal;
  font-weight: 400;
  line-height: 140%;
  border-radius: 13px;
  padding: 3px 10px;
  display: flex;
  justify-content: center;
  background: var(--logologo-very-light, #def5f5);
`;

function PartnerCard({
  id,
  image,
  name,
  subTitle,
  tagList = [],
  canShare = [],
  canTogether = [],
}) {
  return (
    <CardWrapper>
      {/* TODO: href redirect */}
      <CardContent>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '8px',
          }}
        >
          {image ? (
            <ImageWrapper src={image} alt="avatar" effect="opacity" />
          ) : (
            <Skeleton
              sx={{
                height: '50px',
                width: '50px',
                background: 'rgba(240, 240, 240, .8)',
                marginTop: '4px',
              }}
              variant="circular"
              animation="wave"
            />
          )}
          <Box
            sx={{
              marginLeft: '12px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'space-between',
            }}
          >
            <Typography
              sx={{ color: 'grey', fontWeight: 500, fontSize: '16px' }}
            >
              {name}
            </Typography>
            <Typography
              sx={{ color: '#92989A', fontWeight: 400, fontSize: '14px' }}
            >
              {subTitle}
            </Typography>
          </Box>
        </Box>
        <Box sx={{ marginBottom: '20px' }}>
          <Box mb={'2px'}>
            <Typography sx={{ color: '#293A3D', fontWeight: 500 }}>
              可分享
            </Typography>
            <Typography mx="5px" sx={{ color: '#536166', fontWeight: 400 }}>
              |
            </Typography>
            <Typography sx={{ color: '#536166', fontWeight: 400 }}>
              心智圖法(課文資料整理/閱讀/筆記術/記憶術等)
            </Typography>
            {/* <Typography sx={{ marginLeft: '12px', color: '#536166' }}>
              {canShare
                .map((item) => WANT_TO_DO_WITH_PARTNER_TABLE[item] || '')
                .join(', ')}
            </Typography> */}
          </Box>
          <Box>
            <Typography sx={{ color: '#293A3D', fontWeight: 500 }}>
              想一起
            </Typography>
            <Typography mx="5px" sx={{ color: '#536166', fontWeight: 400 }}>
              |
            </Typography>
            <Typography sx={{ color: '#536166', fontWeight: 400 }}>
              學習交流、教學相長
            </Typography>
            {/* <Typography sx={{ marginLeft: '12px', color: '#536166' }}>
              {canTogether
                .map((item) => CATEGORIES_TABLE[item] || '')
                .join(', ')}
            </Typography> */}
          </Box>
        </Box>
        <TagWrap container gap={'8px'} mb={'12px'}>
          {/* <Tag key={tag} name={tag} /> */}
          {tagList.map((tag) => (
            <TagText item key={id + tag}>
              {tag}
            </TagText>
          ))}
        </TagWrap>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '12px',
          }}
        >
          <TypoCaption
            sx={{
              display: 'flex',
              justifyContent: 'flex-start',
              alignItems: 'center',
            }}
          >
            <LocationOnOutlinedIcon sx={{ marginRight: '10px' }} /> 台北市松山區
          </TypoCaption>
          <TypoCaption fontWeight={300}>兩天前更新</TypoCaption>
        </Box>
      </CardContent>
    </CardWrapper>
  );
}

export default PartnerCard;
