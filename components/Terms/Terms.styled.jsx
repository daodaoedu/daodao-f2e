import styled from '@emotion/styled';
import { Paper } from '@mui/material';

export const TermsWrapper = styled.section`
  padding-top: 40px;
  padding-bottom: 40px;
`;

export const PaperWrapper = styled(Paper)`
  width: min(90%, 800px);
  margin: 0 auto;
  padding: 40px 20px;

  @media (max-width: 767px) {
    padding: 20px;
  }

  h2 {
    font-size: 24px;
    font-size: min(max(24px, 5vw), 24px);
    text-wrap: balance;
    margin: 0 auto 1em;
    color: #293a3d;
    text-align: center;
    font-weight: 500;
  }

  @media (max-width: 767px) {
    h2 {
      text-overflow: ellipsis;
      width: 100%;
    }
  }

  h3 {
    font-size: 18px;
    font-weight: 500;
    margin: 1.5em 0 1em 0;
    color: #293a3d;
  }

  p {
    font-size: 16px;
    margin: 0 0 1em 0;
    color: #536166;
    line-height: 150%;
  }

  a {
    color: #536166;
    color: #16b9b3;
    @media (hover: hover) {
      &:hover {
        text-decoration: underline;
      }
    }
  }
  ol {
    counter-reset: section;

    li {
      counter-increment: section;
      margin-bottom: 0.5em;
    }
  }

  .sublist {
    counter-reset: item;
    list-style-type: none;
    margin-left: 20px;

    li {
      counter-increment: item;
      list-style-type: none;
      display: flex;
      flex-direction: row;
      align-items: flex-start;
      justify-content: flex-start;
      line-height: 150%;

      &:before {
        content: counter(section) '.' counter(item) '.';
        font-weight: 400;
        display: inline-block;
        width: 2em;
        flex-shrink: 0;
      }

      p {
        display: inline-block;
        padding-left: 0.5em;
        margin-bottom: 0;
      }
    }
  }
`;
