import { app, BrowserWindow, dialog, ipcMain, shell } from 'electron'
import { join } from 'path'
import { IPC } from '../shared/types'
import type { LauncherSettings } from '../shared/types'
import { runLaunchSequence } from './launchSequence'
import { loadSettings, saveSettings } from './settings'
import { detectBlackOps3Path } from './steamDetect'
import { checkT7Update } from './t7UpdateCheck'

const gotSingleInstanceLock = app.requestSingleInstanceLock()
if (!gotSingleInstanceLock) {
  app.quit()
}

// Windows' native window-occlusion tracking can misdetect this window as
// covered/inactive and throttle its repaints, leaving stale content on
// screen. Disabling it keeps the renderer painting normally at all times.
app.commandLine.appendSwitch('disable-features', 'CalculateNativeWinOcclusion')

process.on('uncaughtException', (error) => {
  console.log(`[main] uncaughtException: ${error.stack ?? error.message}`)
})

let mainWindow: BrowserWindow | null = null

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1180,
    height: 760,
    minWidth: 960,
    minHeight: 640,
    show: false,
    autoHideMenuBar: true,
    backgroundColor: '#0a0908',
    titleBarStyle: 'hidden',
    titleBarOverlay: {
      color: '#0a0908',
      symbolColor: '#e8654a',
      height: 36
    },
    webPreferences: {
      preload: join(__dirname, '../preload/index.mjs'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow?.show()
  })

  // Fallback in case 'ready-to-show' never fires (e.g. no compositor/GPU available).
  setTimeout(() => {
    if (mainWindow && !mainWindow.isVisible()) {
      mainWindow.show()
    }
  }, 2500)

  mainWindow.webContents.on('render-process-gone', (_event, details) => {
    console.log(`[main] renderer process gone: ${JSON.stringify(details)}`)
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (!app.isPackaged && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.on('second-instance', () => {
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore()
    mainWindow.focus()
  }
})

function registerIpcHandlers(): void {
  ipcMain.handle(IPC.GetSettings, () => loadSettings())

  ipcMain.handle(IPC.SaveSettings, (_event, settings: LauncherSettings) =>
    saveSettings(settings)
  )

  ipcMain.handle(IPC.BrowseExe, async (_event, title: string) => {
    if (!mainWindow) return null
    const result = await dialog.showOpenDialog(mainWindow, {
      title,
      filters: [
        { name: 'Executable', extensions: ['exe'] },
        { name: 'All files', extensions: ['*'] }
      ],
      properties: ['openFile']
    })
    if (result.canceled || result.filePaths.length === 0) return null
    return result.filePaths[0]
  })

  ipcMain.handle(IPC.DetectBo3, () => detectBlackOps3Path())

  ipcMain.handle(IPC.StartLaunch, async () => {
    if (!mainWindow) return { success: false, message: 'Window not ready.' }
    const settings = loadSettings()
    return runLaunchSequence(mainWindow, settings)
  })

  ipcMain.handle(IPC.OpenExternal, (_event, url: string) => {
    if (url.startsWith('https://')) {
      shell.openExternal(url)
    }
  })

  ipcMain.handle(IPC.GetAppVersion, () => app.getVersion())

  ipcMain.handle(IPC.CheckT7Update, () => {
    const settings = loadSettings()
    if (!settings.t7PatchPath) {
      return { updateAvailable: false, latestLabel: null, releaseUrl: '' }
    }
    return checkT7Update(settings.t7PatchPath)
  })
}

app.whenReady().then(() => {
  registerIpcHandlers()
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
