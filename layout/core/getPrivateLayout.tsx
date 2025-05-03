import { ProtectedComponent, ProtectedComponentProps } from '@/contexts/Auth';
import getBaseLayout from './getBaseLayout';

export default function getPrivateLayout(
  page: React.ReactElement,
  options?: ProtectedComponentProps
) {
  return getBaseLayout(
    <ProtectedComponent {...options}>{page}</ProtectedComponent>
  );
}
