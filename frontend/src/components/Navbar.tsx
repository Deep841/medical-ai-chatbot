export default function Navbar() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-6 pt-3">
      <div className="max-w-6xl mx-auto glass-navbar rounded-full px-7 py-3.5 flex items-center shadow-sm">
        <span className="text-[15px] font-bold text-slate-900 tracking-tight">🧠 MediBot</span>
        <nav className="absolute left-1/2 -translate-x-1/2">
          <span className="px-4 py-1.5 rounded-full text-[11px] font-semibold tracking-widest uppercase text-slate-900 bg-slate-900/8">
            MediBot
          </span>
        </nav>
        <div className="ml-auto">
          <span className="px-3 py-1.5 rounded-full text-[11px] font-semibold text-slate-500 bg-slate-100"
            style={{ boxShadow: 'inset 0 0 12px rgba(0,0,0,0.09), 0px 0px 1px rgba(0,0,0,0.2)' }}>
            🩺 Medical AI
          </span>
        </div>
      </div>
    </header>
  );
}
