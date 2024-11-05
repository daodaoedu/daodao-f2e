import { useState, forwardRef, useId } from 'react';
import Link from 'next/link';
import styled from '@emotion/styled';
import {
  Dialog,
  DialogTitle,
  Box,
  Button,
  Slide,
  Typography,
  useMediaQuery,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import { getTrustWebsitesStorage } from '@/utils/storage';

const TransitionSlide = forwardRef((props, ref) => {
  return <Slide direction="up" ref={ref} {...props} />;
});

const StyledText = styled.p`
  a {
    color: #1a73e8;
  }
`;

export default function TextWithLinks({ children }) {
  const id = useId();
  const isMobileScreen = useMediaQuery('(max-width: 560px)');
  const [externalLink, setExternalLink] = useState(null);
  const [isTrust, setIsTrust] = useState(false);
  const titleId = `modal-title-${id}`;
  const descriptionId = `modal-description-${id}`;
  const urlRegex = /(https:\/\/[^\s]+)/g;
  const text = typeof children === 'string' ? children : '';

  const checkbox = (
    <Checkbox size="small" onClick={() => setIsTrust((pre) => !pre)} />
  );

  const handleClose = () => {
    setExternalLink(null);
    setIsTrust(false);
  };

  const handleGoToWebsite = () => {
    const trustWebsites = getTrustWebsitesStorage().get();
    const data = Array.isArray(trustWebsites) ? trustWebsites : [];

    if (isTrust && externalLink) data.push(externalLink.hostname);

    getTrustWebsitesStorage().set(data);
    handleClose();
  };

  const parts = text.split(urlRegex).map((part) => {
    if (!urlRegex.test(part)) return part;

    try {
      const link = new URL(part);
      const href = decodeURI(link.href);

      if (window.location.hostname === href.hostname) {
        return (
          <Link key={href} href={href} target="_blank">
            {href}
          </Link>
        );
      }

      const trustWebsites = getTrustWebsitesStorage().get();
      const data = Array.isArray(trustWebsites) ? trustWebsites : [];

      return (
        <a
          key={href}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => {
            if (data.includes(link.hostname)) return;
            e.preventDefault();
            setExternalLink(link);
          }}
        >
          {href}
        </a>
      );
    } catch {
      return part;
    }
  });

  return (
    <StyledText>
      {parts}

      <Dialog
        keepMounted
        scroll="body"
        fullScreen={isMobileScreen}
        open={!!externalLink}
        onClose={handleClose}
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        TransitionComponent={TransitionSlide}
        sx={{
          '.MuiPaper-root': {
            marginTop: isMobileScreen ? 'calc(100vh - 430px)' : undefined,
          },
        }}
        PaperProps={{
          sx: {
            p: '32px 24px',
            maxWidth: '400px',
            width: '100%',
            borderRadius: '16px',
          },
        }}
      >
        <DialogTitle
          id={titleId}
          sx={{
            p: 0,
            mb: '8px',
            color: '#536166',
            fontWeight: 700,
            fontSize: '22px',
            textAlign: 'center',
          }}
        >
          正在離開島島阿學
        </DialogTitle>
        {externalLink && (
          <>
            <div id={descriptionId}>
              <Typography component="p">這個連結將帶您前往以下網站</Typography>
              <Typography
                variant="caption"
                color="grey"
                sx={{ wordBreak: 'break-word' }}
              >
                {decodeURI(externalLink.href)}
              </Typography>
            </div>
            <div>
              <FormControlLabel
                control={checkbox}
                label={
                  <Typography variant="caption">{`從現在開始信任 ${externalLink.hostname} 連結`}</Typography>
                }
                checked={isTrust}
              />
            </div>
            <Box
              sx={{
                mt: '16px',
                display: 'flex',
                flexDirection: 'row-reverse',
                gap: '8px',
              }}
            >
              <Button
                LinkComponent={Link}
                sx={{
                  borderRadius: '20px',
                  color: '#ffff',
                  bgcolor: '#16B9B3',
                  boxShadow: '0 4px 10px #C4C2C166',
                }}
                size="large"
                variant="contained"
                fullWidth
                href={externalLink.href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleGoToWebsite}
              >
                前往網站
              </Button>
              <Button
                sx={{
                  borderRadius: '20px',
                  bgcolor: '#ffffff',
                  color: '#1f4645',
                  boxShadow: '0 4px 10px #C4C2C166',
                  '&:hover': {
                    bgcolor: '#dddddd',
                  },
                }}
                variant="contained"
                size="large"
                fullWidth
                onClick={handleClose}
              >
                返回
              </Button>
            </Box>
          </>
        )}
      </Dialog>
    </StyledText>
  );
}
