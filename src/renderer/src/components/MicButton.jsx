import { useState, useEffect, useRef } from 'react'

export default function MicButton({ onStatusChange }) {
  const [status, setStatus] = useState('idle')
  const [intensity, setIntensity] = useState(0)
  
  const mediaRecorderRef = useRef(null)
  const audioChunksRef = useRef([])
  const workerRef = useRef(null)
  const analyserRef = useRef(null)
  const streamRef = useRef(null)
  const animationFrameRef = useRef(null)

  // Sync status to the parent App
  useEffect(() => { onStatusChange?.(status) }, [status])

  // Setup the AI Worker once (Workers don't drain battery like mics do)
  useEffect(() => {
    workerRef.current = new Worker(new URL('../worker.js', import.meta.url), { type: 'module' })
    workerRef.current.onmessage = (e) => {
      if (e.data.status === 'success') window.api?.executeVoiceCommand(e.data.text)
    }
    
    if (window.api?.onReply) {
        window.api.onReply(() => setStatus('idle'))
    }
    
    return () => workerRef.current?.terminate()
  }, [])

  // --- BATTERY-FRIENDLY MIC LOGIC ---
  const startListening = async () => {
    try {
      // 1. UI Feedback: Tell user we are connecting to hardware
      setStatus('waking')

      // 2. Wake up the hardware (Takes ~300-500ms)
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream

      // 3. Setup Waveform Animation
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)()
      const source = audioCtx.createMediaStreamSource(stream)
      analyserRef.current = audioCtx.createAnalyser()
      analyserRef.current.fftSize = 64
      source.connect(analyserRef.current)
      
      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount)
      const loop = () => {
        if (analyserRef.current) {
          analyserRef.current.getByteFrequencyData(dataArray)
          const avg = dataArray.reduce((a, b) => a + b) / dataArray.length
          setIntensity(avg)
          animationFrameRef.current = requestAnimationFrame(loop)
        }
      }
      loop()

      // 4. Start Recording safely
      const recorder = new MediaRecorder(stream)
      recorder.ondataavailable = (e) => audioChunksRef.current.push(e.data)
      recorder.onstop = async () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/wav' })
        audioChunksRef.current = [] 
        
        try {
          const buffer = await blob.arrayBuffer()
          
          // --- THE CRITICAL FIX: Force 16kHz Sample Rate ---
          const OfflineAudioContext = window.OfflineAudioContext || window.webkitOfflineAudioContext;
          const audioContext = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 16000 });
          
          const decoded = await audioContext.decodeAudioData(buffer)
          workerRef.current?.postMessage({ audioData: decoded.getChannelData(0) })
        } catch (error) {
          console.error("Audio Decode Error:", error)
        }

        // HARDWARE KILL SWITCH: Save the battery!
        stream.getTracks().forEach(t => t.stop())
        analyserRef.current = null
        setIntensity(0)
      }

      mediaRecorderRef.current = recorder
      recorder.start()
      
      // 5. Hardware is ready. Signal to user to start speaking!
      setStatus('listening')

    } catch (err) {
      console.error("Hardware Error:", err)
      setStatus('idle')
    }
  }

  const stopListening = () => {
    if (status === 'listening' && mediaRecorderRef.current) {
      mediaRecorderRef.current.stop()
      setStatus('processing')
      cancelAnimationFrame(animationFrameRef.current)

      // --- ADD THIS INSTANT FEEDBACK ---
      const ack = new SpeechSynthesisUtterance("Right away, sir.");
      ack.pitch = 0.7; ack.rate = 1.2; ack.volume = 0.5;
      window.speechSynthesis.speak(ack);
      // ---------------------------------
      
    } else if (status === 'waking') {
      setStatus('idle')
    }
  }

  return (
    <div 
      onMouseDown={startListening} 
      onMouseUp={stopListening}
      onMouseLeave={stopListening}
      className="relative flex h-80 w-80 items-center justify-center cursor-pointer group"
    >
      {/* Outer Decorative Rings */}
      <div className={`absolute inset-0 rounded-full border border-cyan-500/20 transition-all duration-700 ${status !== 'idle' ? 'animate-[spin_4s_linear_infinite] border-cyan-400' : ''}`} />
      <div className="absolute inset-6 rounded-full border border-dashed border-cyan-500/10 animate-[spin_10s_linear_infinite_reverse]" />

      {/* Central Interactive Sphere */}
      <div className={`relative z-10 flex h-60 w-60 items-center justify-center rounded-full border transition-all duration-500 
        ${status === 'listening' ? 'border-red-500 bg-red-500/10 shadow-[0_0_50px_rgba(239,68,68,0.3)]' : 
          status === 'processing' ? 'border-emerald-500 bg-emerald-500/10 shadow-[0_0_50px_rgba(16,185,129,0.3)]' :
          status === 'waking' ? 'border-yellow-500 bg-yellow-500/10 shadow-[inset_0_0_30px_rgba(234,179,8,0.2)]' :
          'border-cyan-500/30 bg-black/60 shadow-[inset_0_0_30px_rgba(6,182,212,0.1)]'}`}>
        
        {/* The Waveform */}
        <svg className="absolute w-full h-32" viewBox="0 0 200 100">
          <path 
            d={`M 0 50 Q 50 ${50 - intensity * 1.2} 100 50 T 200 50`} 
            fill="none" 
            stroke={status === 'listening' ? '#ef4444' : status === 'waking' ? '#eab308' : '#22d3ee'} 
            strokeWidth="2" 
            className="transition-all duration-75"
          />
          <path 
            d={`M 0 50 Q 50 ${50 + intensity} 100 50 T 200 50`} 
            fill="none" 
            stroke={status === 'listening' ? '#ef4444' : status === 'waking' ? '#eab308' : '#22d3ee'} 
            strokeWidth="1" 
            className="opacity-20 transition-all duration-150" 
          />
        </svg>

        <div className="text-center z-20">
          <p className="text-[9px] tracking-[0.6em] opacity-40 font-bold mb-1">NEURAL_LINK</p>
          <p className={`text-xl font-black tracking-widest uppercase transition-colors duration-300 
             ${status === 'listening' ? 'text-red-500' : status === 'waking' ? 'text-yellow-500 animate-pulse' : 'text-cyan-400'}`}>
            {status === 'idle' ? 'STANDBY' : status === 'waking' ? 'BOOTING' : status}
          </p>
        </div>
      </div>
    </div>
  )
}