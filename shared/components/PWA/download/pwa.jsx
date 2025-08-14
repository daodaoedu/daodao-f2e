import { useCallback, useState } from 'react';

import {
  SquarePlus,
  X,
  Download,
  Share,
} from 'lucide-react';
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
        <Download />
      </IconButton>

      <BottomDrawer onClose={() => setDrawerOpen(false)} open={drawerOpen}>
        <Box sx={{ padding: '24px 32px 48px' }}>
          <IconButton
            onClick={() => setDrawerOpen(false)}
            sx={{
              position: 'absolute', right: 24, top: 16, zIndex: 100,
            }}
          >
            <X />
          </IconButton>

          <Typography
            sx={{ fontSize: 20, fontWeight: 700, marginBottom: '18px' }}
          >
            Install App
          </Typography>

          <Typography sx={{ alignItems: 'center', display: 'flex' }}>
            Tap&ensp;
            <Share style={{ color: '#007aff' }} />
            &ensp;then &quot; Add to Home Screen&ensp;
            <SquarePlus />
            &ensp;&quot;
          </Typography>
        </Box>
      </BottomDrawer>
    </>
  );
}
