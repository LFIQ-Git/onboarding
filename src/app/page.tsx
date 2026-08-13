import type { Metadata } from 'next';
import { GreenMonster } from '@/components/hub/GreenMonster';

export const metadata: Metadata = {
  title: 'LFIQ Hub',
  description:
    'Every LFIQ app on one wall. Brick, Back9, Left Field Corp, Tax and the onboarding manual.',
};

export default function HomePage() {
  return <GreenMonster />;
}
