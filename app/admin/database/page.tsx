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

type MigrationStep = 'postgis' | 'schema';

export default function DatabaseMigrationPage() {
  const [postgisSQL, setPostgisSQL] = useState<string>('');
  const [schemaSQL, setSchemaSQL] = useState<string>('');
  const [dbStatus, setDbStatus] = useState<DBStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedStep, setCopiedStep] = useState<MigrationStep | null>(null);

  const loadMigrationSQL = async (step: MigrationStep) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/migrate?step=${step}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load migration SQL');
      }

      if (step === 'postgis') {
        setPostgisSQL(data.sql);
      } else {
        setSchemaSQL(data.sql);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const copyAndOpen = async (step: MigrationStep) => {
    const sql = step === 'postgis' ? postgisSQL : schemaSQL;
    try {
      await navigator.clipboard.writeText(sql);
      setCopiedStep(step);
      setTimeout(() => setCopiedStep(null), 3000);
      
      // Open SQL editor in new tab
      const projectRef = process.env.NEXT_PUBLIC_SUPABASE_URL?.split('//')[1]?.split('.')[0];
      window.open(`https://supabase.com/dashboard/project/${projectRef}/sql/new`, '_blank');
      
      // Show success message
      alert('✓ SQL copied to clipboard!\n\nPaste it in the Supabase SQL Editor tab that just opened (Ctrl+V or Cmd+V), then click Run.');
    } catch (err) {
      alert('Failed to copy to clipboard');
    }
  };

  const copyToClipboard = async (step: MigrationStep) => {
    try {
      const sql = step === 'postgis' ? postgisSQL : schemaSQL;
      await navigator.clipboard.writeText(sql);
      setCopiedStep(step);
      setTimeout(() => setCopiedStep(null), 2000);
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

          {/* IMPORTANT NOTE */}
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border-2 border-red-500 rounded-md">
            <h3 className="font-bold text-red-800 dark:text-red-300 mb-2">⚠️ TWO-STEP MIGRATION REQUIRED</h3>
            <p className="text-sm text-red-700 dark:text-red-400 mb-2">
              The migration must be run in <strong>TWO SEPARATE STEPS</strong> to avoid PostGIS errors:
            </p>
            <ol className="list-decimal list-inside text-sm text-red-700 dark:text-red-400 space-y-1 ml-4">
              <li><strong>STEP 1:</strong> Run PostGIS Setup first (enables PostGIS extension)</li>
              <li><strong>STEP 2:</strong> Run Schema Migration after Step 1 completes successfully</li>
            </ol>
          </div>

          {/* Step 1: PostGIS Setup */}
          <div className="rounded-lg border-2 border-blue-500 bg-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold">1</div>
              <h2 className="text-xl font-semibold">Step 1: PostGIS Setup</h2>
            </div>
            <p className="text-muted-foreground mb-6">
              Run this FIRST to enable PostGIS extension and verify it's working
            </p>

            {!postgisSQL ? (
              <button
                onClick={() => loadMigrationSQL('postgis')}
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Loading...' : 'Load PostGIS Setup SQL'}
              </button>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-blue-100 dark:bg-blue-900/30 border-2 border-blue-400 rounded-md">
                  <p className="text-blue-900 dark:text-blue-100 font-semibold mb-3">🚀 Quick Start (One Click):</p>
                  <button
                    onClick={() => copyAndOpen('postgis')}
                    className="w-full px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-semibold text-lg"
                  >
                    📋 Copy SQL & Open Editor →
                  </button>
                  <p className="text-sm text-blue-700 dark:text-blue-300 mt-2">
                    This will copy the SQL to your clipboard and open Supabase SQL Editor in a new tab. Just paste (Ctrl+V) and click Run!
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => copyToClipboard('postgis')}
                    className="px-6 py-2 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20"
                  >
                    {copiedStep === 'postgis' ? '✓ Copied!' : 'Copy SQL Only'}
                  </button>
                  <button
                    onClick={openSupabaseSQLEditor}
                    className="px-6 py-2 border border-border rounded-md hover:bg-accent"
                  >
                    Open Editor Only →
                  </button>
                  <button
                    onClick={() => setPostgisSQL('')}
                    className="px-6 py-2 border border-border rounded-md hover:bg-accent text-muted-foreground"
                  >
                    Close
                  </button>
                </div>

                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md text-sm">
                  <strong className="text-blue-800 dark:text-blue-300">After clicking the button above:</strong>
                  <ol className="list-decimal list-inside mt-2 space-y-1 text-blue-700 dark:text-blue-400">
                    <li>A new Supabase SQL Editor tab will open</li>
                    <li>The SQL is already copied to your clipboard</li>
                    <li>Paste it (Ctrl+V or Cmd+V) into the editor</li>
                    <li>Click "Run" or press Ctrl+Enter</li>
                    <li>Verify you see "PostGIS version 3.3" in the results</li>
                    <li><strong>Only proceed to Step 2 after this completes successfully</strong></li>
                  </ol>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">PostGIS Setup SQL ({postgisSQL.split('\n').length} lines)</label>
                  <textarea
                    readOnly
                    value={postgisSQL}
                    className="w-full h-48 font-mono text-xs bg-muted p-4 rounded-md border border-border"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Step 2: Schema Migration */}
          <div className="rounded-lg border-2 border-green-500 bg-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center font-bold">2</div>
              <h2 className="text-xl font-semibold">Step 2: Schema & Data Migration</h2>
            </div>
            <p className="text-muted-foreground mb-6">
              Run this AFTER Step 1 completes successfully. Creates all tables, RLS policies, and seeds sample data.
            </p>

            {!schemaSQL ? (
              <button
                onClick={() => loadMigrationSQL('schema')}
                disabled={loading}
                className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Loading...' : 'Load Schema Migration SQL'}
              </button>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-green-100 dark:bg-green-900/30 border-2 border-green-400 rounded-md">
                  <p className="text-green-900 dark:text-green-100 font-semibold mb-3">🚀 Quick Start (One Click):</p>
                  <button
                    onClick={() => copyAndOpen('schema')}
                    className="w-full px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 font-semibold text-lg"
                  >
                    📋 Copy SQL & Open Editor →
                  </button>
                  <p className="text-sm text-green-700 dark:text-green-300 mt-2">
                    This will copy the SQL to your clipboard and open Supabase SQL Editor. Just paste (Ctrl+V) and click Run!
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => copyToClipboard('schema')}
                    className="px-6 py-2 border border-green-600 text-green-600 rounded-md hover:bg-green-50 dark:hover:bg-green-900/20"
                  >
                    {copiedStep === 'schema' ? '✓ Copied!' : 'Copy SQL Only'}
                  </button>
                  <button
                    onClick={openSupabaseSQLEditor}
                    className="px-6 py-2 border border-border rounded-md hover:bg-accent"
                  >
                    Open Editor Only →
                  </button>
                  <button
                    onClick={() => setSchemaSQL('')}
                    className="px-6 py-2 border border-border rounded-md hover:bg-accent text-muted-foreground"
                  >
                    Close
                  </button>
                </div>

                <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md text-sm">
                  <strong className="text-green-800 dark:text-green-300">After clicking the button above:</strong>
                  <ol className="list-decimal list-inside mt-2 space-y-1 text-green-700 dark:text-green-400">
                    <li>Make sure Step 1 completed successfully first!</li>
                    <li>A new Supabase SQL Editor tab will open</li>
                    <li>The SQL is already copied to your clipboard</li>
                    <li>Paste it (Ctrl+V or Cmd+V) into the editor</li>
                    <li>Click "Run" or press Ctrl+Enter</li>
                    <li>Wait for completion (10-30 seconds)</li>
                    <li>Return here and click "Refresh Status" to verify all tables are created</li>
                  </ol>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Schema Migration SQL ({schemaSQL.split('\n').length} lines)</label>
                  <textarea
                    readOnly
                    value={schemaSQL}
                    className="w-full h-64 font-mono text-xs bg-muted p-4 rounded-md border border-border"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Error Display */}
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md text-red-600 dark:text-red-400">
              <strong>Error:</strong> {error}
            </div>
          )}

          {/* Information */}
          <div className="rounded-lg border bg-card p-6">
            <h2 className="text-xl font-semibold mb-4">Migration Information</h2>
            <div className="space-y-3 text-sm">
              <div>
                <strong>Step 1 (PostGIS Setup) includes:</strong>
                <ul className="list-disc list-inside ml-4 mt-2 space-y-1 text-muted-foreground">
                  <li>Enables PostGIS extension for geographic features</li>
                  <li>Enables UUID extension for unique identifiers</li>
                  <li>Verifies PostGIS is working correctly</li>
                  <li>Checks spatial reference system for SRID 4326 (WGS84)</li>
                </ul>
              </div>
              <div>
                <strong>Step 2 (Schema Migration) includes:</strong>
                <ul className="list-disc list-inside ml-4 mt-2 space-y-1 text-muted-foreground">
                  <li>Creates all database tables (profiles, products, orders, regions, etc.)</li>
                  <li>Sets up Row Level Security (RLS) policies</li>
                  <li>Creates authentication triggers for user profiles</li>
                  <li>Adds guest checkout support (nullable user_id)</li>
                  <li>Seeds 24 sample products across 4 categories</li>
                  <li>Creates spatial indexes for geography columns</li>
                  <li>Sets up inventory tracking tables</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Troubleshooting */}
          <div className="rounded-lg border bg-card p-6">
            <h2 className="text-xl font-semibold mb-4">Troubleshooting</h2>
            <div className="space-y-3 text-sm text-muted-foreground">
              <div>
                <strong className="text-foreground">If Step 1 fails:</strong>
                <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                  <li>Check that you're running in Supabase SQL Editor (not psql or other client)</li>
                  <li>Verify you have admin access to the database</li>
                  <li>Try running each line separately to identify the failing statement</li>
                </ul>
              </div>
              <div>
                <strong className="text-foreground">If Step 2 fails with "geometry column does not exist":</strong>
                <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                  <li>Make sure Step 1 completed successfully first</li>
                  <li>Verify PostGIS is enabled: Run <code className="bg-muted px-1">SELECT PostGIS_version();</code></li>
                  <li>Check extension is installed: Run <code className="bg-muted px-1">SELECT * FROM pg_extension WHERE extname = 'postgis';</code></li>
                  <li>If still failing, contact support with the exact error message</li>
                </ul>
              </div>
              <div>
                <strong className="text-foreground">If tables already exist:</strong>
                <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                  <li>The migration uses <code className="bg-muted px-1">IF NOT EXISTS</code> clauses - it's safe to re-run</li>
                  <li>Existing tables won't be modified or dropped</li>
                  <li>Sample data uses <code className="bg-muted px-1">ON CONFLICT DO NOTHING</code> to avoid duplicates</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
