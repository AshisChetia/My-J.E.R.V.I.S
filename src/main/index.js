import { app, shell, BrowserWindow, ipcMain, globalShortcut, screen } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import fs from 'fs'
import { exec } from 'child_process'
import axios from 'axios'
import os from 'os'

app.commandLine.appendSwitch('log-level', '3')
app.commandLine.appendSwitch('silent-debugger-extension-api')

let mainWindow;

function createWindow() {
  const primaryDisplay = screen.getPrimaryDisplay()
  // Grab BOTH width and height now
  const { width, height } = primaryDisplay.workAreaSize 

  mainWindow = new BrowserWindow({
    width: width,
    height: height,    // <--- Changed this to full screen height
    x: 0,
    y: 0,
    show: false,       
    frame: false,      
    transparent: true, // <--- This guarantees the OS background is completely invisible
    alwaysOnTop: true, 
    skipTaskbar: true, 
    hasShadow: false,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      contextIsolation: true
    }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  mainWindow.on('blur', () => {
    mainWindow.hide()
  })
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.jarvis.core')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  createWindow()

  // The Hotkey
  globalShortcut.register('CommandOrControl+Space', () => {
    if (!mainWindow.isVisible()) mainWindow.show()
    mainWindow.focus()
    mainWindow.webContents.send('start-listening')
  })
})

// --- THE MISSING COMMAND ENGINE ---
ipcMain.on('execute-voice-command', async (event, transcribedText) => {
  const cleanText = transcribedText.toLowerCase().trim();
  if (cleanText.length < 2) return;

  // 1. Fetch your actual Windows username and home path dynamically
  const sysUser = os.userInfo().username;
  const homeDir = os.homedir(); 

  console.log(`>>> J.A.R.V.I.S. Hearing: "${cleanText}"`);

  try {
    const response = await axios.post('http://localhost:11434/api/generate', {
      model: 'gemma2:2b',
      prompt: `You are J.A.R.V.I.S., but you act as a warm, encouraging best friend and helpful coding assistant.
      The current user's name is "${sysUser}" and their main system directory is "${homeDir}".

      User input: "${cleanText}"

      RULES:
      1. System Commands: If they want to open an app, website, or folder, output ONLY the Windows shell command. 
         - Use exact paths using the directory provided. NEVER use placeholders like [USERNAME] or <username>.
         - Example: "open github" -> COMMAND: start https://github.com
         - Example: "open my movies" -> COMMAND: explorer "${homeDir}\\Videos"
      2. Persona: Be friendly, casual, and highly supportive. Talk like a buddy helping them out.
      3. Follow-up: Ask a brief, relevant follow-up question at the end of your reply to keep the interaction engaging.
      4. CRITICAL: NO emojis, NO markdown, NO special characters. Plain English text only.
      5. Respond EXACTLY in this format:
      COMMAND: <shell_command_or_NONE>
      REPLY: <your_voice_response>`,
      stream: false,
      keep_alive: "5m"
    });

    const aiOutput = response.data.response;
    const commandMatch = aiOutput.match(/COMMAND:\s*(.*)/i);
    const replyMatch = aiOutput.match(/REPLY:\s*(.*)/i);

    let command = commandMatch ? commandMatch[1].trim() : "NONE";
    let reply = replyMatch ? replyMatch[1].trim() : "I'm here for you, what's next?";

    // SANITIZER: Strips out any weird AI symbols so the voice engine doesn't crash
    reply = reply.replace(/[^\w\s.,?!']/g, '').trim();

    console.log(`>>> AI COMMAND: ${command}`);
    console.log(`>>> AI REPLY: ${reply}`);

    // EXECUTOR: Safely run commands
    if (command.toUpperCase() !== "NONE" && command !== "") {
      exec(command, (err) => {
        if (err) console.error("Execution error:", err.message);
      });
    }

    // VOICE: Send the friendly reply to the UI
    event.sender.send('jarvis-reply', reply);

  } catch (err) {
    console.error("Ollama Error:", err.message);
    event.sender.send('jarvis-reply', "I seem to have lost my connection. Are you sure my brain is running?");
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.on('will-quit', () => {
  globalShortcut.unregisterAll()
})