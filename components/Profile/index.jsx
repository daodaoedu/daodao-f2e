import React, { useMemo, useState, useLayoutEffect } from 'react';
import { useRouter } from 'next/router';
import { Box, Button } from '@mui/material';
import { useAuthState } from 'react-firebase-hooks/auth';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import { CATEGORIES, EDUCATION_STEP } from '../../constants/member';
import { mapToTable } from '../../utils/helper';
import UserCard from './UserCard';
import UserTabs from './UserTabs';
import SEOConfig from '../../shared/components/SEO';
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

const Profile = () => {
  const router = useRouter();
  const auth = getAuth();
  const [user, isLoadingUser] = useAuthState(auth);
  const [userName, setUserName] = useState('');
  const [description, setDescription] = useState('');
  const [photoURL, setPhotoURL] = useState('');
  const [location, setLocation] = useState('');
  const [wantToLearnList, setWantToLearnList] = useState([]);
  const [interestAreaList, setInterestAreaList] = useState([]);
  const [educationStep, setEducationStep] = useState('');
  const [isLoading, setIsLoading] = useState(isLoadingUser);
  const [open, setOpen] = useState(false);


  useLayoutEffect(() => {
    const db = getFirestore();
    if (!isLoadingUser && user?.uid) {
      const docRef = doc(db, 'user', user?.uid || '');
      getDoc(docRef).then((docSnap) => {
        const data = docSnap.data();
        console.log('data', data);
        setUserName(data?.userName || '');
        setPhotoURL(data?.photoURL || '');
        setDescription(data?.description || '');
        setWantToLearnList(data?.wantToLearnList || []);
        setInterestAreaList(data?.interestAreaList || []);
        setEducationStep(data?.educationStep || '');
        setLocation(data?.location || '');
        setIsLoading(false);
      });
    }
    console.log(description);
  }, [user, isLoadingUser]);

  const SEOData = useMemo(
    () => ({
      title: `${userName}的小島｜島島阿學`,
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

  const tagList = interestAreaList.map((item) => mapToTable(CATEGORIES)[item]);

  const educationStepLabel = (educationStep,EDUCATION_STEP)=> {
    let result;
    for (const step of EDUCATION_STEP) {
      if (step.value === educationStep) {
        result = step.label;
        break;
      }
    }
    return result;
  };
  
  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(0deg, #f3fcfc, #f3fcfc), #f7f8fa',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
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
        }}
      >
        <Button
          variant="text"
          sx={BottonBack}
          onClick={() => {
            router.push('/');
            // router.push('/partner');
          }}
        >
          <ChevronLeftIcon />
          返回
        </Button>
        <UserCard
          isLoading={isLoading}
          tagList={tagList}
          photoURL={photoURL}
          userName={userName}
          location={location}
          educationStepLabel={educationStepLabel}
        />
      </Box>
      <UserTabs
        isLoading={isLoading}
        description={description}
        wantToLearnList={wantToLearnList}
      />
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
