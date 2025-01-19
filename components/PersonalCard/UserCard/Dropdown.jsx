import { useState } from 'react';
import styled from '@emotion/styled';
import { Box, Button, Menu, MenuItem } from '@mui/material';
import MoreVertRoundedIcon from '@mui/icons-material/MoreVertRounded';
import Icon from '@mui/material/Icon';

const StyledMenu = styled((props) => (
  <Menu
    elevation={0}
    anchorOrigin={{
      vertical: 'bottom',
      horizontal: 'left',
    }}
    transformOrigin={{
      vertical: 'top',
      horizontal: 'left',
    }}
    {...props}
  />
))(() => ({
  '& .MuiPaper-root': {
    borderRadius: 8,
    minWidth: 150,
    padding: '12px',
    boxShadow: '0px 4px 10px 0px rgba(196, 194, 193, 0.40)',
  },
  '& .MuiMenu-list': {
    padding: '0',
  },
  '& .MuiMenuItem-root': {
    padding: '8px',
  },
}));

export default function Dropdown({ sx }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <Box sx={{ ...sx }}>
      <Button
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        disableElevation
        onClick={handleClick}
        sx={{
          color: '#536166',
          padding: '5px',
          minWidth: 'unset',
          borderRadius: '100%',
        }}
      >
        <Icon color="#536166" component={MoreVertRoundedIcon} />
      </Button>
      <StyledMenu anchorEl={anchorEl} open={open} onClose={handleClose}>
        <MenuItem
          component="a"
          href="https://forms.gle/NkVbDWC3eXk4P4gv7"
          target="_blank"
          sx={{ minWidth: '146px' }}
          onClick={handleClose}
        >
          檢舉
        </MenuItem>
      </StyledMenu>
    </Box>
  );
}
