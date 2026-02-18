'use client';

import { useState } from 'react';

interface DBStatus {
  status: string;
  tablesFound: number;
  expectedTables: number;
  missingTables: string[];
  tables: string[];
  productsCount: number;
  ordersCount: number;
  migrationNeeded: boolean;
}

export default function DatabaseMigrationPage() {
  const [migrationSQL, setMigrationSQL] = useState<string>('');
  const [dbStatus, setDbStatus] = useState<DBStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const loadMigrationSQL = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/migrate');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load migration SQL');
      }

      setMigrationSQL(data.sql);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(migrationSQL);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      alert('Failed to copy to clipboard');
    }
  };

  const openSupabaseSQLEditor = () => {
    const projectRef = process.env.NEXT_PUBLIC_SUPABASE_URL?.split('//')[1]?.split('.')[0];
    window.open(`https://supabase.com/dashboard/project/${projectRef}/sql/new`, '_blank');
  };

  const checkStatus = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/db-status');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Status check failed');
      }

      setDbStatus(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Database Administration</h1>

        <div className="grid gap-6">
          {/* Database Status */}
          <div className="rounded-lg border bg-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Database Status</h2>
              <button
                onClick={checkStatus}
                disabled={loading}
                className="px-4 py-2 border border-border rounded-md hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                {loading ? 'Checking...' : 'Refresh Status'}
              </button>
            </div>

            {dbStatus && (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 rounded-lg bg-muted">
                    <div className="text-2xl font-bold">{dbStatus.tablesFound}</div>
                    <div className="text-sm text-muted-foreground">Tables Found</div>
                  </div>
                  <div className="p-4 rounded-lg bg-muted">
                    <div className="text-2xl font-bold">{dbStatus.productsCount}</div>
                    <div className="text-sm text-muted-foreground">Products</div>
                  </div>
                  <div className="p-4 rounded-lg bg-muted">
                    <div className="text-2xl font-bold">{dbStatus.ordersCount}</div>
                    <div className="text-sm text-muted-foreground">Orders</div>
                  </div>
                </div>

                {dbStatus.migrationNeeded && (
                  <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
                    <strong className="text-yellow-800 dark:text-yellow-300">Migration Needed</strong>
                    <p className="text-sm mt-1 text-yellow-700 dark:text-yellow-400">
                      Missing tables: {dbStatus.missingTables.join(', ')}
                    </p>
                  </div>
                )}

                {!dbStatus.migrationNeeded && (
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
                    <strong className="text-green-800 dark:text-green-300">✓ Database Ready</strong>
                    <p className="text-sm mt-1 text-green-700 dark:text-green-400">
                      All required tables are present
                    </p>
                  </div>
                )}
              </div>
            )}

            {!dbStatus && !error && (
              <p className="text-muted-foreground">Click "Refresh Status" to check database</p>
            )}
          </div>

          {/* Migration Controls */}
          <div className="rounded-lg border bg-card p-6">
            <h2 className="text-xl font-semibold mb-4">Run Migration</h2>
            <p className="text-muted-foreground mb-6">
              Load the migration SQL and run it in Supabase SQL Editor
            </p>

            {error && (
              <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md text-red-600 dark:text-red-400">
                <strong>Error:</strong> {error}
              </div>
            )}

            {!migrationSQL ? (
              <button
                onClick={loadMigrationSQL}
                disabled={loading}
                className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Loading...' : 'Load Migration SQL'}
              </button>
            ) : (
              <div className="space-y-4">
                <div className="flex gap-3">
                  <button
                    onClick={copyToClipboard}
                    className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                  >
                    {copied ? '✓ Copied!' : 'Copy SQL'}
                  </button>
                  <button
                    onClick={openSupabaseSQLEditor}
                    className="px-6 py-2 border border-border rounded-md hover:bg-accent"
                  >
                    Open Supabase SQL Editor →
                  </button>
                  <button
                    onClick={() => setMigrationSQL('')}
                    className="px-6 py-2 border border-border rounded-md hover:bg-accent text-muted-foreground"
                  >
                    Close
                  </button>
                </div>

                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md text-sm">
                  <strong className="text-blue-800 dark:text-blue-300">Instructions:</strong>
                  <ol className="list-decimal list-inside mt-2 space-y-1 text-blue-700 dark:text-blue-400">
                    <li>Click "Copy SQL" above</li>
                    <li>Click "Open Supabase SQL Editor" to open a new tab</li>
                    <li>Paste the SQL into the editor (Ctrl+V or Cmd+V)</li>
                    <li>Click "Run" or press Ctrl+Enter to execute</li>
                    <li>Come back here and click "Refresh Status" to verify</li>
                  </ol>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Migration SQL ({migrationSQL.split('\n').length} lines)</label>
                  <textarea
                    readOnly
                    value={migrationSQL}
                    className="w-full h-64 font-mono text-xs bg-muted p-4 rounded-md border border-border"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Information */}
          <div className="rounded-lg border bg-card p-6">
            <h2 className="text-xl font-semibold mb-4">Migration Information</h2>
            <div className="space-y-3 text-sm">
              <div>
                <strong>What this migration does:</strong>
                <ul className="list-disc list-inside ml-4 mt-2 space-y-1 text-muted-foreground">
                  <li>Enables PostGIS extension for geographic features</li>
                  <li>Creates all database tables (products, orders, regions, etc.)</li>
                  <li>Sets up Row Level Security (RLS) policies</li>
                  <li>Creates authentication triggers for user profiles</li>
                  <li>Adds guest checkout support</li>
                  <li>Seeds 24 sample products</li>
                  <li>Configures storage buckets</li>
                </ul>
              </div>
              
              <div className="pt-3 border-t">
                <strong>Safe to run multiple times:</strong>
                <p className="text-muted-foreground mt-1">
                  The migration uses <code className="bg-muted px-1 rounded">IF NOT EXISTS</code> and 
                  <code className="bg-muted px-1 rounded ml-1">ON CONFLICT</code> clauses to avoid duplicates.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
