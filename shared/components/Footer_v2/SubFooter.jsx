import React from "react";
import styled from "@emotion/styled";
import dayjs from "dayjs";

const SubFooterWrapper = styled.div`
  background-color: #536166;
  color: white;
  height: 50px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 16px;
  margin-top: auto;
  letter-spacing: 0.08em;
  margin-top: 20px;
`;

const SubFooter = () => {
  const year = dayjs().get("year");
  return (
    <SubFooterWrapper>
      Tomorrow will be fine. 島島阿學 © {year}.
    </SubFooterWrapper>
  );
};

export default SubFooter;
