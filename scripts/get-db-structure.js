const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://dijtowiohxvwdnvgprud.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRpanRvd2lvaHh2d2RudmdwcnVkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcyNzcyMTcsImV4cCI6MjA2Mjg1MzIxN30.dNAl6RJYfOLmn2s1BMOP2yMyJVD63S1ubGs3neyYCH0';

const supabase = createClient(supabaseUrl, supabaseKey);

async function getDatabaseStructure() {
  try {
    // Get all tables from information_schema
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .order('table_name');

    if (tablesError) {
      console.error('Error fetching tables:', tablesError);
      
      // Try alternative approach - list known tables
      console.log('\nKnown tables in the database:');
      const knownTables = [
        'users', 'properties', 'documents', 'leads', 'lead_interactions',
        'open_houses', 'clients', 'client_interactions', 'commissions',
        'property_analytics', 'bulk_upload_history', 'property_reports'
      ];
      
      for (const tableName of knownTables) {
        console.log(`\n=== Table: ${tableName} ===`);
        
        // Try to get one row to see structure
        const { data, error, status } = await supabase
          .from(tableName)
          .select('*')
          .limit(0);
          
        if (!error) {
          console.log(`Table exists and is accessible`);
        } else {
          console.log(`Error accessing table: ${error.message}`);
        }
      }
      return;
    }

    console.log('Tables in public schema:', tables);

    // For each table, get column information
    for (const table of tables) {
      const { data: columns, error: columnsError } = await supabase
        .from('information_schema.columns')
        .select('column_name, data_type, is_nullable, column_default')
        .eq('table_schema', 'public')
        .eq('table_name', table.table_name)
        .order('ordinal_position');

      if (columnsError) {
        console.error(`Error fetching columns for ${table.table_name}:`, columnsError);
        continue;
      }

      console.log(`\n=== Table: ${table.table_name} ===`);
      columns.forEach(col => {
        console.log(`  ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? 'NOT NULL' : ''} ${col.column_default ? `DEFAULT ${col.column_default}` : ''}`);
      });
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

getDatabaseStructure();