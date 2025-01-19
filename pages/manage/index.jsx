import { useEffect } from 'react';
import { Box } from '@mui/material';
import ManageLayout from "@/layout/ManageLayout";
import { useRouter } from 'next/router';

const Manage = () => {
  const router = useRouter();
  useEffect(() => {
    router.push({
      pathname: '/manage',
      query: {
        id: 'island'
      }
    });
  }, []);
  return (
    <>
      <Box sx={{
        flex: 1,
        maxWidth: '720px',
        minHeight: '50vh',
        marginTop: '26px'
      }}
      >
        我的小島
      </Box>
    </>
  );
};
Manage.getLayout = ManageLayout;
export default Manage;
