const { app, BrowserWindow, Menu, Tray, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;
const { setupDatabase } = require('./database');
const { setupSyncService } = require('./sync');
const { setupFileHandlers } = require('./fileHandlers');

let mainWindow;
let tray;

// Enable live reload for Electron in development
if (isDev) {
  try {
    require('electron-reload')(__dirname, {
      electron: path.join(__dirname, '..', 'node_modules', '.bin', 'electron'),
      hardResetMethod: 'exit'
    });
  } catch (error) {
    console.log('electron-reload not available, continuing without live reload');
  }
}

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, 'assets', 'dwinsoftLogo_dark.png'),
    titleBarStyle: 'default',
    show: false
  });

  // Load the Next.js app
  const startUrl = isDev 
    ? 'http://localhost:3002' 
    : `file://${path.join(__dirname, '../.next/server/pages/index.html')}`;
  
  console.log('Loading URL:', startUrl, 'isDev:', isDev);
  mainWindow.loadURL(startUrl);

  // Show window when ready to prevent visual flash
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Open DevTools in development
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Handle external links
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
}

function createTray() {
  const trayIconPath = path.join(__dirname, 'assets', 'dwinsoftLogo_dark.png');
  
  // Check if tray icon exists, if not, skip tray creation
  if (!require('fs').existsSync(trayIconPath)) {
    console.log('Tray icon not found, skipping tray creation');
    return;
  }
  
  tray = new Tray(trayIconPath);

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Open Dashboard',
      click: () => {
        if (mainWindow) {
          mainWindow.show();
          mainWindow.webContents.send('navigate-to', '/dashboard');
        }
      }
    },
    {
      label: 'New Invoice',
      click: () => {
        if (mainWindow) {
          mainWindow.show();
          mainWindow.webContents.send('open-modal', 'invoice');
        }
      }
    },
    {
      label: 'Add Expense',
      click: () => {
        if (mainWindow) {
          mainWindow.show();
          mainWindow.webContents.send('open-modal', 'expense');
        }
      }
    },
    { type: 'separator' },
    {
      label: 'Sync Now',
      click: () => {
        mainWindow?.webContents.send('trigger-sync');
      }
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => {
        app.quit();
      }
    }
  ]);

  tray.setToolTip('Finovate Desktop - DwinSoft');
  tray.setContextMenu(contextMenu);

  // Show window on tray click
  tray.on('click', () => {
    if (mainWindow) {
      if (mainWindow.isVisible()) {
        mainWindow.hide();
      } else {
        mainWindow.show();
      }
    }
  });
}

// App event handlers
app.whenReady().then(async () => {
  // Initialize database
  await setupDatabase();
  
  // Setup IPC handlers
  setupFileHandlers();
  setupSyncService();
  
  // Create window and tray
  createWindow();
  try {
    createTray();
  } catch (error) {
    console.log('Failed to create tray, continuing without it:', error.message);
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  // Cleanup before quitting
  if (tray) {
    tray.destroy();
  }
});

// Security: Prevent new window creation
app.on('web-contents-created', (event, contents) => {
  contents.on('new-window', (event, navigationUrl) => {
    event.preventDefault();
    shell.openExternal(navigationUrl);
  });
});

// Auto-updater placeholder
ipcMain.handle('check-for-updates', async () => {
  // TODO: Implement auto-updater logic
  return { hasUpdate: false, version: app.getVersion() };
});

// App info
ipcMain.handle('get-app-info', () => {
  return {
    name: app.getName(),
    version: app.getVersion(),
    platform: process.platform
  };
});
