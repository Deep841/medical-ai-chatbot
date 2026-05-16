export default function Navbar() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-navbar px-6 h-14 flex items-center">
      <div className="max-w-6xl mx-auto w-full flex items-center justify-between">

        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center text-sm"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
            🧠
          </div>
          <span className="text-[15px] font-bold text-white tracking-tight">MediBot</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/20">
            AI
          </span>
        </div>

        {/* Center status */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/8">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 glow-green" />
          <span className="text-[11px] text-slate-400 font-medium">RAG · GPT-4o mini · Pinecone</span>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-slate-500">🩺 Medical AI</span>
        </div>
      </div>
    </header>
  );
}
