import React from 'react';
import styled from '@emotion/styled';
import { Typography, Stack } from '@mui/material';

const ContactUsWrapper = styled.address`
  margin: 20px 0;
`;

const LinkWrapper = styled.a`
  color: black;
  &:hover {
    opacity: 100%;
    transition: color 0.5s ease;
    color: #16b9b3;
  }
`;

const LineWrapper = styled(Typography)`
  margin: 5px 0;
`;

const ContactUs = () => (
  <ContactUsWrapper>
    <Typography
      variant="h2"
      sx={{
        margin: '40px 0 10px 0',
      }}
    >
      聯絡我們
    </Typography>
    <Stack
      sx={{
        margin: '20px',
      }}
    >
      <LineWrapper variant="p">
        <LinkWrapper
          target="_blank"
          href="https://www.facebook.com/daodao.edu"
          rel="noopener noreferrer"
        >
          🏝️ 島島阿學的 Facebook
        </LinkWrapper>
      </LineWrapper>
      <LineWrapper variant="p">
        <LinkWrapper
          target="_blank"
          href="https://www.instagram.com/daodao_edu/"
          rel="noopener noreferrer"
        >
          🏝️ 島島阿學的 Instagram
        </LinkWrapper>
      </LineWrapper>
      <LineWrapper variant="p">
        <LinkWrapper
          target="_blank"
          href="mailto:contact@daoedu.tw"
          rel="noopener noreferrer"
        >
          🏝️ 島島阿學的信箱 – contact@daoedu.tw
          <br />
        </LinkWrapper>
      </LineWrapper>
    </Stack>
  </ContactUsWrapper>
);

export default ContactUs;
