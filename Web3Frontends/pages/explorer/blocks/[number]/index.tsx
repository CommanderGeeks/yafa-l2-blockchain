// In pages/explorer/blocks/[number]/index.tsx
import { useRouter } from 'next/router';

export default function BlockDetails() {
  const router = useRouter();
  const { number } = router.query; // Gets "12345" from URL /explorer/blocks/12345
  
  return <div>Block #{number}</div>;
}