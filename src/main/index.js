import { app, shell, BrowserWindow, ipcMain, globalShortcut, screen } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import fs from 'fs'
import { exec } from 'child_process'

let mainWindow;

function createWindow() {
  const primaryDisplay = screen.getPrimaryDisplay()
  const { width } = primaryDisplay.workAreaSize

  mainWindow = new BrowserWindow({
    width: width,
    height: 200,       
    x: 0,
    y: 0,
    show: false,       
    frame: false,      
    transparent: true, 
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
ipcMain.on('execute-voice-command', (event, transcribedText) => {
  const cleanText = transcribedText.toLowerCase().replace(/[.,!?]/g, "").trim()
  console.log(`\n>>> J.A.R.V.I.S. HEARD: "${cleanText}"`)

  if (cleanText.length < 2) return;

  try {
    const commandsPath = join(__dirname, '../../commands.json')
    const commandsData = JSON.parse(fs.readFileSync(commandsPath, 'utf8'))
    let matched = false;

    for (const [key, cmd] of Object.entries(commandsData)) {
      const isMatch = cmd.keywords.some(keyword => cleanText.includes(keyword.toLowerCase()))
      
      if (isMatch) {
        console.log(`>>> EXECUTING ACTION: '${cmd.action}'`)
        exec(cmd.action, (error) => {
          if (error) console.error(`Command failed: ${error.message}`)
        })
        event.sender.send('jarvis-reply', cmd.reply)
        matched = true;
        break;
      }
    }
    if (!matched) console.log(">>> NO MATCH FOUND IN COMMANDS.JSON")

  } catch (err) {
    console.error(">>> ERROR READING COMMANDS.JSON:", err)
  }
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.on('will-quit', () => {
  globalShortcut.unregisterAll()
})