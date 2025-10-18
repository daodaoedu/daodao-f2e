import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';

import { useSession } from '@/features/auth';
import { useGetApiV1UsersId } from '@/generated/endpoints/users';
import { parseToString } from '@/shared/lib/helper';

const PersonalCard = dynamic(() => import('@/components/PersonalCard'), {
  ssr: false,
});

const PartnerDetailPage = () => {
  const router = useRouter();
  const partnerId = parseToString(router.query?.id);

  // get partner info
  const { data } = useGetApiV1UsersId(partnerId);
  const partner = data?.data;

  // fetch login user info
  const { user } = useSession();

  return (
    <PersonalCard
      {...partner}
      isLoading={!partner}
      isMe={partner?.email === user?.email}
    />
  );
};

export default PartnerDetailPage;
