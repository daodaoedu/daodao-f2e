import React from "react";
import styled from "@emotion/styled";
// import { css } from "@emotion/react";
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

const PapperWrapper = styled(Paper)`
  width: 90%;
  margin: 0 auto;
  padding: 20px;
  @media (max-width: 767px) {
    padding: 10px;
  }
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

const ContributeResource = () => {
  return (
    <ResourceWrapper>
      <PapperWrapper>
        <AboutUs />
        <RealizeMore />
        <RelatedReport />
        <AwardInfo />
        <Thanks />
        <AboutTeam />
        <NeedYou />
        <ContactUs />
      </PapperWrapper>
    </ResourceWrapper>
  );
};

export default ContributeResource;
