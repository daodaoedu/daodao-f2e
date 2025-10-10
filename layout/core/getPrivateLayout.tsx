import { ProtectedComponent, ProtectedComponentProps } from '@/features/auth';
import getBaseLayout from './getBaseLayout';

export default function getPrivateLayout(
  page: React.ReactElement,
  options?: ProtectedComponentProps
) {
  return getBaseLayout(
    <ProtectedComponent {...options}>{page}</ProtectedComponent>
  );
}
