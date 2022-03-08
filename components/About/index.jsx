import React from "react";
import styled from "@emotion/styled";
import { Box, Paper, Typography, Stack, Avatar } from "@mui/material";
import Tooltip from "@mui/material/Tooltip";
import AboutUs from "./AboutUs";
import RealizeMore from "./RealizeMore";
import RelatedReport from "./RelatedReport";
import AboutTeam from "./AboutTeam";
import AwardInfo from "./AwardInfo";
import Thanks from "./Thanks";
import NeedYou from "./NeedYou";
import ContactUs from "./ContactUs";
import TechStack from "./TechStack";

const AboutWrapper = styled.section`
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

const PaperWrapper = styled(Paper)`
  width: 90%;
  margin: 0 auto;
  padding: 20px;
  @media (max-width: 767px) {
    padding: 10px;
  }
`;

const About = () => {
  return (
    <AboutWrapper>
      <PaperWrapper>
        <AboutUs />
        <RealizeMore />
        <RelatedReport />
        <AwardInfo />
        <Thanks />
        <AboutTeam />
        <TechStack />
        <NeedYou />
        <ContactUs />
      </PaperWrapper>
    </AboutWrapper>
  );
};

export default About;
