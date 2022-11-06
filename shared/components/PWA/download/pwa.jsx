import { useCallback, useState } from 'react';

import AddBoxOutlinedIcon from '@mui/icons-material/AddBoxOutlined';
import CloseIcon from '@mui/icons-material/Close';
import DownloadIcon from '@mui/icons-material/Download';
import IosShareIcon from '@mui/icons-material/IosShare';
import { Box, IconButton, Typography } from '@mui/material';

import usePwaInstallPrompt from '../../../../hooks/usePwaInstallPrompt';
import BottomDrawer from './BottomDrawer';

export default function PwaPrompt() {
  const [type, handleOpenPrompt] = usePwaInstallPrompt();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const toDownload = useCallback(() => {
    if (type === 'event') handleOpenPrompt();
    else if (type === 'iOS') setDrawerOpen(true);
  }, [type]);

  if (type === null) return <></>;

  return (
    <>
      <IconButton onClick={toDownload}>
        <DownloadIcon />
      </IconButton>

      <BottomDrawer onClose={() => setDrawerOpen(false)} open={drawerOpen}>
        <Box sx={{ padding: '24px 32px 48px' }}>
          <IconButton
            onClick={() => setDrawerOpen(false)}
            sx={{ position: 'absolute', right: 24, top: 16, zIndex: 100 }}
          >
            <CloseIcon />
          </IconButton>

          <Typography
            sx={{ fontSize: 20, fontWeight: 700, marginBottom: '18px' }}
          >
            Install App
          </Typography>

          <Typography sx={{ alignItems: 'center', display: 'flex' }}>
            Tap&ensp;
            <IosShareIcon sx={{ color: '#007aff' }} />
            &ensp;then &quot; Add to Home Screen&ensp;
            <AddBoxOutlinedIcon />
            &ensp;&quot;
          </Typography>
        </Box>
      </BottomDrawer>
    </>
  );
}
