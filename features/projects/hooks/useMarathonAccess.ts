import { useMemo } from 'react';
import { RoleEnum, useSession } from '@/features/auth';

export default function useMarathonAccess() {
  const { user } = useSession();
  const hasMarathonAccess = useMemo(() => {
    const permissions = [
      RoleEnum.MarathonApplicant,
      RoleEnum.MarathonParticipant,
      RoleEnum.Mentor,
      RoleEnum.Admin,
      RoleEnum.SuperAdmin,
    ];
    return user?.role ? permissions.includes(user?.role) : false;
  }, [user]);

  return hasMarathonAccess;
}
