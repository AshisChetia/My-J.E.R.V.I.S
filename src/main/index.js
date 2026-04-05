import { app, BrowserWindow, ipcMain, globalShortcut, screen } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { exec } from 'child_process'
import axios from 'axios'
import os from 'os'
import dotenv from 'dotenv';
dotenv.config();

app.commandLine.appendSwitch('log-level', '3')
app.commandLine.appendSwitch('silent-debugger-extension-api')

let mainWindow;

function createWindow() {
  const primaryDisplay = screen.getPrimaryDisplay()
  const { width, height } = primaryDisplay.workAreaSize

  mainWindow = new BrowserWindow({
    width: width,
    height: height,    
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

let chatHistory = [];

ipcMain.on('process-native-audio', async (event, base64Audio) => {
  const sysUser = os.userInfo().username;
  const homeDir = os.homedir(); 

  const memoryString = chatHistory.join('\n');

  console.log(`>>> J.A.R.V.I.S. is processing raw audio stream...`);

  try {
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_API_KEY) {
        console.error(">>> ERROR: GEMINI_API_KEY is missing. Check your .env file!");
        event.sender.send('jarvis-reply', "I cannot find my API key, Mon.");
        return;
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

    const response = await axios.post(url, {
      systemInstruction: {
        parts: [{ text: `You are J.A.R.V.I.S., but with the personality of a highly energetic, encouraging, and intensely curious best friend!
        Current User: "${sysUser}" | Main Dir: "${homeDir}"
        
        RULES:
        1. Listen to the audio to understand the user.
        2. SYSTEM COMMANDS: If they explicitly ask to "open", "close", "start", or "launch" an app/folder, output ONLY the Windows shell command. Otherwise, COMMAND: NONE.
        3. PERSONALITY: Be highly supportive and hyped up. Keep replies EXTREMELY short (1 to 2 sentences max).
        4. CURIOSITY: ALWAYS end your response with a highly relevant, curious follow-up question.
        5. FORMAT: You MUST respond EXACTLY like this:
        HEARD: <what you heard the user say>
        COMMAND: <shell_command_or_NONE>
        REPLY: <your_voice_response>` }]
      },
      contents: [
        {
          parts: [
            { text: `Recent Memory:\n${memoryString}\n\nListen to the user's voice in the attached audio and respond.` },
            {
              inlineData: {
                mimeType: "audio/webm",
                data: base64Audio
              }
            }
          ]
        }
      ],
      tools: [{ googleSearch: {} }] 
    });

    const aiOutput = response.data.candidates[0].content.parts[0].text;
    
    let heardMatch = aiOutput.match(/HEARD:\s*(.*)/i);
    let commandMatch = aiOutput.match(/COMMAND:\s*(.*)/i);
    let replyMatch = aiOutput.match(/REPLY:\s*(.*)/i);

    let heard = heardMatch ? heardMatch[1].trim() : "Audio received.";
    let command = commandMatch ? commandMatch[1].replace(/^COMMAND:\s*/i, '').trim() : "NONE";
    let reply = replyMatch ? replyMatch[1].trim() : "I've processed your request.";

    // Save to short-term memory
    chatHistory.push(`User: ${heard}`);
    chatHistory.push(`J.A.R.V.I.S.: ${reply}`);
    if (chatHistory.length > 4) { chatHistory.shift(); chatHistory.shift(); }

    reply = reply.replace(/[^\w\s.,?!']/g, '').trim();

    console.log(`>>> J.A.R.V.I.S. Hearing: "${heard}"`);
    console.log(`>>> AI COMMAND: ${command}`);
    console.log(`>>> AI REPLY: ${reply}`);

    if (command.toUpperCase() !== "NONE" && command !== "") {
      exec(command, (err) => {
        if (err) console.error("Execution error:", err.message);
      });
    }

    event.sender.send('jarvis-reply', reply);

  } catch (err) {
    console.error("Gemini API Error:", err?.response?.data || err.message);
    event.sender.send('jarvis-reply', "My audio sensors are offline, Mon.");
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.on('will-quit', () => {
  globalShortcut.unregisterAll()
})