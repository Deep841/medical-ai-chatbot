import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, Check, ThumbsUp, ThumbsDown, ChevronDown, ChevronUp } from 'lucide-react';
import type { Message } from '../types';

function InlineText({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((part, i) =>
        part.startsWith('**') && part.endsWith('**')
          ? <strong key={i} className="font-semibold text-slate-900">{part.slice(2, -2)}</strong>
          : <span key={i}>{part}</span>
      )}
    </>
  );
}

function FormattedAnswer({ text }: { text: string }) {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  const blocks: React.ReactNode[] = [];
  let bullets: string[] = [];

  function flushBullets() {
    if (!bullets.length) return;
    blocks.push(
      <ul key={`b${blocks.length}`} className="space-y-1.5 my-1">
        {bullets.map((b, i) => (
          <li key={i} className="flex items-start gap-2">
            <span className="mt-2 w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0" />
            <span><InlineText text={b} /></span>
          </li>
        ))}
      </ul>
    );
    bullets = [];
  }

  lines.forEach((line, i) => {
    if (/^[-•*]\s+/.test(line)) { bullets.push(line.replace(/^[-•*]\s+/, '')); return; }
    if (/^\d+\.\s+/.test(line))  { bullets.push(line.replace(/^\d+\.\s+/, '')); return; }

    flushBullets();

    if (line.startsWith('⚠️')) {
      blocks.push(
        <p key={i} className="text-[11px] text-orange-700 mt-3 pt-2.5 border-t border-orange-100 leading-relaxed">
          {line}
        </p>
      );
      return;
    }
    if (line.endsWith(':') && line.length < 80) {
      blocks.push(
        <p key={i} className="font-semibold text-slate-800 mt-2 first:mt-0 text-[13px]">
          <InlineText text={line} />
        </p>
      );
      return;
    }
    blocks.push(
      <p key={i} className="leading-relaxed"><InlineText text={line} /></p>
    );
  });

  flushBullets();
  return <div className="space-y-1.5 text-[13px] text-slate-700">{blocks}</div>;
}

interface Props {
  msg: Message;
  onFeedback: (id: string, rating: 'up' | 'down') => void;
}

export default function MessageBubble({ msg, onFeedback }: Props) {
  const [copied, setCopied]           = useState(false);
  const [showSnippets, setShowSnippets] = useState(false);
  const isBot = msg.role === 'bot';

  function copy() {
    navigator.clipboard.writeText(msg.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`flex items-end gap-2.5 ${isBot ? '' : 'flex-row-reverse'}`}
    >
      {/* Avatar */}
      <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm flex-shrink-0 shadow-sm
        ${isBot ? 'bg-slate-100 text-base' : 'bg-slate-900 text-[9px] font-bold text-white'}`}>
        {isBot ? '🧠' : 'You'}
      </div>

      {/* Bubble */}
      <div className={`group relative ${isBot ? 'max-w-[78%]' : 'max-w-[65%]'}`}>
        <div className={`px-4 py-3 rounded-[18px]
          ${isBot
            ? 'bg-white/90 border border-black/7 shadow-sm rounded-bl-[4px]'
            : 'bg-slate-900 text-white text-[13px] leading-relaxed rounded-br-[4px]'
          } ${msg.error ? 'border-red-200 bg-red-50' : ''}`}
        >
          {isBot && !msg.error && <FormattedAnswer text={msg.text} />}
          {isBot && msg.error && <p className="text-[13px] text-red-600">{msg.text}</p>}
          {!isBot && <p>{msg.text}</p>}

          {/* Sources */}
          {isBot && !msg.error && msg.sources && msg.sources.length > 0 && (
            <div className="mt-2.5 pt-2 border-t border-black/6">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] text-slate-400">📄 Sources:</span>
                {msg.sources.map((s) => (
                  <span key={s} className="px-2 py-0.5 rounded-full bg-slate-100 border border-black/6 text-[10px] font-semibold text-slate-500">
                    {s}
                  </span>
                ))}
              </div>

              {/* Snippets toggle */}
              {msg.snippets && msg.snippets.length > 0 && (
                <button
                  onClick={() => setShowSnippets(v => !v)}
                  className="mt-1.5 flex items-center gap-1 text-[11px] text-blue-500 hover:text-blue-700 transition-colors"
                >
                  {showSnippets ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  {showSnippets ? 'Hide' : 'Show'} source excerpts
                </button>
              )}

              <AnimatePresence>
                {showSnippets && msg.snippets && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-2 space-y-2 overflow-hidden"
                  >
                    {msg.snippets.map((s, i) => (
                      <div key={i} className="p-2.5 rounded-xl bg-slate-50 border border-black/5">
                        <p className="text-[10px] font-semibold text-slate-400 mb-1">{s.source}</p>
                        <p className="text-[11px] text-slate-600 leading-relaxed italic">"{s.text}"</p>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Feedback */}
          {isBot && !msg.error && (
            <div className="mt-2 flex items-center gap-2">
              <span className="text-[10px] text-slate-400">Helpful?</span>
              <button
                onClick={() => onFeedback(msg.id, 'up')}
                className={`p-1 rounded-lg transition-colors ${msg.feedback === 'up' ? 'bg-green-100 text-green-600' : 'text-slate-300 hover:text-green-500'}`}
              >
                <ThumbsUp className="w-3 h-3" />
              </button>
              <button
                onClick={() => onFeedback(msg.id, 'down')}
                className={`p-1 rounded-lg transition-colors ${msg.feedback === 'down' ? 'bg-red-100 text-red-500' : 'text-slate-300 hover:text-red-400'}`}
              >
                <ThumbsDown className="w-3 h-3" />
              </button>
            </div>
          )}

          <span className={`block text-[10px] mt-1.5 ${isBot ? 'text-slate-400' : 'text-white/40'}`}>
            {msg.time}
          </span>
        </div>

        {/* Copy */}
        {isBot && !msg.error && (
          <button
            onClick={copy}
            className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity w-6 h-6 rounded-full bg-white border border-black/8 shadow-sm flex items-center justify-center"
          >
            {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3 text-slate-400" />}
          </button>
        )}
      </div>
    </motion.div>
  );
}
