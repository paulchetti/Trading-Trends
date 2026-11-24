import assert from 'node:assert/strict';
import { execFile as execFileCallback } from 'node:child_process';
import { createServer } from 'node:http';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import { test } from 'node:test';

const execFile = promisify(execFileCallback);

test('JSON export migration imports the main store and refuses accidental overwrite', async () => {
  let storedRow = null;
  const mockSupabase = createServer(async (req, res) => {
    const url = new URL(req.url, 'http://localhost');
    res.setHeader('Content-Type', 'application/json');

    if (req.method === 'GET' && url.pathname === '/rest/v1/app_store') {
      res.end(JSON.stringify(storedRow ? [{ id: 'main_store' }] : []));
      return;
    }

    if (req.method === 'POST' && url.pathname === '/rest/v1/app_store') {
      let body = '';
      for await (const chunk of req) body += chunk;
      storedRow = JSON.parse(body);
      res.statusCode = 201;
      res.end('[]');
      return;
    }

    res.statusCode = 404;
    res.end(JSON.stringify({ message: 'not found' }));
  });

  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'supabase-migration-'));
  const exportFile = path.join(tempDir, 'app-store.json');
  const scriptFile = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'scripts', 'migrate-to-supabase.js');
  await fs.writeFile(exportFile, JSON.stringify([{
    _id: 'main_store',
    users: [{ email: 'migration-test@example.test' }],
    transactions: [],
    kycSubmissions: []
  }]));
  await new Promise(resolve => mockSupabase.listen(0, '127.0.0.1', resolve));

  const { port } = mockSupabase.address();
  const env = {
    ...process.env,
    SUPABASE_URL: `http://127.0.0.1:${port}`,
    SUPABASE_SERVICE_ROLE_KEY: 'test-secret-key',
    SUPABASE_IMPORT_FILE: exportFile
  };
  const runMigration = () => execFile(process.execPath, [scriptFile], {
    cwd: path.join(path.dirname(fileURLToPath(import.meta.url)), '..'),
    env
  });

  try {
    const result = await runMigration();
    assert.match(result.stdout, /Migrated 1 users and 0 transactions to Supabase/);
    assert.equal(storedRow.data.users[0].email, 'migration-test@example.test');
    await assert.rejects(runMigration(), /Supabase already contains app data/);
  } finally {
    await new Promise((resolve, reject) => {
      mockSupabase.close(err => err ? reject(err) : resolve());
    });
    await fs.unlink(exportFile);
    await fs.rmdir(tempDir);
  }
});
