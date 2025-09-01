'use client';

import { useEffect, useState } from 'react';
import CoinToss from '../../components/CoinToss';

export default function Page() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Render nothing (or a stable placeholder) on the server and initial client render
  if (!isClient) return null;

  return (
    <main className="max-w-2xl mx-auto p-6">
      <CoinToss />
    </main>
  );
}
