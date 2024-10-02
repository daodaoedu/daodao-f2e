import getShareApi from '@/utils/share';
import styled from '@emotion/styled';
import IconButton from '@mui/material/IconButton';
import {
  FaSquareFacebook,
  FaLine,
  FaLinkedin,
  FaSquareThreads,
  FaSquareXTwitter,
  FaShareFromSquare,
} from 'react-icons/fa6';

const StyledShareButtonGroup = styled.div`
  display: flex;
  gap: 0.25rem;
`;

export default function ShareButtonGroup({ title, text, url, hashtag }) {
  const {
    hasNativeShare,
    nativeShare,
    facebookShare,
    lineShare,
    linkedinShare,
    threadsShare,
    xShare,
  } = getShareApi({ title, text, url, hashtag });

  return (
    <StyledShareButtonGroup>
      <IconButton size="small" onClick={facebookShare}>
        <FaSquareFacebook fill="#1877F2" />
      </IconButton>
      <IconButton size="small" onClick={threadsShare}>
        <FaSquareThreads fill="#000" />
      </IconButton>
      <IconButton size="small" onClick={lineShare}>
        <FaLine size={16} fill="#00B900" />
      </IconButton>
      <IconButton size="small" onClick={linkedinShare}>
        <FaLinkedin fill="#0A66C2" />
      </IconButton>
      <IconButton size="small" onClick={xShare}>
        <FaSquareXTwitter fill="#000" />
      </IconButton>
      {hasNativeShare && (
        <IconButton size="small" onClick={nativeShare}>
          <FaShareFromSquare size={16} />
        </IconButton>
      )}
    </StyledShareButtonGroup>
  );
}
