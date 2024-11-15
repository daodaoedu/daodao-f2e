import { useState, forwardRef, useId, useImperativeHandle } from 'react';
import Link from 'next/link';
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

function InternalCheckLink(props, ref) {
  const id = useId();
  const isMobileScreen = useMediaQuery('(max-width: 560px)');
  const [link, setLink] = useState(null);
  const [isTrust, setIsTrust] = useState(false);
  const titleId = `modal-title-${id}`;
  const descriptionId = `modal-description-${id}`;

  const handleClose = () => {
    setLink(null);
    setIsTrust(false);
  };

  const handleGoToWebsite = () => {
    const trustWebsites = getTrustWebsitesStorage().get();
    const data = Array.isArray(trustWebsites) ? trustWebsites : [];

    if (isTrust && link) {
      data.push(link.hostname);
    }

    getTrustWebsitesStorage().set(data);
    handleClose();
  };

  useImperativeHandle(
    ref,
    () => ({
      check: (href) => {
        try {
          const trustWebsites = getTrustWebsitesStorage().get();
          const data = Array.isArray(trustWebsites) ? trustWebsites : [];
          const newLink = new URL(href);

          if (data.includes(newLink.hostname)) {
            window.open(newLink.href, '_blank');
            return;
          }
          setLink(newLink);
        } catch {
          window.open(href, '_blank');
        }
      }
    }),
    []
  );

  return (
    <Dialog
      keepMounted
      scroll="body"
      fullScreen={isMobileScreen}
      open={!!link}
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
      {link && (
        <>
          <div id={descriptionId}>
            <Typography component="p">這個連結將帶您前往以下網站</Typography>
            <Typography
              variant="caption"
              color="grey"
              sx={{ wordBreak: 'break-word' }}
            >
              {decodeURI(link.href)}
            </Typography>
          </div>
          <div>
            <FormControlLabel
              control={<Checkbox size="small" onClick={() => setIsTrust((pre) => !pre)} />}
              label={
                <Typography variant="caption">{`從現在開始信任 ${link.hostname} 連結`}</Typography>
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
              href={link.href}
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
  );
}

const CheckLink = forwardRef(InternalCheckLink);

export default CheckLink;
