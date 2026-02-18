import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = await createClient();

    // Check which tables exist
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public');

    if (tablesError) {
      return NextResponse.json(
        { error: tablesError.message },
        { status: 500 }
      );
    }

    // Check for products
    const { count: productsCount, error: productsError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });

    // Check for orders
    const { count: ordersCount, error: ordersError } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true });

    const expectedTables = [
      'profiles',
      'products',
      'regions',
      'region_inventory',
      'pickup_locations',
      'pickup_inventory',
      'delivery_fee_tiers',
      'delivery_slots',
      'orders',
      'order_items',
    ];

    const tableNames = tables?.map((t: any) => t.table_name) || [];
    const missingTables = expectedTables.filter(t => !tableNames.includes(t));

    return NextResponse.json({
      status: 'ok',
      tablesFound: tableNames.length,
      expectedTables: expectedTables.length,
      missingTables,
      tables: tableNames,
      productsCount: productsCount || 0,
      ordersCount: ordersCount || 0,
      migrationNeeded: missingTables.length > 0,
    });
  } catch (error: any) {
    console.error('DB status check error:', error);
    return NextResponse.json(
      { error: error.message || 'Status check failed' },
      { status: 500 }
    );
  }
}
