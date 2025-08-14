import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';

import { useAuth } from '@/contexts/Auth';
import { useUser } from '@/features/users';

const PersonalCard = dynamic(() => import('@/components/PersonalCard'), {
  ssr: false,
});

const PartnerDetailPage = () => {
  const router = useRouter();
  const { id: partnerId } = router.query;

  // get partner info
  const { data: partner } = useUser(partnerId);

  // fetch login user info
  const { user } = useAuth();

  return (
    <PersonalCard
      {...partner}
      isLoading={!partner}
      isMe={partner?.email === user?.email}
    />
  );
};

export default PartnerDetailPage;
