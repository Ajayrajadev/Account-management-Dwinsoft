'use client';

import { useEffect, useState } from 'react';

// Type guard for Electron environment
const isElectronEnvironment = (): boolean => {
  return typeof window !== 'undefined' && 
         'electronAPI' in window && 
         window.electronAPI !== undefined;
};
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Cloud, CloudOff, RefreshCw, Download, Upload, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface SyncStatus {
  enabled: boolean;
  lastSync: string | null;
  pendingItems: number;
  isOnline: boolean;
}

interface SyncResult {
  pushed: number;
  pulled: number;
  conflicts: number;
  errors: string[];
}

export function DesktopSyncStatus() {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    enabled: false,
    lastSync: null,
    pendingItems: 0,
    isOnline: false
  });
  const [syncing, setSyncing] = useState(false);
  const [isElectron, setIsElectron] = useState(false);

  useEffect(() => {
    // Check if we're in Electron environment
    const electronAvailable = isElectronEnvironment();
    setIsElectron(electronAvailable);

    if (electronAvailable) {
      loadSyncStatus();
      
      // Listen for sync status changes
      (window as any).electronAPI?.on('sync-status-changed', loadSyncStatus);
      
      return () => {
        (window as any).electronAPI?.removeAllListeners('sync-status-changed');
      };
    }
  }, []);

  const loadSyncStatus = async () => {
    if (!isElectron) return;
    
    try {
      const status = await (window as any).electronAPI?.sync.getSyncStatus();
      setSyncStatus(status);
    } catch (error) {
      console.error('Error loading sync status:', error);
    }
  };

  const handleSync = async () => {
    if (!isElectron) {
      toast.error('Sync is only available in the desktop app');
      return;
    }

    setSyncing(true);
    try {
      const result: SyncResult = await (window as any).electronAPI.sync.syncNow();
      
      if (result.errors.length > 0) {
        toast.error(`Sync completed with errors: ${result.errors.join(', ')}`);
      } else {
        toast.success(
          `Sync completed: ${result.pushed} pushed, ${result.pulled} pulled` +
          (result.conflicts > 0 ? `, ${result.conflicts} conflicts` : '')
        );
      }
      
      await loadSyncStatus();
    } catch (error) {
      console.error('Sync error:', error);
      toast.error('Sync failed: ' + (error as Error).message);
    } finally {
      setSyncing(false);
    }
  };

  const handleExportBackup = async () => {
    if (!isElectron) {
      toast.error('Backup export is only available in the desktop app');
      return;
    }

    try {
      const result = await (window as any).electronAPI.files.exportBackup();
      if (result.success) {
        toast.success(`Backup exported to: ${result.filePath}`);
      } else if (result.cancelled) {
        toast.info('Export cancelled');
      }
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Export failed: ' + (error as Error).message);
    }
  };

  const handleImportBackup = async () => {
    if (!isElectron) {
      toast.error('Backup import is only available in the desktop app');
      return;
    }

    try {
      const result = await (window as any).electronAPI.files.importBackup();
      if (result.success) {
        toast.success(
          `Backup imported: ${result.recordsImported?.transactions || 0} transactions, ` +
          `${result.recordsImported?.invoices || 0} invoices`
        );
        // Refresh the page to show imported data
        window.location.reload();
      } else if (result.cancelled) {
        toast.info('Import cancelled');
      }
    } catch (error) {
      console.error('Import error:', error);
      toast.error('Import failed: ' + (error as Error).message);
    }
  };

  if (!isElectron) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CloudOff className="h-5 w-5" />
            Desktop Features
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Desktop-specific features like sync and backup are only available in the Electron app.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {syncStatus.isOnline ? (
            <Cloud className="h-5 w-5 text-green-500" />
          ) : (
            <CloudOff className="h-5 w-5 text-gray-400" />
          )}
          Sync Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Sync Enabled:</span>
          <Badge variant={syncStatus.enabled ? 'default' : 'secondary'}>
            {syncStatus.enabled ? 'Yes' : 'No'}
          </Badge>
        </div>

        {syncStatus.lastSync && (
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Last Sync:</span>
            <span className="text-sm text-muted-foreground">
              {new Date(syncStatus.lastSync).toLocaleString()}
            </span>
          </div>
        )}

        {syncStatus.pendingItems > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Pending Items:</span>
            <Badge variant="outline" className="flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {syncStatus.pendingItems}
            </Badge>
          </div>
        )}

        <div className="flex flex-col gap-2">
          <Button
            onClick={handleSync}
            disabled={syncing || !syncStatus.enabled}
            className="w-full"
          >
            {syncing ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Syncing...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Sync Now
              </>
            )}
          </Button>

          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportBackup}
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleImportBackup}
            >
              <Upload className="h-4 w-4 mr-2" />
              Import
            </Button>
          </div>
        </div>

        {!syncStatus.isOnline && (
          <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
            <AlertCircle className="h-3 w-3 inline mr-1" />
            Offline mode: Changes will sync when connection is restored.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
