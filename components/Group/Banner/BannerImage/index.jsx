import styled from '@emotion/styled';
import Box from '@mui/material/Box';

const BannerImageWrapper = styled.div`
  position: absolute;
  width: 100%;
  top: 0;
  height: 60vh;
`;

function BannerImage() {
  return (
    <BannerImageWrapper>
      <Box
        component="img"
        src="/assets/group-banner.png"
        sx={{
          objectFit: 'cover',
          width: '100%',
          height: 'inherit',
          backgroundImage: 'linear-gradient(#fcfefe 10%, #e0f1f2 40%)',
        }}
      />
    </BannerImageWrapper>
  );
}

export default BannerImage;
