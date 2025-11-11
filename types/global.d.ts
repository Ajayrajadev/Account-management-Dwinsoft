// Global type declarations for Electron API
declare global {
  interface Window {
    electronAPI?: {
      database: {
        getTransactions: (filters?: any) => Promise<any[]>;
        createTransaction: (transaction: any) => Promise<any>;
        updateTransaction: (id: string, transaction: any) => Promise<any>;
        deleteTransaction: (id: string) => Promise<void>;
        getInvoices: (filters?: any) => Promise<any[]>;
        createInvoice: (invoice: any) => Promise<any>;
        updateInvoice: (id: string, invoice: any) => Promise<any>;
        deleteInvoice: (id: string) => Promise<void>;
        getDashboardData: () => Promise<any>;
        exportData: () => Promise<any>;
        importData: (data: any) => Promise<void>;
      };
      
      files: {
        saveInvoicePDF: (invoiceData: any) => Promise<{ success: boolean; filePath?: string; cancelled?: boolean }>;
        exportBackup: () => Promise<{ success: boolean; filePath?: string; cancelled?: boolean }>;
        importBackup: () => Promise<{ success: boolean; filePath?: string; cancelled?: boolean; recordsImported?: any }>;
        openFile: (filePath: string) => Promise<{ success: boolean }>;
      };
      
      sync: {
        syncNow: () => Promise<any>;
        getSyncStatus: () => Promise<any>;
        setSyncSettings: (settings: any) => Promise<any>;
        getSyncSettings: () => Promise<any>;
      };
      
      app: {
        getInfo: () => Promise<{ name: string; version: string; platform: string }>;
        checkForUpdates: () => Promise<{ hasUpdate: boolean; version: string }>;
        quit: () => void;
        minimize: () => void;
        maximize: () => void;
      };
      
      settings: {
        get: (key: string) => Promise<string | null>;
        set: (key: string, value: string) => Promise<boolean>;
        getAll: () => Promise<Record<string, string>>;
      };
      
      security: {
        storeApiKey: (key: string) => Promise<boolean>;
        getApiKey: () => Promise<string | null>;
        removeApiKey: () => Promise<boolean>;
      };
      
      on: (channel: string, callback: (...args: any[]) => void) => void;
      removeAllListeners: (channel: string) => void;
    };
  }
}

export {};
