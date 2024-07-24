import { useState } from 'react';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import MoreVertOutlinedIcon from '@mui/icons-material/MoreVertOutlined';

export default function More() {
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <IconButton
        size="small"
        sx={{ position: 'absolute', top: 0, right: 0 }}
        onClick={handleMenu}
      >
        <MoreVertOutlinedIcon />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        sx={{ mt: 4 }}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        keepMounted
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        <MenuItem
          component="a"
          href="https://forms.gle/NkVbDWC3eXk4P4gv7"
          target="_blank"
          sx={{ minWidth: '146px' }}
          onClick={handleClose}
        >
          檢舉
        </MenuItem>
      </Menu>
    </>
  );
}
