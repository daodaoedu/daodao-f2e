import { SwipeableDrawer } from '@mui/material';

export default function BottomDrawer({
  children,
  hideBackdrop = false,
  fullScreen = false,
  onClose,
  open,
}) {
  return (
    <SwipeableDrawer
      anchor="bottom"
      BackdropProps={{
        sx: {
          borderRadius: '20px',
          margin: 'calc(var(--vh, 1vh) * 6) auto',
          pointerEvents: hideBackdrop ? 'none' : null,
          width: 'var(--app-width)',

          '@media (max-width: 576px)': {
            borderRadius: 0,
            margin: 0,
            height: 'var(--app-height-mobile)',
            minWidth: 250,
            width: 'var(--app-width-mobile)',
          },
        },
      }}
      disableSwipeToOpen
      keepMounted
      onClose={onClose}
      open={open}
      onOpen={() => null}
      PaperProps={{
        sx: {
          borderRadius: '20px',
          height: fullScreen ? '100%' : null,
          position: 'absolute',

          '@media (max-width: 576px)': {
            borderRadius: fullScreen ? 0 : '18px 18px 0 0',
          },
        },
      }}
      sx={{
        borderRadius: '20px',
        overflow: 'hidden',
        position: 'fixed',
        margin: 'calc(var(--vh, 1vh) * 6) auto',
        width: 'var(--app-width)',
        zIndex: 1400,

        '@media (max-width: 576px)': {
          borderRadius: fullScreen ? 0 : '18px 18px 0 0',
          margin: 0,
          height: 'var(--app-height-mobile)',
          minWidth: 250,
          width: 'var(--app-width-mobile)',
        },
      }}
    >
      {children}
    </SwipeableDrawer>
  );
}
