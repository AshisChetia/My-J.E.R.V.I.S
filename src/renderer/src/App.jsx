import { useState } from 'react'
import MicButton from './components/MicButton'
import { SystemMonitor, CommandLog } from './components/DashboardPanels'

export default function App() {
  const [status, setStatus] = useState('idle')

  return (
    <div className="h-screen w-full flex flex-col p-10 relative">
      {/* Background HUD Grid */}
      <div className="absolute inset-0 grid-background opacity-10 pointer-events-none" />

      {/* Header */}
      <header className="flex justify-between items-start mb-10 z-10">
        <div className="border-l-4 border-cyan-500 pl-4">
          <h1 className="text-5xl font-black tracking-tighter text-cyan-400 drop-shadow-[0_0_10px_rgba(6,182,212,0.4)]">J.A.R.V.I.S.</h1>
          <p className="text-[10px] tracking-[0.6em] opacity-40 uppercase">Mark_IV Core Interface</p>
        </div>
        <div className="text-right">
          <p className="text-5xl font-extralight text-cyan-400">23:40:36</p>
          <div className="text-[8px] tracking-widest opacity-40 mt-2 text-emerald-400">● ENCRYPTION_ACTIVE // AUTH_VERIFIED</div>
        </div>
      </header>

      {/* Main Interface Grid */}
      <div className="flex-1 grid grid-cols-12 gap-8 items-center z-10">
        <div className="col-span-3 h-[500px] flex flex-col gap-6">
          <SystemMonitor />
          <div className="hud-panel p-4 flex-1">
             <div className="text-[10px] font-black uppercase border-b border-cyan-500/30 pb-1 mb-4">Reactant_Output</div>
             <div className="h-24 w-full bg-cyan-500/5 border border-cyan-500/20 relative">
                <div className="absolute inset-0 bg-cyan-500/20 animate-pulse w-[42%]" />
             </div>
          </div>
        </div>

        <div className="col-span-6 flex justify-center">
          <MicButton onStatusChange={setStatus} />
        </div>

        <div className="col-span-3 h-[500px] flex flex-col gap-6">
           <div className="hud-panel p-4 h-64">
              <div className="text-[10px] font-black uppercase border-b border-cyan-500/30 pb-1 mb-4">Network_Uplink</div>
              <div className="h-32 w-full bg-[url('https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExM3N2NXZmZ3BqZ3BqZ3BqZ3BqZ3BqZ3BqZ3BqZ3BqZ3BqZ3BqZ3BqJmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/3o7TKMGpx4U7Z1k9G0/giphy.gif')] bg-cover opacity-10 grayscale invert" />
           </div>
           <CommandLog />
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-8 flex justify-center">
         <div className="w-1/2 hud-panel py-3 px-10 flex items-center justify-between text-[10px] opacity-40">
            <span>Kernel_v4.2.0-STABLE</span>
            <span className="animate-pulse">Scanning_Input...</span>
            <span>Uplink: Guwahati_Sector_7</span>
         </div>
      </footer>
    </div>
  )
}