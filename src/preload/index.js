import { contextBridge, ipcRenderer } from 'electron'

// Expose secure APIs to the renderer (React)
const api = {
  executeVoiceCommand: (text) => ipcRenderer.send('execute-voice-command', text),
  
  onReply: (callback) => {
    ipcRenderer.removeAllListeners('jarvis-reply') // Deletes ghost listeners
    ipcRenderer.on('jarvis-reply', (_event, message) => callback(message))
  },
  
  onStartListening: (callback) => ipcRenderer.on('start-listening', () => callback()),

  // THIS WAS MISSING: The secure audio bridge for Gemini
  processNativeAudio: (base64Audio) => ipcRenderer.send('process-native-audio', base64Audio)
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  window.api = api
}