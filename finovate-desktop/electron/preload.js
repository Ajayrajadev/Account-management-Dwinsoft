const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Database operations
  database: {
    // Transactions
    getTransactions: (filters) => ipcRenderer.invoke('db:get-transactions', filters),
    createTransaction: (transaction) => ipcRenderer.invoke('db:create-transaction', transaction),
    updateTransaction: (id, transaction) => ipcRenderer.invoke('db:update-transaction', id, transaction),
    deleteTransaction: (id) => ipcRenderer.invoke('db:delete-transaction', id),
    
    // Invoices
    getInvoices: (filters) => ipcRenderer.invoke('db:get-invoices', filters),
    createInvoice: (invoice) => ipcRenderer.invoke('db:create-invoice', invoice),
    updateInvoice: (id, invoice) => ipcRenderer.invoke('db:update-invoice', id, invoice),
    deleteInvoice: (id) => ipcRenderer.invoke('db:delete-invoice', id),
    
    // Dashboard data
    getDashboardData: () => ipcRenderer.invoke('db:get-dashboard-data'),
    
    // Backup & Restore
    exportData: () => ipcRenderer.invoke('db:export-data'),
    importData: (data) => ipcRenderer.invoke('db:import-data', data),
  },

  // File operations
  files: {
    saveInvoicePDF: (invoiceData) => ipcRenderer.invoke('file:save-invoice-pdf', invoiceData),
    exportBackup: () => ipcRenderer.invoke('file:export-backup'),
    importBackup: () => ipcRenderer.invoke('file:import-backup'),
    openFile: (filePath) => ipcRenderer.invoke('file:open', filePath),
  },

  // Sync operations
  sync: {
    syncNow: () => ipcRenderer.invoke('sync:sync-now'),
    getSyncStatus: () => ipcRenderer.invoke('sync:get-status'),
    setSyncSettings: (settings) => ipcRenderer.invoke('sync:set-settings', settings),
    getSyncSettings: () => ipcRenderer.invoke('sync:get-settings'),
  },

  // App operations
  app: {
    getInfo: () => ipcRenderer.invoke('get-app-info'),
    checkForUpdates: () => ipcRenderer.invoke('check-for-updates'),
    quit: () => ipcRenderer.send('app:quit'),
    minimize: () => ipcRenderer.send('app:minimize'),
    maximize: () => ipcRenderer.send('app:maximize'),
  },

  // Event listeners
  on: (channel, callback) => {
    const validChannels = [
      'navigate-to',
      'open-modal',
      'trigger-sync',
      'sync-status-changed',
      'update-available'
    ];
    if (validChannels.includes(channel)) {
      ipcRenderer.on(channel, callback);
    }
  },

  // Remove event listeners
  removeAllListeners: (channel) => {
    ipcRenderer.removeAllListeners(channel);
  },

  // Settings
  settings: {
    get: (key) => ipcRenderer.invoke('settings:get', key),
    set: (key, value) => ipcRenderer.invoke('settings:set', key, value),
    getAll: () => ipcRenderer.invoke('settings:get-all'),
  },

  // Security
  security: {
    storeApiKey: (key) => ipcRenderer.invoke('security:store-api-key', key),
    getApiKey: () => ipcRenderer.invoke('security:get-api-key'),
    removeApiKey: () => ipcRenderer.invoke('security:remove-api-key'),
  }
});

// Expose a limited set of Node.js APIs
contextBridge.exposeInMainWorld('nodeAPI', {
  platform: process.platform,
  versions: process.versions,
  env: {
    NODE_ENV: process.env.NODE_ENV
  }
});
