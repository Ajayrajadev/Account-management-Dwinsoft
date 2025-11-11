# Desktop Usage Examples

This document shows how to use the desktop-specific features of Finovate.

## Example: Creating an Invoice Offline and Syncing

```typescript
// In your React component
import { useDesktopInvoiceStore } from '@/store/desktopInvoiceStore';

function InvoiceExample() {
  const { createInvoice, exportInvoicePDF } = useDesktopInvoiceStore();

  const handleCreateAndExport = async () => {
    // 1. Create invoice (works offline)
    const invoice = await createInvoice({
      invoiceNumber: 'INV-001',
      clientName: 'Acme Corp',
      clientEmail: 'billing@acme.com',
      amount: 1000,
      totalAmount: 1080, // with tax
      status: 'pending',
      issueDate: '2024-01-15',
      dueDate: '2024-02-15',
      items: [
        {
          description: 'Web Development',
          quantity: 40,
          rate: 25,
          amount: 1000
        }
      ]
    });

    // 2. Export as PDF (desktop-only feature)
    const result = await exportInvoicePDF(invoice);
    if (result.success) {
      console.log('PDF saved to:', result.filePath);
    }

    // 3. Sync will happen automatically in background
    // or manually trigger sync
    if (window.electronAPI) {
      await window.electronAPI.sync.syncNow();
    }
  };

  return (
    <button onClick={handleCreateAndExport}>
      Create Invoice & Export PDF
    </button>
  );
}
```

## Example: Backup and Restore

```typescript
// Backup component
import { DesktopSyncStatus } from '@/components/DesktopSyncStatus';

function BackupExample() {
  const handleFullBackup = async () => {
    if (!window.electronAPI) return;

    try {
      // Export all data
      const data = await window.electronAPI.database.exportData();
      
      // Save to file
      const result = await window.electronAPI.files.exportBackup();
      
      if (result.success) {
        console.log('Backup saved:', result.filePath);
      }
    } catch (error) {
      console.error('Backup failed:', error);
    }
  };

  return (
    <div>
      <DesktopSyncStatus />
      <button onClick={handleFullBackup}>
        Create Full Backup
      </button>
    </div>
  );
}
```

## Example: Offline Transaction Management

```typescript
import { useDesktopTransactionStore } from '@/store/desktopTransactionStore';

function OfflineTransactions() {
  const { 
    createTransaction, 
    fetchTransactions, 
    transactions 
  } = useDesktopTransactionStore();

  const addExpense = async () => {
    // Works completely offline
    await createTransaction({
      type: 'debit',
      amount: 50.00,
      description: 'Coffee meeting',
      category: 'Business',
      date: new Date().toISOString().split('T')[0]
    });

    // Refresh local data
    await fetchTransactions();
  };

  return (
    <div>
      <h3>Offline Transactions ({transactions.length})</h3>
      <button onClick={addExpense}>Add Expense</button>
      
      {transactions.map(t => (
        <div key={t.id}>
          {t.description}: ${t.amount}
        </div>
      ))}
    </div>
  );
}
```

## Example: Sync Configuration

```typescript
function SyncSettings() {
  const [syncSettings, setSyncSettings] = useState(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    if (window.electronAPI) {
      const settings = await window.electronAPI.sync.getSyncSettings();
      setSyncSettings(settings);
    }
  };

  const updateSyncSettings = async (newSettings) => {
    if (window.electronAPI) {
      await window.electronAPI.sync.setSyncSettings({
        ...syncSettings,
        ...newSettings
      });
      await loadSettings();
    }
  };

  const enableSync = () => {
    updateSyncSettings({
      enabled: true,
      apiUrl: 'https://api.yourserver.com',
      apiKey: 'your-api-key',
      syncIntervalMinutes: 5,
      conflictResolution: 'server-wins'
    });
  };

  return (
    <div>
      <h3>Sync Configuration</h3>
      {syncSettings && (
        <div>
          <p>Enabled: {syncSettings.enabled ? 'Yes' : 'No'}</p>
          <p>API URL: {syncSettings.apiUrl}</p>
          <button onClick={enableSync}>Enable Sync</button>
        </div>
      )}
    </div>
  );
}
```

## Tray Icon Usage

The desktop app includes a system tray icon with quick actions:

- **Open Dashboard**: Brings the app to front and navigates to dashboard
- **New Invoice**: Opens invoice creation modal
- **Add Expense**: Opens expense creation modal
- **Sync Now**: Triggers immediate sync
- **Quit**: Closes the application

## File System Integration

### PDF Export
```typescript
// Export invoice as PDF
const result = await window.electronAPI.files.saveInvoicePDF(invoiceData);
// Opens system save dialog, saves file, and opens it
```

### Backup Management
```typescript
// Export backup
const backup = await window.electronAPI.files.exportBackup();

// Import backup
const restore = await window.electronAPI.files.importBackup();
```

## Offline-First Workflow

1. **Create Data Offline**: All CRUD operations work without internet
2. **Queue for Sync**: Changes are automatically queued
3. **Background Sync**: When online, changes sync automatically
4. **Conflict Resolution**: Handles conflicts based on settings
5. **Local Persistence**: All data stored in local SQLite database

## Security Features

### API Key Storage
```typescript
// Store API key securely (uses OS keychain)
await window.electronAPI.security.storeApiKey('your-api-key');

// Retrieve API key
const apiKey = await window.electronAPI.security.getApiKey();
```

### Settings Management
```typescript
// Store app settings
await window.electronAPI.settings.set('theme', 'dark');

// Get setting
const theme = await window.electronAPI.settings.get('theme');

// Get all settings
const allSettings = await window.electronAPI.settings.getAll();
```

## Development vs Production

### Development
- Hot reload enabled
- DevTools available
- Console logging active
- Debug mode features

### Production
- Optimized builds
- No DevTools
- Minimal logging
- Auto-updater enabled (placeholder)

## Platform-Specific Features

### macOS
- Native menu bar integration
- Dock icon with badge
- macOS-style notifications

### Windows
- System tray integration
- Windows notifications
- Start menu integration

### Linux
- System tray (where supported)
- Desktop file integration
- Package manager compatibility

This desktop version provides a complete offline-first experience while maintaining the ability to sync with your cloud infrastructure when needed.
