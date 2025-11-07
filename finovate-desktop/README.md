# Finovate Desktop - Smart Account & Invoice Manager

A desktop application built with Electron + Next.js 14 for local-first financial management with offline support and cloud sync capabilities.

## Features

### 🖥️ Desktop-First Experience
- **Native Desktop App**: Built with Electron for Windows, macOS, and Linux
- **Offline-First**: Full functionality without internet connection
- **Local Database**: SQLite for fast, reliable local data storage
- **System Integration**: Tray icon, native file dialogs, and OS notifications

### 💾 Local-First Architecture
- **SQLite Database**: Embedded database in user data folder
- **Offline Support**: Create transactions and invoices while offline
- **Background Sync**: Automatic sync to remote API when online
- **Conflict Resolution**: Smart handling of sync conflicts

### 📊 Financial Management
- **Transaction Tracking**: Income and expense management
- **Invoice Generation**: Professional invoice creation and management
- **Dashboard Analytics**: Visual insights with charts and summaries
- **Category Management**: Organize transactions by categories

### 🔄 Sync & Backup
- **Cloud Sync**: Optional sync to remote PostgreSQL API
- **Backup & Restore**: Export/import data as JSON
- **Conflict Resolution**: Server-wins, client-wins, or user prompt options
- **Sync Queue**: Offline changes queued for sync when online

### 🔒 Security & Privacy
- **Local Encryption**: Optional database encryption
- **Secure API Keys**: OS keychain integration (placeholder)
- **IPC Security**: Secure communication between main and renderer processes
- **Local-Only Mode**: Option to disable cloud sync entirely

## Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone and Install**
```bash
cd finovate-desktop
npm install
```

2. **Development Mode**
```bash
# Start Next.js dev server and Electron
npm run dev
```

3. **Production Build**
```bash
# Build Next.js app
npm run build

# Package desktop app
npm run dist
```

## Project Structure

```
finovate-desktop/
├── app/                    # Next.js app directory
│   ├── dashboard/         # Dashboard page
│   ├── transactions/      # Transactions management
│   ├── invoices/         # Invoice management
│   └── settings/         # App settings
├── components/           # React components
├── electron/            # Electron main process
│   ├── main.js         # Main process entry
│   ├── preload.js      # Preload script (IPC bridge)
│   ├── database.js     # SQLite database handlers
│   ├── sync.js         # Cloud sync service
│   └── fileHandlers.js # File operations (PDF, backup)
├── store/              # Zustand state management
│   ├── desktopTransactionStore.ts
│   └── desktopInvoiceStore.ts
├── types/              # TypeScript declarations
└── dist/               # Built desktop apps
```

## Configuration

### Environment Variables

Create a `.env.local` file:

```env
# Optional: Remote API configuration
NEXT_PUBLIC_API_URL=https://your-api.com
NEXT_PUBLIC_API_KEY=your-api-key

# Database encryption (optional)
DB_ENCRYPTION_KEY=your-encryption-key

# Development
NODE_ENV=development
```

### Sync Settings

Configure cloud sync in the app settings:

- **API URL**: Your remote API endpoint
- **API Key**: Authentication token
- **Sync Interval**: How often to sync (minutes)
- **Conflict Resolution**: server-wins | client-wins | prompt-user

## Database Schema

### Tables

**transactions**
- `id` (TEXT PRIMARY KEY)
- `type` (TEXT: 'credit' | 'debit')
- `amount` (REAL)
- `description` (TEXT)
- `category` (TEXT)
- `date` (TEXT)
- `synced` (BOOLEAN)
- `last_modified` (TEXT)

**invoices**
- `id` (TEXT PRIMARY KEY)
- `invoice_number` (TEXT UNIQUE)
- `client_name` (TEXT)
- `client_email` (TEXT)
- `amount` (REAL)
- `status` (TEXT: 'pending' | 'paid')
- `issue_date` (TEXT)
- `due_date` (TEXT)
- `items` (TEXT: JSON)
- `synced` (BOOLEAN)
- `last_modified` (TEXT)

**sync_queue**
- `id` (INTEGER PRIMARY KEY)
- `table_name` (TEXT)
- `record_id` (TEXT)
- `operation` (TEXT: 'create' | 'update' | 'delete')
- `data` (TEXT: JSON)
- `synced` (BOOLEAN)

## API Integration

### Sync Endpoints

The app expects these API endpoints for sync:

```
GET  /api/transactions?since=2023-01-01T00:00:00.000Z
POST /api/transactions
PUT  /api/transactions/:id
DELETE /api/transactions/:id

GET  /api/invoices?since=2023-01-01T00:00:00.000Z
POST /api/invoices
PUT  /api/invoices/:id
DELETE /api/invoices/:id
```

### Sync Process

1. **Push Local Changes**: Send unsynced local changes to server
2. **Pull Remote Changes**: Fetch server changes since last sync
3. **Conflict Resolution**: Handle conflicts based on settings
4. **Update Sync Status**: Mark records as synced

## Desktop Features

### Tray Icon Actions
- Open Dashboard
- New Invoice
- Add Expense
- Sync Now
- Quit

### File Operations
- **PDF Export**: Save invoices as PDF files
- **Backup Export**: Export all data as JSON
- **Backup Import**: Restore data from JSON backup
- **File Access**: Open exported files in default applications

### Keyboard Shortcuts
- `Cmd/Ctrl + N`: New Transaction
- `Cmd/Ctrl + I`: New Invoice
- `Cmd/Ctrl + S`: Sync Now
- `Cmd/Ctrl + E`: Export Backup
- `Cmd/Ctrl + ,`: Settings

## Build & Distribution

### Development Build
```bash
npm run dev          # Start dev server
npm run dev:next     # Next.js only
npm run dev:electron # Electron only
```

### Production Build
```bash
npm run build        # Build Next.js app
npm run pack         # Package without installer
npm run dist         # Create installer/DMG
```

### Platform-Specific Builds
```bash
# macOS
npm run dist -- --mac

# Windows
npm run dist -- --win

# Linux
npm run dist -- --linux
```

## Security Considerations

### IPC Security
- Context isolation enabled
- Node integration disabled
- Secure preload script with limited API exposure

### Data Security
- Local SQLite database in user data folder
- Optional database encryption
- API keys stored in OS keychain (placeholder)
- No sensitive data in renderer process

### Network Security
- HTTPS-only API communication
- Token-based authentication
- Request validation and sanitization

## Troubleshooting

### Common Issues

**Database locked error**
```bash
# Stop all Electron processes
pkill -f electron
# Restart the app
npm run dev
```

**Sync conflicts**
- Check sync settings in app
- Verify API endpoint connectivity
- Review conflict resolution strategy

**Build errors**
```bash
# Clear build cache
rm -rf .next dist
npm run build
```

### Debug Mode

Enable debug logging:
```bash
DEBUG=finovate:* npm run dev
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

For issues and questions:
- GitHub Issues: [Create an issue]
- Email: support@finovate.com
- Documentation: [Wiki]

---

**Finovate Desktop** - Professional financial management for desktop users.
