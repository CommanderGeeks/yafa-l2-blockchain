// File: pages/explorer/blocks/[number].tsx
import { useRouter } from 'next/router';
import BlockDetailsPage from '@/components/explorer/BlockDetailsPage';

export default function BlockDetails() {
  const router = useRouter();
  const { number } = router.query;

  return <BlockDetailsPage blockNumber={number as string} />;
}