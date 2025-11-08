import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  const { data, error } = await supabase.from('config').select('*').limit(1);
  if (error) {
    console.error('❌ Error:', error.message);
  } else {
    console.log('✅ Connected to Supabase successfully!');
  }
}

testConnection();
