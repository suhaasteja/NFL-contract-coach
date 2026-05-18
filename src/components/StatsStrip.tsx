import React from 'react';

const STATS = [
  { label: "REVENUE SHARE CAP", value: "$20.5M" },
  { label: "BUYOUT CLAWBACKS", value: "50%" },
  { label: "TYPICAL AGE", value: "18" },
  { label: "LEGAL REVIEW COST", value: "$0" }
];

export default function StatsStrip() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-12 border-y border-bg-surface mt-12">
      {STATS.map((stat, i) => (
        <div key={i} className="flex flex-col">
          <span className="font-mono text-xs text-gray-500 uppercase tracking-widest mb-2">
            {stat.label}
          </span>
          <span className="font-serif text-4xl font-black text-brand italic">
            {stat.value}
          </span>
        </div>
      ))}
    </div>
  );
}
