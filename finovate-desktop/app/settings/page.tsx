'use client';

import { PageShell } from '@/components/PageShell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { Separator } from '@/components/ui/separator';
import { useState, useEffect } from 'react';

export default function SettingsPage() {
  const [theme, setTheme] = useState('system');

  useEffect(() => {
    const savedTheme = localStorage.getItem('finovate-theme') || 'system';
    setTheme(savedTheme);
  }, []);

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    localStorage.setItem('finovate-theme', newTheme);
    
    const root = document.documentElement;
    if (newTheme === 'dark') {
      root.classList.add('dark');
    } else if (newTheme === 'light') {
      root.classList.remove('dark');
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  };

  const handleExport = (type: 'transactions' | 'invoices') => {
    toast.info(`Export ${type} feature - connect to your export API`);
    // In a real app, you would implement CSV/Excel export
  };

  return (
    <PageShell
      title="Settings"
      description="Manage your account settings and preferences"
    >
      <div className="space-y-6">
        {/* Appearance */}
        <Card className="shadow-md hover:shadow-lg transition-shadow duration-200 border-neutral-200 rounded-xl">
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>
              Customize the appearance of the application
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Theme</Label>
              <Select value={theme} onValueChange={handleThemeChange}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select theme" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Separator />

        {/* Account */}
        <Card className="shadow-md hover:shadow-lg transition-shadow duration-200 border-neutral-200 rounded-xl">
          <CardHeader>
            <CardTitle>Account</CardTitle>
            <CardDescription>
              Manage your account information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" placeholder="Your name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="your@email.com" />
            </div>
            <Button>Save Changes</Button>
          </CardContent>
        </Card>

        <Separator />

        {/* Data Export */}
        <Card className="shadow-md hover:shadow-lg transition-shadow duration-200 border-neutral-200 rounded-xl">
          <CardHeader>
            <CardTitle>Data Export</CardTitle>
            <CardDescription>
              Export your data in various formats
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                variant="outline"
                onClick={() => handleExport('transactions')}
              >
                Export Transactions (CSV)
              </Button>
              <Button
                variant="outline"
                onClick={() => handleExport('invoices')}
              >
                Export Invoices (CSV)
              </Button>
            </div>
          </CardContent>
        </Card>

        <Separator />

        {/* API Configuration */}
        <Card className="shadow-md hover:shadow-lg transition-shadow duration-200 border-neutral-200 rounded-xl">
          <CardHeader>
            <CardTitle>API Configuration</CardTitle>
            <CardDescription>
              Configure API endpoints and settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="apiUrl">API Base URL</Label>
              <Input
                id="apiUrl"
                placeholder="http://localhost:3000/api"
                defaultValue={process.env.NEXT_PUBLIC_API_URL || ''}
              />
              <p className="text-sm text-muted-foreground">
                Set the NEXT_PUBLIC_API_URL environment variable to configure the API base URL
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}

