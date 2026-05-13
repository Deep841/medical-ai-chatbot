import { useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, Check } from 'lucide-react';
import type { Message } from '../types';

export default function MessageBubble({ msg }: { msg: Message }) {
  const [copied, setCopied] = useState(false);
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
      <div className={`max-w-[70%] group relative ${isBot ? '' : ''}`}>
        <div className={`px-4 py-3 rounded-[18px] text-[13px] leading-relaxed
          ${isBot
            ? 'bg-white/85 border border-black/7 shadow-sm text-slate-800 rounded-bl-[4px]'
            : 'bg-slate-900 text-white rounded-br-[4px]'
          } ${msg.error ? 'border-red-200 bg-red-50 text-red-700' : ''}`}
        >
          <p>{msg.text}</p>

          {/* Sources */}
          {isBot && msg.sources && msg.sources.length > 0 && (
            <div className="mt-2.5 pt-2.5 border-t border-black/6 flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] text-slate-400">📄 Sources:</span>
              {msg.sources.map((s) => (
                <span key={s} className="px-2 py-0.5 rounded-full bg-slate-100 border border-black/6 text-[10px] font-semibold text-slate-500">
                  {s}
                </span>
              ))}
            </div>
          )}

          <span className={`block text-[10px] mt-1.5 ${isBot ? 'text-slate-400' : 'text-white/40'}`}>
            {msg.time}
          </span>
        </div>

        {/* Copy button — only on bot messages */}
        {isBot && !msg.error && (
          <button
            onClick={copy}
            className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity w-6 h-6 rounded-full bg-white border border-black/8 shadow-sm flex items-center justify-center"
          >
            {copied
              ? <Check className="w-3 h-3 text-green-500" />
              : <Copy className="w-3 h-3 text-slate-400" />
            }
          </button>
        )}
      </div>
    </motion.div>
  );
}
