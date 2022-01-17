import React from 'react';
import styled from '@emotion/styled';

const SubFooterWrapper = styled.div`
  background-color:#536166;
  color: white;
  height: 50px;
  /* position: sticky;
  bottom: 0; */
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 16px;
  margin-top: auto; 
  letter-spacing: 0.08em;
`;

const SubFooter = () => {
  return (
    <SubFooterWrapper>
      Tomorrow will be fine. 島島阿學 © 2021.
    </SubFooterWrapper>
  );
};

export default SubFooter;
