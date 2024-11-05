import { IoMdCloseCircleOutline } from 'react-icons/io';
import { Box, Typography } from '@mui/material';

const ErrorMessage = ({ errText }) => {
  return (
    errText && (
      <Box
        sx={{
          mt: '8px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          color: '#EF5364',
          bgcolor: '#FFEFF1',
          borderRadius: '4px',
          padding: '4px 8px',
          fontSize: '14px',
        }}
      >
        <IoMdCloseCircleOutline size={20} />
        <Typography as="p">{errText}</Typography>
      </Box>
    )
  );
};

export default ErrorMessage;
