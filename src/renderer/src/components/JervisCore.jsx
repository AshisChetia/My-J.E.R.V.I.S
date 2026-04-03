import React from 'react'

export default function JervisCore({ status, intensity }) {
  return (
    <div className="relative flex h-[400px] w-[400px] items-center justify-center">
      {/* Background Sphere Glow */}
      <div className={`absolute h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl transition-all duration-300 ${status !== 'idle' ? 'scale-150 opacity-40' : 'opacity-20'}`} />
      
      {/* Outer Rotating HUD Rings */}
      <div className="absolute h-80 w-80 rounded-full border border-dashed border-cyan-500/20 animate-[spin_20s_linear_infinite]" />
      <div className="absolute h-72 w-72 rounded-full border border-cyan-500/10 animate-[spin_10s_linear_infinite_reverse]" />

      {/* The Central Sphere */}
      <div className="relative z-10 flex h-60 w-60 items-center justify-center rounded-full border border-cyan-500/40 bg-black/40 shadow-[inset_0_0_30px_rgba(6,182,212,0.2)]">
        {/* Dynamic Waveform */}
        <svg className="absolute w-48 h-32 opacity-80" viewBox="0 0 200 100">
           <path
            d={`M 0 50 Q 50 ${50 - intensity * 1.5} 100 50 T 200 50`}
            fill="none"
            stroke="#00f2ff"
            strokeWidth="2"
            className="transition-all duration-75"
          />
        </svg>

        <div className="text-center">
            <p className="text-[10px] tracking-[0.4em] opacity-60">J.A.R.V.I.S.</p>
            <p className={`text-sm font-black tracking-[0.2em] uppercase mt-1 ${status === 'listening' ? 'text-red-500 animate-pulse' : 'text-cyan-400'}`}>
                {status === 'idle' ? 'Standby' : status === 'listening' ? 'Listening' : 'Processing'}
            </p>
        </div>
      </div>
    </div>
  )
}