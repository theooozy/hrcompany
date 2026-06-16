import { NextResponse } from 'next/server';

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!serviceKey) {
    return NextResponse.json({ error: 'SUPABASE_SERVICE_ROLE_KEY not set' }, { status: 500 });
  }

  const sql = `
    ALTER TABLE inquiries ADD COLUMN IF NOT EXISTS simple_upload TEXT;
    ALTER TABLE inquiries ADD COLUMN IF NOT EXISTS preferred_channels TEXT;
  `;

  const resp = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': serviceKey,
      'Authorization': `Bearer ${serviceKey}`,
    },
    body: JSON.stringify({ sql }),
  });

  if (!resp.ok) {
    // Try alternative: use pg connection via supabase-js
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(supabaseUrl!, serviceKey);
    
    // Try to select simple_upload to check if it exists
    const { error: checkErr } = await supabase
      .from('inquiries')
      .select('simple_upload')
      .limit(1);
    
    if (checkErr && checkErr.message.includes('simple_upload')) {
      return NextResponse.json({ 
        message: 'Column simple_upload does not exist. Please add it manually via Supabase dashboard SQL editor: ALTER TABLE inquiries ADD COLUMN simple_upload TEXT;',
        check_error: checkErr.message
      }, { status: 400 });
    }
    
    return NextResponse.json({ message: 'Column may already exist or exec_sql RPC not available', rpc_status: resp.status });
  }

  return NextResponse.json({ success: true, message: 'Columns added successfully' });
}
