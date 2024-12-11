import styled from '@emotion/styled';
import { Typography } from '@mui/material';
import { useRouter } from 'next/router';

const GuideWrapper = styled.div`
  width: 90%;
  margin: 0 auto;
  padding-top: 40px;
  padding-bottom: 40px;

  .guide-title {
    color: #536166;
    font-weight: bold;
    font-size: 40px;
    line-height: 50px;
    letter-spacing: 0.08em;
    margin-left: '20px';
  }

  @media (max-width: 767px) {
    padding-top: 40px;
    padding-bottom: 20px;
  }
`;

const About = () => {
  const router = useRouter();
  return (
    <GuideWrapper>
      <Typography
        variant="h2"
        sx={{
          color: '#536166',
          fontWeight: 'bold',
          fontSize: '26px',
          lineHeight: '50px',
          letterSpacing: '0.08em',
          textAlign: 'left',
          marginLeft: '20px',
        }}
      >
        計畫進行方式與內容
      </Typography>
    </GuideWrapper>
  );
};

export default About;
