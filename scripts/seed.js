const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load .env.local
const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...vals] = trimmed.split('=');
      if (key && vals.length) {
        process.env[key.trim()] = vals.join('=').trim();
      }
    }
  });
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be defined in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDatabase() {
  console.log(`Checking connection to Supabase (${supabaseUrl})...`);

  const tables = ['students', 'teachers', 'subjects', 'attendance', 'grades', 'fee_invoices', 'bus_routes', 'announcements'];
  const status = {};

  for (const table of tables) {
    const { data, error } = await supabase.from(table).select('count', { count: 'exact', head: true });
    if (error) {
      status[table] = { ready: false, error: error.message };
    } else {
      status[table] = { ready: true };
    }
  }

  console.log('\nTable Readiness Status:');
  console.table(status);

  const missing = Object.entries(status).filter(([_, s]) => !s.ready);

  if (missing.length > 0) {
    console.log('\n⚠️ Notice: Some tables have not been created yet in PostgreSQL.');
    console.log('👉 Please open Supabase SQL Editor and execute: supabase/schema.sql');
    console.log(`🔗 Direct link: https://supabase.com/dashboard/project/lpbzuhukaiwhkwfpxkui/sql\n`);
  } else {
    console.log('\n✅ All tables exist and are ready in Supabase!');
  }
}

checkDatabase().catch(console.error);

