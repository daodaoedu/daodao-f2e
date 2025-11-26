import { useMemo } from 'react';
import { RoleEnum } from '@/services/users';
import { useAuth } from '@/entities/user';

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
    return user?.role ? permissions.includes(user?.role) : false;
  }, [user]);

  return hasMarathonAccess;
}
