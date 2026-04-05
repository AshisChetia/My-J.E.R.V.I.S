import { useState, useEffect, useRef } from 'react'

export default function App() {
  const [isListening, setIsListening] = useState(false)
  
  // Hardware & Logic Locks
  const activeStreamRef = useRef(null)
  const workerRef = useRef(null)
  const mediaRecorderRef = useRef(null)
  const audioChunksRef = useRef([])
  const isPressingRef = useRef(false) 
  const animationRef = useRef(null)
  const lastSpokenRef = useRef(0)

  // Direct DOM Refs for 60fps Sci-Fi Animation
  const path1Ref = useRef(null)
  const path2Ref = useRef(null)
  const path3Ref = useRef(null)

  // 1. Setup Local AI Worker (The Ears)
  useEffect(() => {
    workerRef.current = new Worker(new URL('./worker.js', import.meta.url), { type: 'module' })
    
    workerRef.current.onmessage = (e) => {
      if (e.data.status === 'success') {
         // This sends your transcribed voice to the Gemma Brain in index.js
         window.api?.executeVoiceCommand(e.data.text)
      }
    }

    return () => workerRef.current?.terminate()
  }, [])

  // 2. Setup Text-to-Speech Listener (The Mouth) - FIXED
  useEffect(() => {
    const speakReply = (replyText) => {
      // Prevent stuttering
      const now = Date.now()
      if (now - lastSpokenRef.current < 2000) return; 
      lastSpokenRef.current = now;

      // Speak the reply
      window.speechSynthesis.cancel() 
      const speech = new SpeechSynthesisUtterance(replyText)
      speech.pitch = 0.8 // Deep voice
      speech.rate = 1.1
      window.speechSynthesis.speak(speech)
    }

    // Use your specific API connection
    if (window.api?.onReply) {
      window.api.onReply(speakReply)
    } else if (window.electron?.ipcRenderer) {
      // Fallback
      window.electron.ipcRenderer.on('jarvis-reply', (event, text) => speakReply(text))
    }

    return () => {
      if (window.electron?.ipcRenderer) {
        window.electron.ipcRenderer.removeAllListeners('jarvis-reply')
      }
    }
  }, [])

  // 3. Start Hardware & Animation
  const startMic = async () => {
    if (isPressingRef.current || activeStreamRef.current) return; 
    isPressingRef.current = true;
    setIsListening(true); 
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      
      if (!isPressingRef.current) {
         stream.getTracks().forEach(t => t.stop());
         setIsListening(false);
         return;
      }

      activeStreamRef.current = stream

      const audioCtx = new window.AudioContext()
      const source = audioCtx.createMediaStreamSource(stream)
      const analyser = audioCtx.createAnalyser()
      analyser.fftSize = 64
      source.connect(analyser)
      
      const dataArray = new Uint8Array(analyser.frequencyBinCount)
      
      // Bypasses React for buttery 60fps animation
      const loop = () => {
        analyser.getByteFrequencyData(dataArray)
        const avg = dataArray.reduce((a, b) => a + b) / dataArray.length
        const time = Date.now() / 150; 

        const generateSpikyMesh = (offset, multiplier) => {
          let d = "M 0 120 ";
          for (let i = 0; i <= 600; i += 10) { 
            const normX = i / 600;
            const envelope = Math.sin(normX * Math.PI); 
            const spike = Math.abs(Math.sin((normX * 25) - time + offset)); 
            const y = 120 - (spike * envelope * (avg * 1.2 * multiplier));
            d += `L ${i} ${y} `;
          }
          return d;
        }

        if (path1Ref.current) path1Ref.current.setAttribute('d', generateSpikyMesh(0, 0.6))
        if (path2Ref.current) path2Ref.current.setAttribute('d', generateSpikyMesh(2, 0.9))
        if (path3Ref.current) path3Ref.current.setAttribute('d', generateSpikyMesh(4, 1.3))

        animationRef.current = requestAnimationFrame(loop)
      }
      loop()

      // Record Audio locally to bypass Google
      const recorder = new MediaRecorder(stream)
      recorder.ondataavailable = (e) => audioChunksRef.current.push(e.data)
      
      recorder.onstop = async () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/wav' })
        audioChunksRef.current = [] 
        
        // Safely kill hardware after audio is secured
        if (activeStreamRef.current) {
            activeStreamRef.current.getTracks().forEach(track => track.stop())
            activeStreamRef.current = null
        }

        try {
            const decodeCtx = new window.AudioContext({ sampleRate: 16000 })
            const buffer = await blob.arrayBuffer()
            const decoded = await decodeCtx.decodeAudioData(buffer)
            workerRef.current?.postMessage({ audioData: decoded.getChannelData(0) })
        } catch (e) {
            console.error("Decode Error:", e)
        }
      }

      mediaRecorderRef.current = recorder
      recorder.start()

    } catch (err) {
      console.error("Mic Error:", err)
      isPressingRef.current = false;
      setIsListening(false);
    }
  }

  // 4. Stop Hardware
  const stopMic = () => {
    if (!isPressingRef.current) return;
    isPressingRef.current = false;
    setIsListening(false); 
    cancelAnimationFrame(animationRef.current)
    
    // Stop recording, which triggers recorder.onstop to send data to the AI
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
    }

    // Flatten the 3D wave instantly
    const flatPath = "M 0 120 L 600 120";
    if (path1Ref.current) path1Ref.current.setAttribute('d', flatPath)
    if (path2Ref.current) path2Ref.current.setAttribute('d', flatPath)
    if (path3Ref.current) path3Ref.current.setAttribute('d', flatPath)
  }

  // 5. Hotkeys
  useEffect(() => {
    if (window.api?.onStartListening) window.api.onStartListening(() => startMic())
    
    const handleKeyUp = (e) => {
      if (e.code === 'Space') stopMic()
    }
    
    window.addEventListener('keyup', handleKeyUp)
    return () => window.removeEventListener('keyup', handleKeyUp)
  }, [])

  return (
    <div className={`fixed inset-0 w-full h-full flex flex-col items-center justify-start pt-12 pointer-events-none transition-all duration-300 ease-out ${isListening ? 'translate-y-0 opacity-100 scale-100' : '-translate-y-10 opacity-0 scale-95'}`}>

      {/* Minimalist System Status */}
      <div className="flex items-center gap-3 mb-1 z-10 opacity-70">
        <div className="text-[10px] font-['Share_Tech_Mono'] text-red-500 tracking-tighter uppercase">Status: Uplink_Active</div>
        <div className="w-1.5 h-1.5 bg-red-600 rounded-full animate-ping" />
      </div>

      {/* Sharp AI Identity */}
      <div className="flex items-center mb-3 z-10">
        <h1 className="text-2xl font-['Orbitron'] font-black tracking-[0.3em] uppercase text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-orange-500 to-red-600 drop-shadow-[0_0_10px_rgba(220,38,38,0.7)]">
          Yes, Mon.
        </h1>
      </div>

      {/* The Compact "Blade" Mesh Wave */}
      <div className="relative z-10 w-[240px] h-[40px]">
        <svg className="w-full h-full overflow-visible" viewBox="0 0 600 120" preserveAspectRatio="none">
          <defs>
            <linearGradient id="mesh-grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#450a0a" /> 
              <stop offset="50%" stopColor="#ef4444" /> 
              <stop offset="100%" stopColor="#450a0a" />
            </linearGradient>
            <filter id="laser-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Background mesh shadow */}
          <path ref={path1Ref} d="M 0 120 L 600 120" fill="none" stroke="url(#mesh-grad)" strokeWidth="1" opacity="0.3" />
          {/* Main neon structure */}
          <path ref={path2Ref} d="M 0 120 L 600 120" fill="none" stroke="url(#mesh-grad)" strokeWidth="3" opacity="0.8" filter="url(#laser-glow)" />
          {/* White-hot laser core */}
          <path ref={path3Ref} d="M 0 120 L 600 120" fill="none" stroke="#fff" strokeWidth="1" opacity="0.9" filter="url(#laser-glow)" />
        </svg>
      </div>

      {/* HUD Meta-Data */}
      <div className="mt-3 text-[8px] font-['Share_Tech_Mono'] text-red-600/50 tracking-[0.4em] uppercase z-10">
        Trace_Route: 127.0.0.1 // encrypted.link
      </div>
      
    </div>
  )
}