import { useState } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import ChatWindow from './components/ChatWindow';

export default function App() {
  const [pendingInput, setPendingInput] = useState('');

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: '#0f1117' }}>

      {/* Background mesh */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div style={{
          position: 'absolute', top: '-20%', left: '30%',
          width: '600px', height: '600px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }} />
        <div style={{
          position: 'absolute', bottom: '10%', right: '10%',
          width: '400px', height: '400px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }} />
        <div style={{
          position: 'absolute', top: '50%', left: '-10%',
          width: '300px', height: '300px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(59,130,246,0.06) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }} />
      </div>

      <Navbar />

      {/* Disclaimer */}
      <div className="fixed top-14 left-0 right-0 z-40 text-center py-1.5 px-4 text-[11px] font-medium"
        style={{
          background: 'rgba(234,88,12,0.1)',
          backdropFilter: 'blur(8px)',
          borderBottom: '1px solid rgba(234,88,12,0.2)',
          color: '#fb923c',
        }}>
        ⚠️ For informational purposes only — <strong>NOT a substitute for professional medical advice.</strong> Always consult a qualified healthcare provider.
      </div>

      {/* Layout */}
      <main className="relative z-10 max-w-6xl mx-auto px-4 pb-4"
        style={{
          paddingTop: '88px',
          height: '100vh',
          display: 'grid',
          gridTemplateColumns: '260px 1fr',
          gap: '16px',
        }}>
        <Sidebar onSuggestion={(text) => setPendingInput(text)} />
        <ChatWindow
          pendingInput={pendingInput}
          onPendingConsumed={() => setPendingInput('')}
        />
      </main>
    </div>
  );
}
