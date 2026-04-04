import { useState, useEffect, useRef } from 'react'

export default function App() {
  const [isListening, setIsListening] = useState(false)
  const [intensity, setIntensity] = useState(0)
  
  const mediaRecorderRef = useRef(null)
  const audioChunksRef = useRef([])
  const workerRef = useRef(null)
  const analyserRef = useRef(null)
  
  // Synchronous Locks to prevent the "Always On" leak
  const activeStreamRef = useRef(null) 
  const isMicLocked = useRef(false)
  const animationRef = useRef(null)

  useEffect(() => {
    // Fixed path: './worker.js' since it is in the same folder as App.jsx
    workerRef.current = new Worker(new URL('./worker.js', import.meta.url), { type: 'module' })
    
    workerRef.current.onmessage = (e) => {
      if (e.data.status === 'success') {
         console.log("AI Heard:", e.data.text)
         window.api?.executeVoiceCommand(e.data.text)
      } else if (e.data.status === 'error') {
         console.error("AI Crash:", e.data.message)
      }
    }

    if (window.api?.onReply) {
      window.api.onReply((replyText) => {
        const speech = new SpeechSynthesisUtterance(replyText)
        window.speechSynthesis.speak(speech)
      })
    }
    return () => workerRef.current?.terminate()
  }, [])

  const startMic = async () => {
    // SYNCHRONOUS LOCK: Blocks keyboard spam instantly
    if (isMicLocked.current || activeStreamRef.current) return; 
    isMicLocked.current = true;
    setIsListening(true);
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      activeStreamRef.current = stream

      const audioCtx = new window.AudioContext()
      const source = audioCtx.createMediaStreamSource(stream)
      analyserRef.current = audioCtx.createAnalyser()
      analyserRef.current.fftSize = 64
      source.connect(analyserRef.current)
      
      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount)
      const loop = () => {
        analyserRef.current?.getByteFrequencyData(dataArray)
        const avg = dataArray.reduce((a, b) => a + b) / dataArray.length
        setIntensity(avg)
        animationRef.current = requestAnimationFrame(loop)
      }
      loop()

      const recorder = new MediaRecorder(stream)
      recorder.ondataavailable = (e) => audioChunksRef.current.push(e.data)
      recorder.onstop = async () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/wav' })
        audioChunksRef.current = [] 
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
      console.error("Mic Access Denied:", err)
      isMicLocked.current = false;
      setIsListening(false);
    }
  }

  const stopMic = () => {
    if (!isMicLocked.current) return;
    isMicLocked.current = false;
    setIsListening(false);
    
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
    }
    
    // HARDWARE KILL SWITCH: Loops through all tracks and physically cuts power
    if (activeStreamRef.current) {
        activeStreamRef.current.getTracks().forEach(track => track.stop())
        activeStreamRef.current = null
    }
    
    cancelAnimationFrame(animationRef.current)
    setIntensity(0)
  }

  useEffect(() => {
    if (window.api?.onStartListening) {
       window.api.onStartListening(() => startMic())
    }

    const handleKeyUp = (e) => {
      if (e.code === 'Space') stopMic()
    }
    
    window.addEventListener('keyup', handleKeyUp)
    return () => window.removeEventListener('keyup', handleKeyUp)
  }, [])

  return (
    <div className={`fixed top-0 left-0 w-full flex flex-col items-center justify-start transition-all duration-300 ${isListening ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0'}`}>
      <div className="absolute top-0 w-[600px] h-32 bg-[#020b13]/90 backdrop-blur-md rounded-b-[40px] border-b border-cyan-500/30 shadow-[0_10px_50px_rgba(6,182,212,0.15)] -z-10" />
      <h1 className="mt-6 text-3xl font-medium tracking-widest text-cyan-50 drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]">Yes, Mon.</h1>
      <div className="flex items-center justify-center gap-1.5 mt-4 h-12">
        {[...Array(15)].map((_, i) => (
          <div key={i} className="w-1 bg-cyan-400 rounded-full transition-all duration-75 shadow-[0_0_8px_#22d3ee]"
               style={{ height: `${Math.min(4 + (intensity * (1 + (7 - Math.abs(7 - i)) * 0.3) * 0.5), 48)}px` }} />
        ))}
      </div>
    </div>
  )
}