import { useDispatch, useSelector } from 'react-redux';
import { Box, Button } from '@mui/material';
import { setPageSize } from '@/redux/actions/group';

export default function More() {
  const dispatch = useDispatch();
  const { pageSize, total, isLoading } = useSelector((state) => state.group);
  const isMore = total > pageSize || isLoading;

  return (
    <Box
      sx={{ textAlign: 'center', paddingTop: '80px', paddingBottom: '100px' }}
    >
      {isMore && (
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
          onClick={() => dispatch(setPageSize(pageSize + 12))}
        >
          顯示更多
        </Button>
      )}
    </Box>
  );
}
