import { useState } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import ChatWindow from './components/ChatWindow';

export default function App() {
  const [pendingInput, setPendingInput] = useState('');

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Disclaimer */}
      <div className="fixed top-[68px] left-0 right-0 z-40 text-center py-2 px-4 text-[12px] font-medium text-orange-800"
        style={{ background: 'rgba(255,237,213,0.92)', backdropFilter: 'blur(8px)', borderBottom: '1px solid rgba(234,88,12,0.15)' }}>
        ⚠️ This chatbot provides general health information only. It is{' '}
        <strong>NOT a substitute for professional medical advice</strong>. Always consult a qualified healthcare provider.
      </div>

      {/* Layout */}
      <main className="relative z-10 max-w-6xl mx-auto px-6 pt-[116px] pb-6"
        style={{ height: '100vh', display: 'grid', gridTemplateColumns: '260px 1fr', gap: '20px' }}>
        <Sidebar onSuggestion={(text) => setPendingInput(text)} />
        <ChatWindow
          pendingInput={pendingInput}
          onPendingConsumed={() => setPendingInput('')}
        />
      </main>
    </div>
  );
}
