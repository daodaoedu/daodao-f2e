import { Metadata } from 'next';
import { ManagePageWidget } from '@/widgets/manage';

export const metadata: Metadata = {
  title: '我的小島｜島島阿學',
  description:
    '「島島阿學」盼能透過建立多元的學習資源網絡，讓自主學習者能找到合適的成長方法，進一步成為自己想成為的人，從中培養共好精神。目前正積極打造「可共編的學習資源平台」。',
};

export default function ManagePage() {
  return <ManagePageWidget />;
}
