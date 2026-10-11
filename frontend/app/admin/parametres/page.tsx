export default function AdminParamsPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-black text-white mb-2">PARAMÉTRES</h1>
      <p className="text-gray-500 text-sm mb-8">Configuration du systÉme</p>
      <div className="bg-[#16161a] border border-white/5 rounded-2xl p-6 max-w-lg space-y-4">
        <div className="flex items-center justify-between py-3 border-b border-white/5">
          <div><p className="text-white text-sm font-semibold">Mode maintenance</p><p className="text-gray-300 text-xs">DÉsactiver l&apos;accÉs public</p></div>
          <div className="w-10 h-6 rounded-full bg-[#333] relative"><div className="absolute top-1 left-1 w-4 h-4 rounded-full bg-[#1c2026]0" /></div>
        </div>
        <div className="flex items-center justify-between py-3">
          <div><p className="text-white text-sm font-semibold">Source de donnÉes</p><p className="text-gray-300 text-xs">Mode actuel: XLSX (Spreadsheet)</p></div>
          <span className="px-2.5 py-1 bg-[#eab308]/15 text-[#eab308] text-xs font-bold rounded-lg">XLSX</span>
        </div>
      </div>
    </div>
  );
}

