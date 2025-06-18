import dynamic from 'next/dynamic';

// Dynamically import Bridge with no SSR
const Bridge = dynamic(
  () => import('./Bridge'),
  { 
    ssr: false,
    loading: () => (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-green-400 text-xl">Loading Bridge...</div>
      </div>
    )
  }
);

export default function BridgeWrapper() {
  return <Bridge />;
}