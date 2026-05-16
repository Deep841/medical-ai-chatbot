import { useState, useEffect, useRef } from 'react';
import { Send, Trash2 } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';
import type { Message, ApiResponse } from '../types';

const STORAGE_KEY = 'medibot_history';
const MAX_CHARS   = 500;

// Stable session ID per browser tab
const SESSION_ID = Math.random().toString(36).slice(2);

function getTime() {
  const d = new Date();
  return `${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`;
}
function makeId() { return Math.random().toString(36).slice(2); }

const WELCOME: Message = {
  id: 'welcome', role: 'bot', time: getTime(),
  text: "Hello! I'm MediBot, your AI medical information assistant. Ask me about symptoms, conditions, or treatments — sourced from the Gale Encyclopedia of Medicine.",
};

interface Props { pendingInput: string; onPendingConsumed: () => void; }

export default function ChatWindow({ pendingInput, onPendingConsumed }: Props) {
  const [messages, setMessages] = useState<Message[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [WELCOME];
    } catch { return [WELCOME]; }
  });
  const [input,   setInput]   = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(messages)); }, [messages]);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, loading]);
  useEffect(() => {
    if (pendingInput) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setInput(pendingInput);
      onPendingConsumed();
    }
  }, [pendingInput, onPendingConsumed]);

  async function send(text: string) {
    if (!text.trim() || loading) return;
    setMessages(prev => [...prev, { id: makeId(), role: 'user', text: text.trim(), time: getTime() }]);
    setInput('');
    setLoading(true);

    try {
      const body = new URLSearchParams({ msg: text.trim(), session_id: SESSION_ID });
      const res  = await fetch('/api/get', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString(),
      });
      const data: ApiResponse = await res.json();

      if (!res.ok || data.error) {
        setMessages(prev => [...prev, { id: makeId(), role: 'bot', text: data.error ?? 'Something went wrong.', time: getTime(), error: true }]);
      } else {
        setMessages(prev => [...prev, {
          id: makeId(), role: 'bot', time: getTime(),
          text: data.answer!, sources: data.sources, snippets: data.snippets,
        }]);
      }
    } catch {
      setMessages(prev => [...prev, { id: makeId(), role: 'bot', text: 'Network error. Please try again.', time: getTime(), error: true }]);
    } finally {
      setLoading(false);
    }
  }

  function handleFeedback(id: string, rating: 'up' | 'down') {
    setMessages(prev => prev.map(m => m.id === id ? { ...m, feedback: rating } : m));
    const msg = messages.find(m => m.id === id);
    fetch('/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rating, msg: msg?.text?.slice(0, 100) }),
    }).catch(() => {});
  }

  function clearChat() {
    setMessages([{ ...WELCOME, id: 'welcome', time: getTime() }]);
    localStorage.removeItem(STORAGE_KEY);
  }

  return (
    <section className="glass flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-black/6 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <span className="w-2 h-2 rounded-full bg-green-400 shadow-[0_0_6px_rgba(74,222,128,0.6)]" />
          <div>
            <p className="text-sm font-bold text-slate-900">Medical Assistant</p>
            <p className="text-[11px] text-slate-400">Multi-turn · Source citations · {messages.filter(m => m.role === 'user').length} questions asked</p>
          </div>
        </div>
        <button onClick={clearChat} className="btn-glass flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12px]">
          <Trash2 className="w-3 h-3" /> Clear
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto messages-scroll px-5 py-4 flex flex-col gap-4">
        <AnimatePresence initial={false}>
          {messages.map(msg => (
            <MessageBubble key={msg.id} msg={msg} onFeedback={handleFeedback} />
          ))}
        </AnimatePresence>
        {loading && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-5 py-4 border-t border-black/6 flex-shrink-0">
        <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="flex gap-2.5 items-center">
          <div className="flex-1 relative">
            <input
              value={input}
              onChange={e => setInput(e.target.value.slice(0, MAX_CHARS))}
              placeholder="Ask a medical question..."
              autoComplete="off"
              className="w-full px-4 py-3 rounded-2xl border border-black/8 bg-black/[0.03] text-[13px] font-medium text-slate-900 placeholder-slate-400 outline-none focus:border-black/15 focus:ring-2 focus:ring-blue-100 transition-all"
            />
            {input.length > 400 && (
              <span className={`absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-semibold ${input.length >= MAX_CHARS ? 'text-red-400' : 'text-slate-400'}`}>
                {input.length}/{MAX_CHARS}
              </span>
            )}
          </div>
          <button type="submit" disabled={!input.trim() || loading}
            className="btn-glass-dark w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0">
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </section>
  );
}
