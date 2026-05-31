const { app, BrowserWindow, Menu, shell, dialog, ipcMain } = require('electron')
const path = require('path')
const Store = require('electron-store')

// ── STORE DE DADOS (persiste em disco) ────────────────────
const store = new Store({
  name: 'csmv-data',
  encryptionKey: 'alemelo-cx-csmv-2025'
})

const isDev = process.env.NODE_ENV === 'development'
const isMac = process.platform === 'darwin'

let mainWindow

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 900,
    minHeight: 600,
    title: 'CS Mínimo Viável — @alemelo_cx',
    backgroundColor: '#1A0C12',
    titleBarStyle: isMac ? 'hiddenInset' : 'default',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, '../assets/icon.png')
  })

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173')
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  }

  mainWindow.on('closed', () => { mainWindow = null })
}

// ── IPC: comunicação com o React ──────────────────────────
ipcMain.handle('store:get', (_, key) => store.get(key))
ipcMain.handle('store:set', (_, key, value) => { store.set(key, value); return true })
ipcMain.handle('store:delete', (_, key) => { store.delete(key); return true })
ipcMain.handle('store:clear', () => { store.clear(); return true })
ipcMain.handle('app:version', () => app.getVersion())
ipcMain.handle('app:export', async (_, data) => {
  const { filePath } = await dialog.showSaveDialog(mainWindow, {
    title: 'Exportar dados CS Dashboard',
    defaultPath: `csmv-backup-${new Date().toISOString().split('T')[0]}.json`,
    filters: [{ name: 'JSON', extensions: ['json'] }]
  })
  if (filePath) {
    require('fs').writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8')
    return { success: true, path: filePath }
  }
  return { success: false }
})
ipcMain.handle('app:import', async () => {
  const { filePaths } = await dialog.showOpenDialog(mainWindow, {
    title: 'Importar dados CS Dashboard',
    filters: [{ name: 'JSON', extensions: ['json'] }],
    properties: ['openFile']
  })
  if (filePaths && filePaths[0]) {
    const raw = require('fs').readFileSync(filePaths[0], 'utf-8')
    return { success: true, data: JSON.parse(raw) }
  }
  return { success: false }
})

// ── MENU ──────────────────────────────────────────────────
function buildMenu() {
  const template = [
    ...(isMac ? [{ label: app.name, submenu: [
      { role: 'about', label: 'Sobre CS Mínimo Viável' },
      { type: 'separator' },
      { role: 'services' }, { type: 'separator' },
      { role: 'hide' }, { role: 'hideOthers' }, { role: 'unhide' },
      { type: 'separator' }, { role: 'quit', label: 'Sair' }
    ]}] : []),
    {
      label: 'Arquivo',
      submenu: [
        { label: 'Exportar dados...', accelerator: 'CmdOrCtrl+E', click: () => mainWindow.webContents.send('menu:export') },
        { label: 'Importar dados...', accelerator: 'CmdOrCtrl+I', click: () => mainWindow.webContents.send('menu:import') },
        { type: 'separator' },
        isMac ? { role: 'close', label: 'Fechar' } : { role: 'quit', label: 'Sair' }
      ]
    },
    {
      label: 'Editar',
      submenu: [
        { role: 'undo', label: 'Desfazer' }, { role: 'redo', label: 'Refazer' },
        { type: 'separator' },
        { role: 'cut', label: 'Recortar' }, { role: 'copy', label: 'Copiar' }, { role: 'paste', label: 'Colar' }
      ]
    },
    {
      label: 'Visualizar',
      submenu: [
        { role: 'reload', label: 'Recarregar' },
        { type: 'separator' },
        { role: 'zoomIn', label: 'Aumentar zoom' },
        { role: 'zoomOut', label: 'Diminuir zoom' },
        { role: 'resetZoom', label: 'Zoom padrão' },
        { type: 'separator' },
        { role: 'togglefullscreen', label: 'Tela cheia' }
      ]
    },
    {
      label: 'Ajuda',
      submenu: [
        { label: 'Site @alemelo_cx', click: () => shell.openExternal('https://alexsaangel.github.io/alemelo-cx/') },
        { label: 'Instagram @alemelo_cx', click: () => shell.openExternal('https://instagram.com/alemelo_cx') },
        { type: 'separator' },
        { label: `Versão ${app.getVersion()}`, enabled: false }
      ]
    }
  ]
  Menu.setApplicationMenu(Menu.buildFromTemplate(template))
}

app.whenReady().then(() => {
  createWindow()
  buildMenu()
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow() })
})

app.on('window-all-closed', () => { if (!isMac) app.quit() })
