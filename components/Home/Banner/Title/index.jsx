import React from "react";
import styled from "@emotion/styled";
import Typed from "react-typed";

const TitleWrapper = styled.div`
  min-height: 70px;
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
  @media (max-width: 768px) {
    min-height: 130px;
  }
`;

const Title = () => {
  return (
    <TitleWrapper>
      <h1>
        <Typed
          strings={["歡迎來到島島阿學！一起找找資源、分享資源吧！"]}
          typeSpeed={80}
        />
      </h1>
      <h2>
        <Typed
          strings={[
            "If you want to go fast go alone. If you what to go far go together.",
          ]}
          typeSpeed={80}
        />
      </h2>
    </TitleWrapper>
  );
};

export default Title;
