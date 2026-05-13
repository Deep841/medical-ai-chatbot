import { BookOpen, Zap } from 'lucide-react';

const SUGGESTIONS = [
  'What is Acromegaly?',
  'Symptoms of diabetes?',
  'What causes migraines?',
  'How is hypertension treated?',
  'What is appendicitis?',
];

const TECH = ['GPT-4o mini', 'Pinecone', 'LangChain', 'HuggingFace'];

interface SidebarProps {
  onSuggestion: (text: string) => void;
}

export default function Sidebar({ onSuggestion }: SidebarProps) {
  return (
    <aside className="glass p-5 flex flex-col gap-4 overflow-y-auto messages-scroll">
      {/* Bot identity */}
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-2xl bg-slate-100 flex items-center justify-center text-xl flex-shrink-0"
          style={{ boxShadow: 'inset 0 0 12px rgba(0,0,0,0.09), 0px 0px 1px rgba(0,0,0,0.2)' }}>
          🧠
        </div>
        <div>
          <p className="text-sm font-bold text-slate-900">MediBot</p>
          <p className="text-[11px] text-slate-400 mt-0.5">AI Medical Assistant</p>
        </div>
      </div>

      <div className="h-px bg-black/5" />

      {/* Knowledge base */}
      <div>
        <p className="text-[10px] font-bold tracking-widest uppercase text-slate-400 mb-2">Knowledge Base</p>
        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-black/[0.03] border border-black/5">
          <BookOpen className="w-4 h-4 text-slate-500 flex-shrink-0" />
          <span className="text-[12px] font-500 text-slate-600">Gale Encyclopedia of Medicine</span>
        </div>
      </div>

      <div className="h-px bg-black/5" />

      {/* Suggestions */}
      <div>
        <p className="text-[10px] font-bold tracking-widest uppercase text-slate-400 mb-2">Try Asking</p>
        <div className="flex flex-col gap-1.5">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => onSuggestion(s)}
              className="text-left px-3 py-2 rounded-xl text-[12px] font-medium text-slate-500 bg-black/[0.03] border border-black/5 hover:bg-black/[0.06] hover:text-slate-900 transition-all duration-150"
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="h-px bg-black/5" />

      {/* Tech stack */}
      <div>
        <p className="text-[10px] font-bold tracking-widest uppercase text-slate-400 mb-2 flex items-center gap-1">
          <Zap className="w-3 h-3" /> Powered By
        </p>
        <div className="flex flex-wrap gap-1.5">
          {TECH.map((t) => (
            <span key={t} className="px-2.5 py-1 rounded-full text-[10px] font-600 text-slate-500 bg-slate-100 border border-black/5">
              {t}
            </span>
          ))}
        </div>
      </div>
    </aside>
  );
}
