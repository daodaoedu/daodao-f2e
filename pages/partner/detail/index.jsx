import { useRouter } from 'next/router';

import PersonalCard from '@/components/PersonalCard';
import { useAuth } from '@/contexts/Auth';
import { useUser } from '@/features/users';

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
