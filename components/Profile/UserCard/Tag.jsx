import { Chip } from '@mui/material';

const Tag = ({ label }) => {
  return (
    <Chip
      label={label}
      value={label}
      sx={{
        margin: '5px',
        whiteSpace: 'nowrap',
        fontWeight: 400,
        fontSize: '14px',
        bgcolor: '#DEF5F5',
      }}
    />
  );
};

export default Tag;
