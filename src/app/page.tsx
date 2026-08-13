import type { Metadata } from 'next';
import { GreenMonster } from '@/components/hub/GreenMonster';

export const metadata: Metadata = {
  title: 'LFIQ Hub',
  description:
    'The LFIQ portfolio on one wall. Brick, Back9, Left Field Corp, Onboarding and Tax.',
};

export default function HomePage() {
  return <GreenMonster />;
}
