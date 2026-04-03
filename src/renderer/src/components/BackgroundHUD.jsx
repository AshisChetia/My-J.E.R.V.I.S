import React from 'react'

const TechBrackets = ({ position }) => (
  <div className={`absolute h-32 w-32 ${position} opacity-40`}>
    <div className="absolute top-0 left-0 h-4 w-[2px] bg-cyan-500" />
    <div className="absolute top-0 left-0 h-[2px] w-4 bg-cyan-500" />
    <div className="absolute top-0 right-0 h-4 w-[2px] bg-cyan-500" />
    <div className="absolute top-0 right-0 h-[2px] w-4 bg-cyan-500" />
    <div className="absolute bottom-0 left-0 h-4 w-[2px] bg-cyan-500" />
    <div className="absolute bottom-0 left-0 h-[2px] w-4 bg-cyan-500" />
    <div className="absolute bottom-0 right-0 h-4 w-[2px] bg-cyan-500" />
    <div className="absolute bottom-0 right-0 h-[2px] w-4 bg-cyan-500" />
  </div>
)

export default function BackgroundHUD({ status }) {
  const accent = status === 'listening' ? 'text-red-500/30 border-red-500/20' : 
                 status === 'processing' ? 'text-emerald-500/30 border-emerald-500/20' : 
                 'text-cyan-500/30 border-cyan-500/20'

  return (
    <div className="fixed inset-0 z-0 pointer-events-none bg-slate-950">
      {/* 1. Deep Grid */}
      <div className="absolute inset-0 grid-background opacity-20" />
      
      {/* 2. Concentric Radar Rings (Center) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className={`h-[500px] w-[500px] rounded-full border border-dashed animate-[spin_20s_linear_infinite] ${accent}`} />
        <div className={`absolute top-0 left-0 h-[500px] w-[500px] rounded-full border border-dotted opacity-20 ${accent}`} />
      </div>

      {/* 3. Terminal Corner HUDs */}
      <TechBrackets position="top-8 left-8" />
      <TechBrackets position="bottom-8 right-8" />

      {/* 4. Left Side: Active Logs */}
      <div className={`absolute left-10 top-40 flex flex-col gap-2 font-mono text-[9px] uppercase tracking-tighter ${accent}`}>
        <p className="font-bold border-b border-current mb-2">Network Statistics</p>
        <p>Buffer_Load: {Math.random().toFixed(4)}</p>
        <p>Packet_Loss: 0.000%</p>
        <p>Signal_Strength: 98%</p>
        <div className="mt-8 flex flex-col gap-1">
            {[...Array(15)].map((_, i) => (
                <div key={i} className="flex gap-2 animate-pulse" style={{ animationDelay: `${i*0.1}s` }}>
                    <span className="opacity-50">[{1000 + i}]</span>
                    <span>0x{Math.random().toString(16).toUpperCase().substring(2,6)}...ACK</span>
                </div>
            ))}
        </div>
      </div>

      {/* 5. Right Side: System Matrix */}
      <div className={`absolute right-10 top-40 text-right font-mono text-[9px] uppercase ${accent}`}>
         <p className="font-bold border-b border-current mb-2 inline-block">Security Protocol</p>
         <div className="grid grid-cols-4 gap-1 mt-4">
            {[...Array(24)].map((_, i) => (
                <div key={i} className={`h-4 w-4 border flex items-center justify-center ${Math.random() > 0.8 ? 'bg-cyan-500/20' : ''}`}>
                    {Math.random() > 0.5 ? '1' : '0'}
                </div>
            ))}
         </div>
      </div>

      {/* 6. Scanline Overlay */}
      <div className="scanline pointer-events-none opacity-10" />
    </div>
  )
}