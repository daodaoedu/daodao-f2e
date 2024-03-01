import { useState } from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/router';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import MoreVertOutlinedIcon from '@mui/icons-material/MoreVertOutlined';

export default function More({ groupId, userId }) {
  const router = useRouter();
  const [anchorEl, setAnchorEl] = useState(null);
  const me = useSelector((state) => state.user);
  const isMyGroup = userId === me?._id;

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return isMyGroup ? (
    <Button
      variant="outlined"
      sx={{ position: 'absolute', top: 0, right: 0, borderRadius: '20px' }}
      onClick={() => router.push(`/group/edit?id=${groupId}`)}
    >
      編輯
    </Button>
  ) : (
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
        <MenuItem sx={{ minWidth: '146px' }} onClick={handleClose}>
          檢舉
        </MenuItem>
      </Menu>
    </>
  );
}
