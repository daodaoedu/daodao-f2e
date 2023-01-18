import React, { useRef } from 'react';
import styled from '@emotion/styled';
import { Box, Typography, Divider, Skeleton } from '@mui/material';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import { LazyLoadImage } from 'react-lazy-load-image-component';

const PartnerCard = ({ image, name, subTitle, canShare, canTogether }) => {
  return (
    <Box
      sx={{
        background: '#FFFFFF',
        flex: '0 0 calc(50% - 24px)',
        margin: '12px',
      }}
    >
      <Box>
        <Box>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'flex-start',
              alignItems: 'center',
            }}
          >
            <LazyLoadImage
              alt="login"
              src={image}
              height={50}
              width={50}
              effect="opacity"
              style={{
                borderRadius: '100%',
                background: 'rgba(240, 240, 240, .8)',
                objectFit: 'cover',
                objectPosition: 'center',
              }}
              placeholder={
                // eslint-disable-next-line react/jsx-wrap-multilines
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
              }
            />

            <Box
              sx={{
                marginLeft: '12px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'space-between',
                height: '100%',
              }}
            >
              <Typography
                sx={{ color: '#536166', fontSize: '16px', fontWeight: 500 }}
              >
                {name}
              </Typography>
              <Typography
                component="p"
                sx={{ color: '#92989A', fontWeight: 400, fontSize: '14px' }}
              >
                {subTitle}
              </Typography>
              {/* <Typography
                sx={{
                  display: 'flex',
                  justifyContent: 'flex-start',
                  alignItems: 'center',
                  marginTop: '12px',
                }}
              >
                <LocationOnOutlinedIcon sx={{ marginRight: '10px' }} />{' '}
                台北市松山區
              </Typography> */}
            </Box>
          </Box>
          {/* <Box sx={{ marginTop: '24px' }}>
              {tagList.map((tag) => (
                <Tag key={tag} label={tag} />
              ))}
            </Box> */}
        </Box>
        <Box sx={{ marginTop: '8px' }}>
          <Box>
            <Typography sx={{ color: '#293A3D', fontWeight: 500 }}>
              可分享
            </Typography>
            <Typography sx={{ marginLeft: '12px', color: '#536166' }}>
              {canShare}
            </Typography>
          </Box>
          <Box>
            <Typography sx={{ color: '#293A3D', fontWeight: 500 }}>
              想一起
            </Typography>
            <Typography sx={{ marginLeft: '12px', color: '#536166' }}>
              {canTogether}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default PartnerCard;
