import { ProtectedComponent, ProtectedComponentProps } from '@/entities/user';
import getBaseLayout from './getBaseLayout';

export default function getPrivateLayout(
  page: React.ReactElement,
  options?: ProtectedComponentProps
) {
  return getBaseLayout(
    <ProtectedComponent {...options}>{page}</ProtectedComponent>
  );
}
