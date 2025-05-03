import { useState } from 'react';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import MoreVertOutlinedIcon from '@mui/icons-material/MoreVertOutlined';

interface MoreProps {
  projectId: string;
}
export default function More({ projectId }: MoreProps) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <div className="relative">
      <IconButton
        size="small"
        classes={{ root: 'block p-0 absolute top-0 right-0' }}
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
        disableScrollLock
      >
        <MenuItem
          component="a"
          href={`/manage/projects/detail?id=${projectId}`}
          target="_blank"
          sx={{ minWidth: '146px' }}
          onClick={handleClose}
        >
          計畫檔案
        </MenuItem>
      </Menu>
    </div>
  );
}
