import { Box, Button } from '@mui/material';

export default function More({ hasMore, isLoading, onLoadMore }) {
  return (
    <Box
      sx={{ textAlign: 'center', paddingTop: '80px', paddingBottom: '100px' }}
    >
      {hasMore && (
        <Button
          variant="outlined"
          sx={{
            fontSize: '16px',
            color: '#536166',
            borderColor: '#16B9B3',
            borderRadius: '20px',
            padding: '6px 48px',
          }}
          disabled={isLoading}
          onClick={onLoadMore}
        >
          顯示更多
        </Button>
      )}
    </Box>
  );
}
