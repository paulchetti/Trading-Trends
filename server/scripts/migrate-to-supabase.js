import 'dotenv/config';
import fs from 'node:fs/promises';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';

const storeId = 'main_store';
const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const importFile = process.env.SUPABASE_IMPORT_FILE;
const overwrite = process.argv.includes('--overwrite');

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY before running this migration.');
}
if (!importFile) {
  throw new Error('Set SUPABASE_IMPORT_FILE to the path of your JSON data export.');
}

const sourceStore = await readStoreExport(path.resolve(importFile));
if (!Array.isArray(sourceStore.users) || !Array.isArray(sourceStore.transactions)) {
  throw new Error('The JSON export must contain valid users and transactions arrays.');
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});
const { data: existingRow, error: lookupError } = await supabase
  .from('app_store')
  .select('id')
  .eq('id', storeId)
  .maybeSingle();

if (lookupError) {
  throw new Error(`Could not check the Supabase destination: ${lookupError.message}`);
}
if (existingRow && !overwrite) {
  throw new Error('Supabase already contains app data. Use --overwrite only if replacing it is intentional.');
}

const { error: writeError } = await supabase
  .from('app_store')
  .upsert({ id: storeId, data: sourceStore, updated_at: new Date().toISOString() }, { onConflict: 'id' });

if (writeError) {
  throw new Error(`Supabase migration failed: ${writeError.message}`);
}

console.log(`Migrated ${sourceStore.users.length} users and ${sourceStore.transactions.length} transactions to Supabase.`);
console.log(`Also included ${Array.isArray(sourceStore.kycSubmissions) ? sourceStore.kycSubmissions.length : 0} KYC submissions.`);
console.log(`Source: ${path.basename(importFile)}`);

async function readStoreExport(filePath) {
  const contents = (await fs.readFile(filePath, 'utf8')).replace(/^\uFEFF/, '');
  let exportedData;
  try {
    exportedData = JSON.parse(contents);
  } catch (error) {
    const lines = contents.split(/\r?\n/).filter(line => line.trim());
    if (lines.length < 2) throw error;
    exportedData = lines.map(line => JSON.parse(line));
  }

  const documents = Array.isArray(exportedData) ? exportedData : [exportedData];
  const document = documents.find(item => item?._id === storeId || item?.id === storeId)
    || documents.find(item => Array.isArray(item?.users));
  const data = document?.data && typeof document.data === 'object' ? document.data : document;

  if (!data || typeof data !== 'object') {
    throw new Error('The JSON export does not contain the app_store document.');
  }

  const { _id, ...store } = data;
  return store;
}
