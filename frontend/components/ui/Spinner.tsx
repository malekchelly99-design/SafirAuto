export default function Spinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const s = size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-10 h-10' : 'w-6 h-6';
  return (
    <div className={`${s} border-2 border-gray-400 dark:border-[#333] border-t-[#eab308] rounded-full animate-spin`} />
  );
}

export function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1a1d23] dark:bg-[#0a0a0b]">
      <div className="text-center">
        <div className="w-12 h-12 border-2 border-gray-300 dark:border-[#222] border-t-[#eab308] rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-300 dark:text-gray-500 text-sm tracking-widest uppercase">Chargement</p>
      </div>
    </div>
  );
}

