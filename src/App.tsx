import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Upload, FileText, AlertCircle, Info } from 'lucide-react';
import LoadingOverlay from './components/LoadingOverlay';
import StatsStrip from './components/StatsStrip';
import Analysis, { AnalysisData } from './components/Analysis';
import ChatPanel from './components/ChatPanel';
import { analyzeContract, chatAboutContract } from './services/gemini';
import { cn } from './lib/utils';

const SAMPLE_CONTRACT = `NAME, IMAGE AND LIKENESS LICENSING AGREEMENT

This Agreement is entered into between MIDWESTERN STATE UNIVERSITY ("University") and the undersigned Student-Athlete ("Athlete").

CLAUSE 1: GRANT OF RIGHTS — Athlete grants University an exclusive, irrevocable, perpetual, worldwide, sublicensable license to use Athlete's name, nickname, signature, voice, image, likeness, biographical information, jersey number, and social media handles for any commercial purpose, including third-party sublicensing. License survives termination and Athlete's enrollment.

CLAUSE 2: COMPENSATION — University pays Athlete $250,000 per academic year. Payment is contingent on (a) NCAA eligibility, (b) participation in 75% of practices and games, (c) compliance with University social media policy, (d) absence of conduct deemed embarrassing to University.

CLAUSE 3: EXCLUSIVITY — Athlete shall not enter any other endorsement or commercial agreement during the term without University's prior written consent. No geographic or temporal limitation.

CLAUSE 4: TERM AND TRANSFER — Three-year term. Athlete agrees not to enter the NCAA Transfer Portal. If Athlete enters the Portal or transfers, Athlete pays liquidated damages of 50% of all compensation paid to date, plus University's attorneys' fees. Applies regardless of reason, including injury or coaching changes.

CLAUSE 5: TERMINATION — University may terminate immediately for: NCAA violation, conduct University deems to bring it into disrepute, injury preventing participation for over 30 days, or failure to maintain 2.5 GPA. Athlete may not terminate for any reason.

CLAUSE 6: SOCIAL MEDIA — Athlete must post 2+ promotional posts per month on each major platform. Content subject to University pre-approval. University may post on Athlete's behalf.

CLAUSE 7: POST-TERM RIGHTS — Following expiration, University retains perpetual right to use any content created during the term, including photos, video, audio of Athlete, in any medium, without further compensation.

CLAUSE 8: DISPUTE RESOLUTION — Binding arbitration in University's state. Athlete waives class action rights. Attorneys' fees awarded only to University in Athlete-initiated disputes.

CLAUSE 9: GOVERNING LAW — Governed by laws of University's state.

CLAUSE 10: ENTIRE AGREEMENT — Constitutes entire agreement between parties.`;

