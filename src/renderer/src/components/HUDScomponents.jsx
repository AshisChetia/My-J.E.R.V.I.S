import React from 'react'

// --- 1. THE GAUGE ---
export const Gauge = ({ label, value, color = "stroke-cyan-500" }) => (
  <div className="flex flex-col items-center gap-2">
    <div className="relative h-20 w-20">
      <svg className="h-full w-full -rotate-90">
        <circle cx="40" cy="40" r="35" fill="none" stroke="rgba(6, 182, 212, 0.1)" strokeWidth="2" />
        <circle cx="40" cy="40" r="35" fill="none" strokeWidth="4" strokeDasharray="219" strokeDashoffset={219 - (219 * value) / 100} className={`${color} transition-all duration-700 ease-out`} />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-cyan-300">{value}%</div>
    </div>
    <span className="text-[8px] uppercase tracking-widest opacity-70 text-cyan-400">{label}</span>
  </div>
)

// --- 2. LOCAL ANIMATED MAP ---
export const AnimatedMap = () => (
  <div className="relative h-32 w-full overflow-hidden opacity-40">
    <svg viewBox="0 0 200 100" className="w-full h-full fill-cyan-900/40">
      <circle cx="40" cy="30" r="1.5" /><circle cx="140" cy="40" r="1.5" />
      <circle cx="80" cy="60" r="1.5" /><circle cx="160" cy="20" r="1.5" />
      <circle cx="30" cy="70" r="1.5" /><circle cx="110" cy="50" r="1.5" />
      <path d="M40 30 Q 90 10 140 40" fill="none" stroke="cyan" strokeWidth="0.5" className="animate-pulse" />
      <path d="M80 60 Q 120 40 160 20" fill="none" stroke="cyan" strokeWidth="0.5" className="animate-pulse" style={{animationDelay: '1s'}} />
    </svg>
    <div className="absolute inset-0 bg-gradient-to-t from-[#020b13] to-transparent" />
  </div>
)

// --- 3. SYSTEM LOG ---
export const CommandLog = ({ commands }) => (
  <div className="space-y-2 font-mono text-[8px] uppercase">
    {commands.map((cmd, i) => (
      <div key={i} className={`flex justify-between transition-opacity ${i === 0 ? 'text-cyan-300 opacity-100' : 'opacity-40'}`}>
        <span>{`> "${cmd.text}"`}</span>
        <span>{cmd.time}</span>
      </div>
    ))}
  </div>
)