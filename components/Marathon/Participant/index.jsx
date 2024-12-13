import styled from "@emotion/styled";
import {
  Box,
  Typography
} from "@mui/material";
import Image from "@/shared/components/Image";
import PersonaImage1 from "@/public/assets/marathon-persona-1.png";
import PersonaImage2 from "@/public/assets/marathon-persona-2.png";
import PersonaImage3 from "@/public/assets/marathon-persona-3.png";
import PersonaImage4 from "@/public/assets/marathon-persona-4.png";

const StyledGroup = styled(Box)`
  width: 100%;
  max-width: 100%;
  display: grid;
  grid-template: 1fr 1fr / 1fr 1fr;
  gap: 20px;

  @media (max-width: 767px) {
    grid-template: 1fr / 1fr;
  }
`;

const StyledCard = styled(Box)`
  height: 300px;
  border-radius: 10px;
  padding: 25px 30px;
  text-align: center;
  
  img {
    display: block;
    margin: 0 auto;
    object-fit: cover;
    object-position: center;
  }
`;
const StyledImageContainer = styled(Box)`
  height: 160px;
`;

const StyledTitle = styled(Typography)`
  color: #293A3D;
  text-align: center;
  font-size: 18px;
  font-style: normal;
  font-weight: 700;
  line-height: 140%;
`;
export default function Participant() {
  return (
    <StyledGroup>
      <StyledCard sx={{
        backgroundColor: '#FFF'
      }}
      >
        <StyledImageContainer sx={{ marginBottom: '10px' }}>
          <Image
            alt="marathon-persona-1"
            src={PersonaImage1.src}
            width="200px"
            height="160px"
          />
        </StyledImageContainer>
        <StyledTitle>有模糊的職涯／生涯方向，<br />想開始做準備與鋪路</StyledTitle>
      </StyledCard>
      <StyledCard sx={{
        backgroundColor: '#DEEDF5'
      }}
      >
        <StyledImageContainer sx={{ marginBottom: '10px', }}>
          <Image
            alt="marathon-persona-2"
            src={PersonaImage2.src}
            width="200px"
            height="160px"
          />
        </StyledImageContainer>
        <StyledTitle>考試不適合我，<br />更想用個人經歷上大學</StyledTitle>
      </StyledCard>
      <StyledCard sx={{
        backgroundColor: '#DEF5E7'
      }}
      >
        <StyledImageContainer sx={{ marginBottom: '10px' }}>
          <Image
            alt="marathon-persona-3"
            src={PersonaImage3.src}
            width="200px"
            height="160px"
          />
        </StyledImageContainer>
        <StyledTitle>學校課程好無聊，希望可以用<br />自己的方式學有興趣的事情</StyledTitle>
      </StyledCard>
      <StyledCard sx={{
        backgroundColor: '#FFF'
      }}
      >
        <StyledImageContainer sx={{ marginBottom: '10px' }}>
          <Image
            alt="marathon-persona-4"
            src={PersonaImage4.src}
            width="200px"
            height="160px"
          />
        </StyledImageContainer>
        <StyledTitle>想自主學習，<br />有方向但不確定可以怎麼開始</StyledTitle>
      </StyledCard>
    </StyledGroup>
  );
}
