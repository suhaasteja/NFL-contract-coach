import React from 'react';
import { motion } from 'motion/react';
import { AlertCircle, CheckCircle2, ShieldAlert, Globe, ChevronRight } from 'lucide-react';
import { cn } from '@/src/lib/utils';

export interface Flag {
  title: string;
  page: string;
  severity: 'high' | 'medium' | 'low';
  why: string;
  quote?: string;
}

export interface GreenFlag {
  title: string;
  page: string;
  why: string;
}

export interface AnalysisData {
  verdict: 'FAVORABLE' | 'MIXED' | 'PREDATORY';
  title: string;
  summary: string;
  red_flags: Flag[];
  green_flags: GreenFlag[];
  market_comparison: string;
}

interface AnalysisProps {
  data: AnalysisData;
  onReset: () => void;
}

export default function Analysis({ data, onReset }: AnalysisProps) {
  const verdictConfig = {
    FAVORABLE: { color: 'text-status-green', bg: 'bg-status-green/10', icon: CheckCircle2, label: '✓ FAVORABLE TERMS' },
    MIXED: { color: 'text-status-amber', bg: 'bg-status-amber/10', icon: AlertCircle, label: '! MIXED TERMS' },
    PREDATORY: { color: 'text-status-red', bg: 'bg-status-red/10', icon: ShieldAlert, label: '✕ PREDATORY — DO NOT SIGN AS-IS' }
  };

  const config = verdictConfig[data.verdict] || verdictConfig.MIXED;

  return (
    <div className="space-y-12">
      <header className="space-y-6">
        <button 
          onClick={onReset}
          className="font-mono text-[10px] uppercase tracking-widest text-gray-500 hover:text-brand flex items-center gap-1 transition-colors"
        >
          <ChevronRight className="w-3 h-3 rotate-180" /> Reset & New Analysis
        </button>

        <div className="space-y-4">
          <div className={cn(
            "inline-flex items-center gap-2 px-3 py-1 rounded-none border border-current font-mono text-[10px] tracking-tighter",
            config.color
          )}>
            <config.icon className="w-3 h-3" />
            {config.label}
          </div>
          
          <h1 className="text-5xl md:text-6xl font-black leading-none tracking-tighter max-w-2xl">
            {data.title}
          </h1>
        </div>

        <div className="p-6 bg-bg-surface border-l-4 border-brand">
          <p className="text-xl font-medium leading-relaxed italic text-gray-100 italic">
            "{data.summary}"
          </p>
        </div>
      </header>

      <section className="space-y-6">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-black uppercase tracking-tighter">Red Flags</h2>
          <div className="h-px flex-1 bg-white/10" />
        </div>
        
        <div className="grid gap-6">
          {data.red_flags.map((flag, i) => (
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: i * 0.1 }}
              key={i}
              className={cn(
                "p-6 bg-bg-surface border-l-[3px] space-y-4",
                flag.severity === 'high' ? "border-status-red" : 
                flag.severity === 'medium' ? "border-status-amber" : "border-gray-500"
              )}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <h3 className="text-lg font-bold font-serif leading-tight">{flag.title}</h3>
                  <p className="font-mono text-[10px] text-gray-500 uppercase tracking-widest">{flag.page}</p>
                </div>
                <div className={cn(
                   "px-2 py-0.5 font-mono text-[8px] uppercase tracking-widest border",
                   flag.severity === 'high' ? "text-status-red border-status-red" : 
                   flag.severity === 'medium' ? "text-status-amber border-status-amber" : "text-gray-500 border-gray-500"
                )}>
                  {flag.severity} RISK
                </div>
              </div>
              
              <p className="text-sm text-gray-400 leading-relaxed">{flag.why}</p>
              
              {flag.quote && (
                <div className="p-3 bg-black/40 border border-white/5 font-mono text-xs leading-none text-gray-500">
                  <span className="text-brand/50 mr-2">QUOTE:</span>
                  "{flag.quote}"
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-black uppercase tracking-tighter">Green Flags</h2>
          <div className="h-px flex-1 bg-white/10" />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
            {data.green_flags.map((flag, i) => (
              <div key={i} className="p-4 bg-bg-surface/50 border border-white/5 space-y-2">
                <h4 className="font-bold flex items-center gap-2 text-status-green">
                  <CheckCircle2 className="w-4 h-4" />
                  {flag.title}
                </h4>
                <p className="text-xs text-gray-500 leading-relaxed">{flag.why}</p>
              </div>
            ))}
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-black uppercase tracking-tighter">Market Comparison</h2>
          <div className="h-px flex-1 bg-white/10" />
        </div>
        <div className="p-6 bg-white/5 font-sans leading-relaxed text-gray-400 border border-white/5">
           <Globe className="w-10 h-10 text-brand/20 mb-4" />
           {data.market_comparison}
        </div>
      </section>
    </div>
  );
}
