import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'

import fs from 'fs'
import path from 'path'
import { exec } from 'child_process'
import stringSimilarity from 'string-similarity'

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.electron')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // Catch the voice command from React
  ipcMain.on('voice-command', (event, text) => {
    processVoiceCommand(text)
  })

  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// --- J.A.R.V.I.S. BACKEND ENGINE ---

function getCommands() {
  try {
    // We check the root directory first
    const commandsPath = path.join(process.cwd(), 'commands.json')
    const rawData = fs.readFileSync(commandsPath)
    return JSON.parse(rawData)
  } catch (error) {
    console.error("CRITICAL: commands.json not found in root. Error:", error.message)
    return {}
  }
}

// Add BrowserWindow to your imports at the top

export function processVoiceCommand(transcribedText) {
  const cleanText = transcribedText.trim().replace(/\.$/, "").toLowerCase()
  const commands = getCommands()
  let allKeywords = []
  let keywordToDataMap = {}

  for (const [key, cmd] of Object.entries(commands)) {
    cmd.keywords.forEach(keyword => {
      allKeywords.push(keyword.toLowerCase())
      // We store the WHOLE command object now, so we can access the reply
      keywordToDataMap[keyword.toLowerCase()] = cmd 
    })
  }

  if (allKeywords.length === 0) return

  const match = stringSimilarity.findBestMatch(cleanText, allKeywords)
  const bestMatch = match.bestMatch

  if (bestMatch.rating > 0.4) {
    const matchedCommand = keywordToDataMap[bestMatch.target]
    const actionToRun = matchedCommand.action
    const replyText = matchedCommand.reply || "Command executed." // Fallback reply

    // --- THE FIX: Send the specific reply to the Frontend ---
    const win = BrowserWindow.getAllWindows()[0]; // Get the main window
    if (win) {
      win.webContents.send('jarvis-reply', replyText);
    }

    exec(actionToRun, (error) => {
      if (error) console.error(`Exec Error: ${error.message}`)
    })
  }
}