import { css } from '@emotion/react';
import { TikTokShaking } from './animation';

export const TikTokFont = css`
  /* $white: #ffffff;
    $black: #010101;
    $blue: #69c9d0;
    $red: #ee1d52; */
  /* font-family: Heebo; */
  /* font-size: 60px; */
  /* color: $white; */
  letter-spacing: 6px;
  text-shadow: 4px 2px 0 #ee1d52, -4px -2px 0 #69c9d0;
  cursor: pointer;

  &:hover {
    animation: ${TikTokShaking} 0.2s ease-in infinite;
  }
`;
