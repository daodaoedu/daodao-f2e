import { useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import { Box, Button } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
// import { CATEGORIES } from '@/constants/member';
// import { mapToTable } from '@/utils/helper';
import SEOConfig from '@/shared/components/SEO';
import UserCard from './UserCard';
import UserTabs from './UserTabs';
import ContactModal from './Contact';

const BottonBack = {
  color: '#536166',
  fontSize: '14px',
  position: 'absolute',
  left: '-10px',
  top: '-50px',
  boxShadow: 'unset',
  '&:hover': {
    color: '#16B9B3',
  },
  '@media (max-width: 767px)': {
    position: 'unset',
  },
};

const Profile = ({
  name,
  photoURL,
  tagList = [],
  educationStepLabel,
  location,
}) => {
  const router = useRouter();
  const [isLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const SEOData = useMemo(
    () => ({
      title: `${name}的小島｜島島阿學`,
      description:
        '「島島阿學」盼能透過建立多元的學習資源網絡，讓自主學習者能找到合適的成長方法，進一步成為自己想成為的人，從中培養共好精神。目前正積極打造「可共編的學習資源平台」。',
      keywords: '島島阿學',
      author: '島島阿學',
      copyright: '島島阿學',
      imgLink: 'https://www.daoedu.tw/preview.webp',
      link: `${process.env.HOSTNAME}${router?.asPath}`,
    }),
    [router?.asPath],
  );

  return (
    <Box
      sx={{
        background: 'linear-gradient(0deg, #f3fcfc, #f3fcfc), #f7f8fa',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        padding: '80px 30px',
        '@media (max-width: 767px)': {
          padding: '30px',
        },
      }}
    >
      <ContactModal
        open={open}
        // isLoadingSubmit={isLoadingSubmit}
        onClose={() => {
          setOpen(false);
          // router.push('/');
          // router.push('/partner');
        }}
        onOk={() => {
          setOpen(false);
          // router.push('/profile');
          // router.push('/profile/edit');
        }}
      />
      <SEOConfig data={SEOData} />
      <Box
        sx={{
          position: 'relative',
          mb: '10px',
        }}
      >
        <Button
          variant="text"
          sx={BottonBack}
          onClick={() => {
            router.push('/partner');
          }}
        >
          <ChevronLeftIcon />
          返回
        </Button>
        <UserCard
          isLoading={isLoading}
          educationStepLabel={educationStepLabel}
          tagList={tagList}
          photoURL={photoURL}
          userName={name}
          location={location}
        />
      </Box>

      <UserTabs isLoading={isLoading} description={[]} wantToLearnList={[]} />

      <Button
        sx={{
          width: '160px',
          borderRadius: '20px',
          ml: '4px',
          mt: '56px',
          color: '#ffff',
          bgcolor: '#16B9B3',
        }}
        variant="contained"
        onClick={() => setOpen(true)}
      >
        聯繫夥伴
      </Button>
    </Box>
  );
};

export default Profile;
