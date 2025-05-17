import { useMemo } from 'react';
import { RoleEnum, useAuth } from '@/contexts/Auth';

export default function useMarathonAccess() {
  const { user } = useAuth();
  const hasMarathonAccess = useMemo(() => {
    const permissions = [
      RoleEnum.MarathonApplicant,
      RoleEnum.MarathonParticipant,
      RoleEnum.Mentor,
      RoleEnum.Admin,
      RoleEnum.SuperAdmin,
    ];
    return user ? permissions.includes(user?.role) : false;
  }, [user]);

  return hasMarathonAccess;
}
