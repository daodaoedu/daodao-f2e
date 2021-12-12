import React, { useCallback } from "react";
import styled from "@emotion/styled";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import SearchField from "../../../shared/components/SearchField";

const TopBox = styled(Box)`
  position: absolute;
  top: 40%;
  left: 50%;
  margin-right: -50%;
  transform: translate(-50%, -50%);
`;

const BottomBox = styled(Box)`
  position: absolute;
  left: 50%;
  bottom: 5%;
  margin-right: -50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

const BannerWrapper = styled.div`
  ${TopBox} {
    h1 {
      font-size: 24px;
      line-height: 28px;
      letter-spacing: 0.08em;
      color: #f0f0f0;
      font-weight: 500;
      text-align: center;
    }

    h2 {
      font-size: 16px;
      line-height: 22px;
      letter-spacing: 0.08em;
      text-align: center;
      margin-top: 10px;
      color: #f0f0f0;
      font-weight: 500;
    }
  }

  ${BottomBox} {
    h3 {
      line-height: 28px;
      letter-spacing: 0.08em;
      color: #f0f0f0;
      font-weight: 500;
      text-align: center;
      font-size: 36px;
      line-height: 22px;
      letter-spacing: 0.08em;
      text-align: center;
      margin: 20px;
    }
  }
`;

const Banner = ({ guideRef }) => {
  const smoothScroll = useCallback(() => {
    const top = guideRef?.current?.getBoundingClientRect()?.top ?? 0;
    window.scrollTo({
      top: top + window.pageYOffset,
      behavior: "smooth",
    });
  }, [guideRef]);

  return (
    <BannerWrapper>
      <TopBox>
        <h1>歡迎來到島島阿學！一起找找資源、共編資源吧～</h1>
        <h2>
          If you want to go fast go alone. If you what to go far go together.
        </h2>
        <SearchField />
      </TopBox>
      <BottomBox>
        <h3>還不知道學什麼嗎？別擔心。</h3>
        <Box sx={{ marginTop: "20px" }}>
          <Button variant="contained" onClick={smoothScroll}>
            看看大家都學什麼
          </Button>
        </Box>
      </BottomBox>
    </BannerWrapper>
  );
};

export default Banner;
