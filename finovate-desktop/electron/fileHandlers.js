const { ipcMain, dialog, shell } = require('electron');
const fs = require('fs').promises;
const path = require('path');
const { getDatabase } = require('./database');

function setupFileHandlers() {
  // PDF Export handler
  ipcMain.handle('file:save-invoice-pdf', async (event, invoiceData) => {
    try {
      const { filePath } = await dialog.showSaveDialog({
        title: 'Save Invoice as PDF',
        defaultPath: `Invoice-${invoiceData.invoiceNumber}.pdf`,
        filters: [
          { name: 'PDF Files', extensions: ['pdf'] }
        ]
      });

      if (filePath) {
        // Generate PDF content (simplified - in real app, use a PDF library like puppeteer or jsPDF)
        const pdfContent = generateInvoicePDF(invoiceData);
        await fs.writeFile(filePath, pdfContent);
        
        // Open the saved file
        shell.openPath(filePath);
        
        return { success: true, filePath };
      }
      
      return { success: false, cancelled: true };
    } catch (error) {
      console.error('Error saving invoice PDF:', error);
      throw error;
    }
  });

  // Backup export handler
  ipcMain.handle('file:export-backup', async () => {
    try {
      const { filePath } = await dialog.showSaveDialog({
        title: 'Export Backup',
        defaultPath: `finovate-backup-${new Date().toISOString().split('T')[0]}.json`,
        filters: [
          { name: 'JSON Files', extensions: ['json'] }
        ]
      });

      if (filePath) {
        const db = getDatabase();
        
        // Export all data
        const backupData = {
          transactions: db.prepare('SELECT * FROM transactions').all(),
          invoices: db.prepare('SELECT * FROM invoices').all().map(invoice => ({
            ...invoice,
            items: invoice.items ? JSON.parse(invoice.items) : []
          })),
          settings: db.prepare('SELECT * FROM settings').all(),
          exportDate: new Date().toISOString(),
          version: '1.0.0'
        };

        await fs.writeFile(filePath, JSON.stringify(backupData, null, 2));
        
        return { success: true, filePath };
      }
      
      return { success: false, cancelled: true };
    } catch (error) {
      console.error('Error exporting backup:', error);
      throw error;
    }
  });

  // Backup import handler
  ipcMain.handle('file:import-backup', async () => {
    try {
      const { filePaths } = await dialog.showOpenDialog({
        title: 'Import Backup',
        filters: [
          { name: 'JSON Files', extensions: ['json'] }
        ],
        properties: ['openFile']
      });

      if (filePaths && filePaths.length > 0) {
        const filePath = filePaths[0];
        const fileContent = await fs.readFile(filePath, 'utf8');
        const backupData = JSON.parse(fileContent);

        // Validate backup data structure
        if (!backupData.version || !backupData.transactions || !backupData.invoices) {
          throw new Error('Invalid backup file format');
        }

        const db = getDatabase();
        
        // Perform import in a transaction
        const transaction = db.transaction(() => {
          // Clear existing data
          db.prepare('DELETE FROM transactions').run();
          db.prepare('DELETE FROM invoices').run();
          db.prepare('DELETE FROM settings WHERE key NOT LIKE "sync_%"').run(); // Keep sync settings
          db.prepare('DELETE FROM sync_queue').run();

          // Import transactions
          const insertTransaction = db.prepare(`
            INSERT INTO transactions (id, type, amount, description, category, date, created_at, updated_at, synced, last_modified)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `);
          
          for (const trans of backupData.transactions) {
            insertTransaction.run(
              trans.id,
              trans.type,
              trans.amount,
              trans.description,
              trans.category,
              trans.date,
              trans.created_at || new Date().toISOString(),
              trans.updated_at || new Date().toISOString(),
              trans.synced || false,
              trans.last_modified || trans.updated_at || new Date().toISOString()
            );
          }

          // Import invoices
          const insertInvoice = db.prepare(`
            INSERT INTO invoices (
              id, invoice_number, client_name, client_email, client_address,
              amount, tax_amount, total_amount, status, issue_date, due_date,
              items, notes, created_at, updated_at, synced, last_modified
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `);
          
          for (const invoice of backupData.invoices) {
            insertInvoice.run(
              invoice.id,
              invoice.invoice_number || invoice.invoiceNumber,
              invoice.client_name || invoice.clientName,
              invoice.client_email || invoice.clientEmail,
              invoice.client_address || invoice.clientAddress,
              invoice.amount,
              invoice.tax_amount || invoice.taxAmount || 0,
              invoice.total_amount || invoice.totalAmount,
              invoice.status,
              invoice.issue_date || invoice.issueDate,
              invoice.due_date || invoice.dueDate,
              JSON.stringify(invoice.items || []),
              invoice.notes,
              invoice.created_at || new Date().toISOString(),
              invoice.updated_at || new Date().toISOString(),
              invoice.synced || false,
              invoice.last_modified || invoice.updated_at || new Date().toISOString()
            );
          }

          // Import settings (excluding sync settings)
          const insertSetting = db.prepare('INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES (?, ?, ?)');
          for (const setting of backupData.settings || []) {
            if (!setting.key.startsWith('sync_')) {
              insertSetting.run(setting.key, setting.value, setting.updated_at || new Date().toISOString());
            }
          }
        });

        transaction();
        
        return { success: true, filePath, recordsImported: {
          transactions: backupData.transactions.length,
          invoices: backupData.invoices.length,
          settings: (backupData.settings || []).filter(s => !s.key.startsWith('sync_')).length
        }};
      }
      
      return { success: false, cancelled: true };
    } catch (error) {
      console.error('Error importing backup:', error);
      throw error;
    }
  });

  // Open file handler
  ipcMain.handle('file:open', async (event, filePath) => {
    try {
      await shell.openPath(filePath);
      return { success: true };
    } catch (error) {
      console.error('Error opening file:', error);
      throw error;
    }
  });

  // Settings handlers
  ipcMain.handle('settings:get', async (event, key) => {
    try {
      const db = getDatabase();
      const result = db.prepare('SELECT value FROM settings WHERE key = ?').get(key);
      return result ? result.value : null;
    } catch (error) {
      console.error('Error getting setting:', error);
      return null;
    }
  });

  ipcMain.handle('settings:set', async (event, key, value) => {
    try {
      const db = getDatabase();
      const stmt = db.prepare('INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES (?, ?, ?)');
      stmt.run(key, String(value), new Date().toISOString());
      return true;
    } catch (error) {
      console.error('Error setting value:', error);
      throw error;
    }
  });

  ipcMain.handle('settings:get-all', async () => {
    try {
      const db = getDatabase();
      const settings = db.prepare('SELECT * FROM settings').all();
      const result = {};
      
      for (const setting of settings) {
        result[setting.key] = setting.value;
      }
      
      return result;
    } catch (error) {
      console.error('Error getting all settings:', error);
      return {};
    }
  });

  // Security handlers (placeholder for keychain integration)
  ipcMain.handle('security:store-api-key', async (event, apiKey) => {
    try {
      // TODO: Implement secure keychain storage
      // For now, store in settings (not recommended for production)
      const db = getDatabase();
      const stmt = db.prepare('INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES (?, ?, ?)');
      stmt.run('api_key_encrypted', apiKey, new Date().toISOString());
      return true;
    } catch (error) {
      console.error('Error storing API key:', error);
      throw error;
    }
  });

  ipcMain.handle('security:get-api-key', async () => {
    try {
      // TODO: Implement secure keychain retrieval
      const db = getDatabase();
      const result = db.prepare('SELECT value FROM settings WHERE key = ?').get('api_key_encrypted');
      return result ? result.value : null;
    } catch (error) {
      console.error('Error getting API key:', error);
      return null;
    }
  });

  ipcMain.handle('security:remove-api-key', async () => {
    try {
      const db = getDatabase();
      db.prepare('DELETE FROM settings WHERE key = ?').run('api_key_encrypted');
      return true;
    } catch (error) {
      console.error('Error removing API key:', error);
      throw error;
    }
  });
}

function generateInvoicePDF(invoiceData) {
  // Simplified PDF generation - in a real app, use a proper PDF library
  // This is just a placeholder that creates a text file
  const content = `
INVOICE

Invoice Number: ${invoiceData.invoiceNumber}
Date: ${invoiceData.issueDate}
Due Date: ${invoiceData.dueDate}

Bill To:
${invoiceData.clientName}
${invoiceData.clientEmail || ''}
${invoiceData.clientAddress || ''}

Items:
${invoiceData.items.map(item => 
  `${item.description} - Qty: ${item.quantity} - Rate: ₹${item.rate} - Amount: ₹${item.amount}`
).join('\n')}

Subtotal: ₹${invoiceData.amount}
Tax: ₹${invoiceData.taxAmount || 0}
Total: ₹${invoiceData.totalAmount}

Notes:
${invoiceData.notes || 'Thank you for your business!'}
`;

  return Buffer.from(content, 'utf8');
}

module.exports = {
  setupFileHandlers
};