export default function App() {
  const [file, setFile] = useState<{ data: string; mime: string; name: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'model'; parts: any[] }[]>([]);
  const [chatLoading, setChatLoading] = useState(false);

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(',')[1];
      setFile({ data: base64, mime: selected.type, name: selected.name });
    };
    reader.readAsDataURL(selected);
  }, []);

  const loadSample = () => {
     // Use a more robust base64 encoder for UTF-8 strings
     const bytes = new TextEncoder().encode(SAMPLE_CONTRACT);
     const binString = Array.from(bytes, (byte) => String.fromCharCode(byte)).join("");
     const base64 = btoa(binString);
     setFile({ data: base64, mime: 'text/plain', name: 'Sample_NIL_Contract.pdf' });
  };

  const startAnalysis = async () => {
    if (!file) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await analyzeContract(file.data, file.mime);
      setAnalysis(result);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Something went wrong during analysis.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (text: string) => {
    if (chatLoading) return;

    const userMsg = { role: 'user' as const, parts: [{ text }] };
    setChatHistory(prev => [...prev, userMsg]);
    setChatLoading(true);

    try {
      const historyForApi = chatHistory.map(m => ({
        role: m.role,
        parts: m.parts
      }));
      historyForApi.push(userMsg);

      const response = await chatAboutContract(historyForApi, file?.data, file?.mime);
      setChatHistory(prev => [...prev, { role: 'model', parts: [{ text: response || '' }] }]);
    } catch (err: any) {
      setError(err.message || "Failed to get response from Coach.");
    } finally {
      setChatLoading(false);
    }
  };

  const reset = () => {
    setFile(null);
    setAnalysis(null);
    setChatHistory([]);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-bg-base font-sans selection:bg-brand selection:text-bg-base">
      <LoadingOverlay isVisible={isLoading} />
      
      {/* Header */}
      <nav className="p-6 border-b border-white/5 bg-bg-base/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 group cursor-pointer" onClick={reset}>
            <div className="w-8 h-8 bg-brand flex items-center justify-center font-black text-bg-base rotate-12 group-hover:rotate-0 transition-transform">
              C
            </div>
            <span className="font-serif text-2xl font-black tracking-tighter">ContractCoach</span>
          </div>

          <div className="flex items-center gap-4">
            {/* API Key managed securely server-side */}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-6 md:py-12">
        <AnimatePresence mode="wait">
          {!analysis ? (
            <motion.div
              key="landing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-4xl mx-auto"
            >
              <div className="space-y-4 mb-20 text-center md:text-left">
                <h1 className="text-6xl md:text-8xl font-black leading-[0.9] tracking-tighter">
                  An 18-year-old shouldn't sign an <span className="text-brand italic">$8M deal</span> they can't read.
                </h1>
                <p className="text-gray-500 font-serif text-xl italic max-w-xl">
                  Most NIL agents are unregulated. Legal review is $400/hr. Coach reviews your contract for free, instantly.
                </p>
              </div>

              <div className="bg-bg-surface p-8 border border-white/5 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                   <FileText className="w-32 h-32" />
                </div>

                <div className="relative z-10 flex flex-col items-center justify-center py-12 border-2 border-dashed border-white/10 hover:border-brand/40 transition-colors cursor-pointer" onClick={() => document.getElementById('file-upload')?.click()}>
                  <Upload className="w-12 h-12 text-gray-500 mb-6 group-hover:text-brand transition-colors" />
                  <p className="text-xl font-bold mb-2">
                    {file ? file.name : "Drop contract here or click to browse"}
                  </p>
                  <p className="font-mono text-xs text-gray-500 uppercase tracking-widest">
                    PDF or Image (All states supported)
                  </p>
                  <input id="file-upload" type="file" className="hidden" onChange={handleFileUpload} accept="application/pdf,image/*" />
                </div>

                <div className="flex flex-col md:flex-row gap-4 mt-8">
                  <button 
                    onClick={startAnalysis}
                    disabled={!file}
                    className="flex-1 btn-brand disabled:opacity-20 disabled:scale-100 flex items-center justify-center gap-2"
                  >
                    Analyze Contract <ChevronRight className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={loadSample}
                    className="px-6 py-3 border border-white/10 hover:bg-white/5 transition-colors font-mono text-[10px] uppercase tracking-widest text-gray-400"
                  >
                    Load Sample NIL Contract
                  </button>
                </div>


              </div>

              {error && (
                <div className="mt-6 p-4 bg-status-red/10 border border-status-red/20 text-status-red flex items-center gap-3 font-mono text-xs">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </div>
              )}

              <StatsStrip />
            </motion.div>
          ) : (
            <motion.div
              key="analysis"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-12"
            >
              <div className="lg:pr-12">
                <Analysis data={analysis} onReset={reset} />
              </div>
              <div className="relative">
                <ChatPanel 
                  messages={chatHistory.map(m => ({ role: m.role, text: m.parts.map((p: any) => p.text).join(' ') }))}
                  onSendMessage={handleSendMessage}
                  isLoading={chatLoading}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="p-12 border-t border-white/5 mt-20 opacity-40">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-brand text-bg-base flex items-center justify-center text-[10px] font-black">C</div>
              <span className="font-serif font-black uppercase text-xs tracking-tighter">ContractCoach</span>
            </div>
            <p className="text-[10px] uppercase tracking-widest font-mono max-w-sm">
              Helping athletes navigate the complexity of Name, Image, and Likeness agreements through advanced AI reasoning.
            </p>
          </div>
          <div className="p-4 border border-white/10 flex items-start gap-3 max-w-md">
            <Info className="w-4 h-4 shrink-0 text-brand" />
            <p className="text-[10px] font-sans leading-relaxed">
              <span className="text-brand font-bold uppercase">Disclaimer:</span> ContractCoach is not a law firm and does not provide legal advice. All analysis is for informational purposes only. In production, API keys should be handled via a secure backend proxy to ensure security and rate limiting.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function ChevronRight(props: any) {
  return (
    <svg 
      {...props} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
    >
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}
