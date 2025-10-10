import dynamic from 'next/dynamic';

export * from './Styled';

export const ResultChart = dynamic(() => import('./ResultChart'), {
  ssr: false,
});
