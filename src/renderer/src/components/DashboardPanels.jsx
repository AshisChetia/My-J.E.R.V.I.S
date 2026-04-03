import React from 'react'

export const SystemMonitor = () => (
  <div className="hud-panel p-4 h-full flex flex-col">
    <div className="text-[10px] border-b border-cyan-500/30 pb-1 mb-2 flex justify-between font-black uppercase">
      <span>System_Core_Monitor</span>
      <span className="text-cyan-600">0x334</span>
    </div>
    <div className="flex-1 font-mono text-[9px] opacity-40 overflow-hidden leading-relaxed whitespace-pre italic">
      {`>> INIT_SYSCALL\n>> ANALYZE_VOICE_STREAM\n>> TEMP: 45°C\n>> VOLT: 1.2V\n>> UPLINK_STABLE`}
    </div>
    <div className="mt-4 grid grid-cols-2 gap-2 text-[10px]">
      <div className="border border-cyan-500/20 p-1">CPU: 68%</div>
      <div className="border border-cyan-500/20 p-1">MEM: 8.2GB</div>
    </div>
  </div>
)

export const CommandLog = () => (
  <div className="hud-panel p-4 h-full">
    <div className="text-[10px] border-b border-cyan-500/30 pb-1 mb-2 font-black uppercase">Command_History</div>
    <div className="space-y-3 mt-4">
      <div className="flex justify-between text-[9px] text-cyan-300">
        <span>"INITIALIZE_SCAN"</span>
        <span className="opacity-40">12:34:01</span>
      </div>
      <div className="flex justify-between text-[9px] opacity-40">
        <span>"OPEN_WORKSPACE"</span>
        <span className="opacity-40">12:35:10</span>
      </div>
    </div>
  </div>
)