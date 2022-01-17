import React, { useRef } from "react";
import styled from "@emotion/styled";
import Link from "next/link";

const TagWrapper = styled.li`
  margin: auto 5px;
  font-weight: 700;
  white-space: nowrap;
  a {
    color: #37b9eb;
    font-weight: bold;
    font-size: 16px;
  }

  a:hover {
    text-decoration: underline;
  }

  @media (max-width: 767px) {
    left: 70px;
    width: 85vw;
    overflow-x: visible;
    a {
      color: #007bbb;
      font-size: 14px;
    }
  }
`;

const Tag = ({ title }) => {
  const tagRef = useRef();
  //   console.log("tagRef", tagRef);
  return (
    <TagWrapper ref={tagRef}>
      <Link href={`/search?q=${title}`}>{`# ${title}`}</Link>
    </TagWrapper>
  );
};

export default Tag;
