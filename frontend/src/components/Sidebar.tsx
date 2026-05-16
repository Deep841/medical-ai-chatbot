import { BookOpen, Sparkles, MessageSquare } from 'lucide-react';

const SUGGESTIONS = [
  { icon: '🩺', text: 'What is Acromegaly?' },
  { icon: '🩸', text: 'Symptoms of diabetes?' },
  { icon: '🧠', text: 'What causes migraines?' },
  { icon: '❤️', text: 'How is hypertension treated?' },
  { icon: '🦠', text: 'What is appendicitis?' },
  { icon: '💊', text: 'Side effects of ibuprofen?' },
];

const TECH = [
  { label: 'GPT-4o mini', color: 'rgba(99,102,241,0.2)', text: '#a5b4fc' },
  { label: 'Pinecone',    color: 'rgba(16,185,129,0.2)', text: '#6ee7b7' },
  { label: 'LangChain',   color: 'rgba(245,158,11,0.2)', text: '#fcd34d' },
  { label: 'RAG',         color: 'rgba(239,68,68,0.2)',  text: '#fca5a5' },
];

interface SidebarProps { onSuggestion: (text: string) => void; }

export default function Sidebar({ onSuggestion }: SidebarProps) {
  return (
    <aside className="glass-sidebar p-4 flex flex-col gap-4 overflow-y-auto messages-scroll"
      style={{ height: 'calc(100vh - 104px)' }}>

      {/* Identity */}
      <div className="flex items-center gap-3 pb-3 border-b border-white/6">
        <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-lg flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 4px 15px rgba(99,102,241,0.3)' }}>
          🧠
        </div>
        <div>
          <p className="text-sm font-bold text-white">MediBot</p>
          <p className="text-[11px] text-slate-500 mt-0.5">AI Medical Assistant</p>
        </div>
      </div>

      {/* Knowledge base */}
      <div>
        <p className="text-[10px] font-semibold tracking-widest uppercase text-slate-600 mb-2 flex items-center gap-1.5">
          <BookOpen className="w-3 h-3" /> Knowledge Base
        </p>
        <div className="flex items-center gap-2.5 p-3 rounded-xl border border-white/6"
          style={{ background: 'rgba(255,255,255,0.03)' }}>
          <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center flex-shrink-0">
            <BookOpen className="w-4 h-4 text-indigo-400" />
          </div>
          <div>
            <p className="text-[12px] font-semibold text-slate-300">Gale Encyclopedia</p>
            <p className="text-[10px] text-slate-600">2,000+ pages · Medical reference</p>
          </div>
        </div>
      </div>

      {/* Suggestions */}
      <div className="flex-1">
        <p className="text-[10px] font-semibold tracking-widest uppercase text-slate-600 mb-2 flex items-center gap-1.5">
          <MessageSquare className="w-3 h-3" /> Try Asking
        </p>
        <div className="flex flex-col gap-1.5">
          {SUGGESTIONS.map((s) => (
            <button
              key={s.text}
              onClick={() => onSuggestion(s.text)}
              className="suggestion-chip text-left px-3 py-2 rounded-xl text-[12px] font-medium flex items-center gap-2"
            >
              <span className="text-sm flex-shrink-0">{s.icon}</span>
              <span>{s.text}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tech stack */}
      <div className="pt-3 border-t border-white/6">
        <p className="text-[10px] font-semibold tracking-widest uppercase text-slate-600 mb-2 flex items-center gap-1.5">
          <Sparkles className="w-3 h-3" /> Powered By
        </p>
        <div className="flex flex-wrap gap-1.5">
          {TECH.map((t) => (
            <span key={t.label}
              className="px-2.5 py-1 rounded-full text-[10px] font-semibold"
              style={{ background: t.color, color: t.text, border: `1px solid ${t.color}` }}>
              {t.label}
            </span>
          ))}
        </div>
      </div>
    </aside>
  );
}
