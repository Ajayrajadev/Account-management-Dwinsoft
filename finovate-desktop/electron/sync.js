const { ipcMain } = require('electron');
const { getDatabase } = require('./database');

let syncInterval;
let syncSettings = {
  enabled: false,
  apiUrl: '',
  apiKey: '',
  syncIntervalMinutes: 5,
  conflictResolution: 'server-wins'
};

function setupSyncService() {
  console.log('Sync service setup - simplified version');
  setupSyncHandlers();
  return Promise.resolve();
}

function setupSyncHandlers() {
  // Simplified sync handlers
  ipcMain.handle('sync:get-settings', async () => {
    return syncSettings;
  });

  ipcMain.handle('sync:update-settings', async (event, settings) => {
    syncSettings = { ...syncSettings, ...settings };
    return syncSettings;
  });

  ipcMain.handle('sync:start', async () => {
    console.log('Sync started (mock)');
    return { success: true, message: 'Sync started' };
  });

  ipcMain.handle('sync:stop', async () => {
    console.log('Sync stopped (mock)');
    return { success: true, message: 'Sync stopped' };
  });

  ipcMain.handle('sync:status', async () => {
    return {
      isRunning: false,
      lastSync: null,
      nextSync: null,
      status: 'idle'
    };
  });
}

module.exports = {
  setupSyncService
};
