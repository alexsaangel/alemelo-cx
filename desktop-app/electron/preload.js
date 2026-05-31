const { contextBridge, ipcRenderer } = require('electron')

// Expõe API segura para o React
contextBridge.exposeInMainWorld('csmvAPI', {
  // Persistência de dados no disco
  getData: (key) => ipcRenderer.invoke('store:get', key),
  setData: (key, value) => ipcRenderer.invoke('store:set', key, value),
  deleteData: (key) => ipcRenderer.invoke('store:delete', key),
  clearData: () => ipcRenderer.invoke('store:clear'),
  
  // App
  getVersion: () => ipcRenderer.invoke('app:version'),
  exportData: (data) => ipcRenderer.invoke('app:export', data),
  importData: () => ipcRenderer.invoke('app:import'),
  
  // Eventos do menu
  onMenuExport: (cb) => ipcRenderer.on('menu:export', cb),
  onMenuImport: (cb) => ipcRenderer.on('menu:import', cb),
  
  // Detectar se está rodando no Electron
  isElectron: true
})
