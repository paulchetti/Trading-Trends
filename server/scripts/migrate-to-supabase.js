import 'dotenv/config';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';
import { MongoClient } from 'mongodb';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const storeFile = path.join(__dirname, '..', 'data', 'store.json');
const storeId = 'main_store';
const mongoUri = process.env.MONGODB_URI;
const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const overwrite = process.argv.includes('--overwrite');

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY before running this migration.');
}

let mongoClient;

try {
  let sourceStore;
  if (mongoUri) {
    mongoClient = new MongoClient(mongoUri, { serverSelectionTimeoutMS: 10000 });
    await mongoClient.connect();
    const sourceDocument = await mongoClient
      .db('NexoraTrading')
      .collection('app_store')
      .findOne({ _id: storeId });

    if (!sourceDocument) {
      throw new Error('The MongoDB app_store collection does not contain the main_store document.');
    }

    const { _id, ...storeData } = sourceDocument;
    sourceStore = storeData;
  } else {
    sourceStore = JSON.parse(await fs.readFile(storeFile, 'utf8'));
  }

  if (!Array.isArray(sourceStore.users) || !Array.isArray(sourceStore.transactions)) {
    throw new Error('The selected source does not contain valid users and transactions arrays.');
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
  if (!mongoUri) {
    console.log('Source: server/data/store.json');
  } else {
    console.log('Source: MongoDB NexoraTrading.app_store');
  }
} finally {
  if (mongoClient) {
    await mongoClient.close();
  }
}
