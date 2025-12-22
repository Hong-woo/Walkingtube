'use client';

import dynamic from 'next/dynamic';

const MapContainer = dynamic(() => import('@/components/map/MapContainer'), {
  ssr: false,
  loading: () => <div className="min-h-screen w-full bg-gray-50" />
});

export default function Home() {
  return (
    <main className="min-h-screen w-full bg-gray-50">
      <MapContainer />
    </main>
  );
}
