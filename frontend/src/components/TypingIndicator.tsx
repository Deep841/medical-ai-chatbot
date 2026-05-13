import { motion } from 'framer-motion';

export default function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-end gap-2.5"
    >
      <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-base flex-shrink-0 shadow-sm">
        🧠
      </div>
      <div className="px-4 py-3.5 rounded-[18px] rounded-bl-[4px] bg-white/85 border border-black/7 shadow-sm flex items-center gap-1.5">
        {[0, 0.2, 0.4].map((delay, i) => (
          <motion.span
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-slate-300 block"
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 0.8, repeat: Infinity, delay }}
          />
        ))}
      </div>
    </motion.div>
  );
}
