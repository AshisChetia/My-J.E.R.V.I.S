import { useState, useEffect, useRef } from 'react'

export default function EtherealMic({ onStatusChange }) {
  const [status, setStatus] = useState('idle')
  const [intensity, setIntensity] = useState(0)
  
  const mediaRecorderRef = useRef(null)
  const audioChunksRef = useRef([])
  const workerRef = useRef(null)
  const analyserRef = useRef(null)
  const streamRef = useRef(null)
  const animationFrameRef = useRef(null)

  useEffect(() => { onStatusChange?.(status) }, [status])

  useEffect(() => {
    workerRef.current = new Worker(new URL('../worker.js', import.meta.url), { type: 'module' })
    workerRef.current.onmessage = (e) => {
      if (e.data.status === 'success') window.api?.executeVoiceCommand(e.data.text)
    }
    if (window.api?.onReply) window.api.onReply(() => setStatus('idle'))
    return () => workerRef.current?.terminate()
  }, [])

  const startListening = async () => {
    try {
      setStatus('waking')
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream

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

      const recorder = new MediaRecorder(stream)
      recorder.ondataavailable = (e) => audioChunksRef.current.push(e.data)
      recorder.onstop = async () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/wav' })
        audioChunksRef.current = [] 
        
        try {
          const buffer = await blob.arrayBuffer()
          // Strict 16kHz forcing for Whisper AI
          const audioContext = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 16000 });
          const decoded = await audioContext.decodeAudioData(buffer)
          workerRef.current?.postMessage({ audioData: decoded.getChannelData(0) })
        } catch (error) { console.error("Audio Decode Error:", error) }

        stream.getTracks().forEach(t => t.stop())
        analyserRef.current = null
        setIntensity(0)
      }

      mediaRecorderRef.current = recorder
      recorder.start()
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
    } else if (status === 'waking') {
      setStatus('idle')
    }
  }

  // Pre-calculated base heights to create that "hanging" equalizer shape
  const baseHeights = [30, 45, 60, 90, 130, 180, 130, 90, 60, 45, 30];

  return (
    <div 
      onMouseDown={startListening} 
      onMouseUp={stopListening}
      onMouseLeave={stopListening}
      className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer select-none"
    >
      {/* VERTICAL HANGING VISUALIZER */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 flex items-start justify-center gap-1.5 h-64 opacity-80 pointer-events-none">
        {baseHeights.map((base, i) => {
           // Center bars react more aggressively to voice intensity
           const dynamicHeight = status === 'listening' 
              ? base + (intensity * (1 + (5 - Math.abs(5 - i)) * 0.2)) 
              : base;
              
           return (
             <div 
               key={i} 
               className={`w-1.5 rounded-b-full transition-all duration-75 ease-out
                 ${status === 'listening' ? 'bg-gradient-to-b from-purple-500 to-cyan-400' : 
                   status === 'waking' ? 'bg-gradient-to-b from-yellow-500/50 to-yellow-300/20' : 
                   'bg-gradient-to-b from-purple-500/20 to-cyan-500/5'}`}
               style={{ height: `${dynamicHeight}px` }} 
             />
           )
        })}
      </div>

      {/* CENTER TEXT */}
      <div className="text-center z-10 mt-16">
        <h2 className={`text-6xl font-medium tracking-tight mb-4 transition-all duration-300 ${status === 'listening' ? 'text-white' : 'text-gray-400'}`}>
          {status === 'idle' ? 'Standby...' : 
           status === 'waking' ? 'Booting...' : 
           status === 'processing' ? 'Processing...' : 
           'Yes, Mon'}
           {status === 'listening' && <span className="animate-pulse">.</span>}
        </h2>
        
        <p className="text-xs tracking-[0.2em] uppercase font-bold text-cyan-600/80">
          Ethereal OS Assistant Active
        </p>
      </div>
    </div>
  )
}