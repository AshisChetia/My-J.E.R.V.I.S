import { contextBridge, ipcRenderer } from 'electron'

// Expose secure APIs to the renderer (React)
const api = {
  // Existing commands...
  executeVoiceCommand: (text) => ipcRenderer.send('execute-voice-command', text),
  onReply: (callback) => ipcRenderer.on('jarvis-reply', (_event, message) => callback(message)),
  
  // ADD THIS NEW LISTENER:
  onStartListening: (callback) => ipcRenderer.on('start-listening', () => callback())
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