import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function POST() {
  try {
    // Read the migration file
    const migrationPath = path.join(process.cwd(), 'scripts', '000_full_migration.sql');
    const migrationSQL = await fs.readFile(migrationPath, 'utf-8');

    return NextResponse.json({
      message: 'Migration SQL ready',
      sql: migrationSQL,
      instructions: 'Copy this SQL and run it in your Supabase SQL Editor',
    });
  } catch (error: any) {
    console.error('Migration error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to read migration file' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return POST();
}
