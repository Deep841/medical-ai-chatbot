import { useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, Check } from 'lucide-react';
import type { Message } from '../types';

// Renders a single line — handles **bold** and plain text
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

// Converts raw answer text into readable blocks
function FormattedAnswer({ text }: { text: string }) {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);

  const blocks: React.ReactNode[] = [];
  let bullets: string[] = [];

  function flushBullets() {
    if (bullets.length === 0) return;
    blocks.push(
      <ul key={blocks.length} className="space-y-1 my-1">
        {bullets.map((b, i) => (
          <li key={i} className="flex items-start gap-2">
            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-slate-400 flex-shrink-0" />
            <span><InlineText text={b} /></span>
          </li>
        ))}
      </ul>
    );
    bullets = [];
  }

  lines.forEach((line, i) => {
    // Bullet line
    if (/^[-•*]\s+/.test(line)) {
      bullets.push(line.replace(/^[-•*]\s+/, ''));
      return;
    }
    // Numbered list
    if (/^\d+\.\s+/.test(line)) {
      bullets.push(line.replace(/^\d+\.\s+/, ''));
      return;
    }
    // Heading (ends with : or is ALL CAPS short line)
    if (line.endsWith(':') || (line === line.toUpperCase() && line.length < 60)) {
      flushBullets();
      blocks.push(
        <p key={i} className="font-semibold text-slate-800 mt-2 first:mt-0">
          <InlineText text={line} />
        </p>
      );
      return;
    }
    // Disclaimer line — style differently
    if (line.startsWith('⚠️')) {
      flushBullets();
      blocks.push(
        <p key={i} className="text-[11px] text-orange-700 mt-2 pt-2 border-t border-orange-100">
          {line}
        </p>
      );
      return;
    }
    // Regular paragraph
    flushBullets();
    blocks.push(
      <p key={i} className="leading-relaxed">
        <InlineText text={line} />
      </p>
    );
  });

  flushBullets();
  return <div className="space-y-1.5 text-[13px] text-slate-700">{blocks}</div>;
}

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
      <div className={`group relative ${isBot ? 'max-w-[75%]' : 'max-w-[65%]'}`}>
        <div className={`px-4 py-3 rounded-[18px]
          ${isBot
            ? 'bg-white/90 border border-black/7 shadow-sm rounded-bl-[4px]'
            : 'bg-slate-900 text-white text-[13px] leading-relaxed rounded-br-[4px]'
          } ${msg.error ? 'border-red-200 bg-red-50' : ''}`}
        >
          {/* Bot: formatted answer */}
          {isBot && !msg.error && <FormattedAnswer text={msg.text} />}

          {/* Bot: error */}
          {isBot && msg.error && (
            <p className="text-[13px] text-red-600">{msg.text}</p>
          )}

          {/* User: plain text */}
          {!isBot && <p>{msg.text}</p>}

          {/* Sources */}
          {isBot && !msg.error && msg.sources && msg.sources.length > 0 && (
            <div className="mt-2.5 pt-2 border-t border-black/6 flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] text-slate-400">📄 Sources:</span>
              {msg.sources.map((s) => (
                <span key={s} className="px-2 py-0.5 rounded-full bg-slate-100 border border-black/6 text-[10px] font-semibold text-slate-500">
                  {s}
                </span>
              ))}
            </div>
          )}

          <span className={`block text-[10px] mt-2 ${isBot ? 'text-slate-400' : 'text-white/40'}`}>
            {msg.time}
          </span>
        </div>

        {/* Copy button */}
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
