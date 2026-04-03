import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('api', {
  executeVoiceCommand: (text) => ipcRenderer.send('voice-command', text),
  
  // This function allows React to "listen" for the reply from the backend
  onReply: (callback) => {
    ipcRenderer.removeAllListeners('jarvis-reply'); // Clean up old listeners
    ipcRenderer.on('jarvis-reply', (_event, value) => callback(value));
  }
})