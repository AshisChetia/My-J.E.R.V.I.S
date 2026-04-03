import React, { useEffect, useState } from 'react'

// --- ANIMATED SUB-COMPONENTS ---

const LiveGraph = () => (
  <svg className="w-full h-full" viewBox="0 0 100 40" preserveAspectRatio="none">
    <path
      d="M0 40 L0 30 L10 35 L20 15 L30 25 L40 5 L50 20 L60 10 L70 30 L80 15 L90 25 L100 10 L100 40 Z"
      fill="none"
      stroke="#61dafb"
      strokeWidth="0.5"
      className="opacity-50"
    >
      <animate attributeName="d" dur="2s" repeatCount="indefinite"
        values="M0 40 L0 30 L10 35 L20 15 L30 25 L40 5 L50 20 L60 10 L70 30 L80 15 L90 25 L100 10 L100 40 Z;
                M0 40 L0 25 L10 15 L20 35 L30 15 L40 25 L50 10 L60 20 L70 5 L80 30 L90 15 L100 25 L100 40 Z;
                M0 40 L0 30 L10 35 L20 15 L30 25 L40 5 L50 20 L60 10 L70 30 L80 15 L90 25 L100 10 L100 40 Z" />
    </path>
  </svg>
)

const RadarScan = () => (
  <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
    <div className="absolute inset-0 border border-[#61dafb]/10 rounded-full scale-75" />
    <div className="absolute inset-0 border border-[#61dafb]/10 rounded-full scale-50" />
    <div className="w-full h-full rounded-full border border-[#61dafb]/20 animate-pulse" />
    <div className="absolute w-[1px] h-1/2 bg-cyan-400 origin-bottom animate-[spin_3s_linear_infinite]" style={{ bottom: '50%' }} />
  </div>
)

const DataStream = () => {
  const [lines, setLines] = useState([])
  useEffect(() => {
    const interval = setInterval(() => {
      setLines(prev => [Math.random().toString(16).toUpperCase().substring(2, 10), ...prev].slice(0, 8))
    }, 500)
    return () => clearInterval(interval)
  }, [])
  return (
    <div className="font-mono text-[8px] text-cyan-500/60 leading-tight">
      {lines.map((line, i) => <div key={i} className="animate-pulse">{`> 0x${line} .. OK`}</div>)}
    </div>
  )
}

const BinaryRain = () => (
  <div className="grid grid-cols-5 gap-1 opacity-40">
    {[...Array(25)].map((_, i) => (
      <div key={i} className={`text-[8px] animate-pulse`} style={{ animationDelay: `${i * 0.1}s` }}>
        {Math.random() > 0.5 ? '1' : '0'}
      </div>
    ))}
  </div>
)

// --- MAIN PANEL COMPONENT ---

const Panel = ({ title, className, type }) => (
  <div className={`border border-[#61dafb]/20 bg-black/20 p-2 flex flex-col overflow-hidden ${className}`}>
    <div className="text-[9px] font-bold border-b border-[#61dafb]/20 pb-1 mb-2 flex justify-between uppercase tracking-tighter">
      <span className="text-cyan-400/80">{title}</span>
      <span className="opacity-40 font-normal">SEC_0x{Math.floor(Math.random() * 999)}</span>
    </div>
    <div className="flex-1 relative">
      {type === 'graph' && <LiveGraph />}
      {type === 'list' && <DataStream />}
      {type === 'map' && <RadarScan />}
      {type === 'network' && <BinaryRain />}
      {type === 'traffic' && <div className="h-full w-full border-t border-[#61dafb]/10 mt-2 animate-pulse"><LiveGraph /></div>}
    </div>
  </div>
)

const Keyboard = ({ className }) => (
  <div className={`border border-[#61dafb]/20 bg-black/40 p-3 ${className}`}>
    <div className="grid grid-cols-12 gap-1 h-full opacity-30">
      {[...Array(48)].map((_, i) => (
        <div key={i} className="border border-[#61dafb]/40 rounded-sm hover:bg-cyan-500/20 transition-all cursor-pointer flex items-center justify-center text-[7px]">
           {String.fromCharCode(65 + (i % 26))}
        </div>
      ))}
    </div>
  </div>
)

const Dashboard = { Panel, Keyboard }
export default Dashboard