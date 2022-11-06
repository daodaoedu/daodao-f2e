import React from 'react';
import styled from '@emotion/styled';
import { Typography } from '@mui/material';
import Link from 'next/link';

const IntroListWrapper = styled.div`
  margin: 0 15px;

  /* h2 {
    margin-bottom: 10px;
  } */
  ul {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
  }
  li {
    cursor: pointer;
    margin: 8px auto 8px 0;
    text-align: left:
  }
`;

const IntroList = ({ title, list }) => {
  return (
    <IntroListWrapper>
      {/* <h2>{title}</h2> */}
      <ul>
        {list.map(({ name, link, target }) => (
          <li key={name}>
            {target === '_self' ? (
              <Link href={link} passHref>
                <Typography
                  sx={{
                    fontSize: '16px',
                  }}
                >
                  {name}
                </Typography>
              </Link>
            ) : (
              <a href={link} target="_blank" rel="noopener noreferrer">
                <Typography
                  sx={{
                    fontSize: '16px',
                  }}
                >
                  {name}
                </Typography>
              </a>
            )}
          </li>
        ))}
      </ul>
    </IntroListWrapper>
  );
};

export default IntroList;
