// File: pages/pool.tsx
import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function LegacyPool() {
  const router = useRouter();
  
  useEffect(() => {
    // Redirect legacy /pool route to /pools
    router.replace('/pools');
  }, [router]);

  return null;
}