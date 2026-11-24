import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { test } from 'node:test';

test('Supabase writes are awaited and failed writes surface to callers', async () => {
  let storedRow = null;
  let failWrites = false;
  const mockSupabase = createServer(async (req, res) => {
    const url = new URL(req.url, 'http://localhost');
    res.setHeader('Content-Type', 'application/json');

    if (req.method === 'GET' && url.pathname === '/rest/v1/app_store') {
      res.end(JSON.stringify(storedRow ? [{ data: storedRow.data }] : []));
      return;
    }

    if (req.method === 'POST' && url.pathname === '/rest/v1/app_store') {
      let body = '';
      for await (const chunk of req) body += chunk;

      if (failWrites) {
        res.statusCode = 503;
        res.end(JSON.stringify({ message: 'temporary database outage' }));
        return;
      }

      const payload = JSON.parse(body);
      storedRow = Array.isArray(payload) ? payload[0] : payload;
      res.statusCode = 201;
      res.end('[]');
      return;
    }

    res.statusCode = 404;
    res.end(JSON.stringify({ message: 'not found' }));
  });

  await new Promise(resolve => mockSupabase.listen(0, '127.0.0.1', resolve));
  const { port } = mockSupabase.address();
  const originalEnv = {
    nodeEnv: process.env.NODE_ENV,
    supabaseUrl: process.env.SUPABASE_URL,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY
  };

  try {
    const database = await import('../database.js');
    process.env.NODE_ENV = 'production';
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    await assert.rejects(database.initDatabase(), /required in production/);

    process.env.NODE_ENV = 'test';
    process.env.SUPABASE_URL = `http://127.0.0.1:${port}`;
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key';
    await assert.rejects(database.initDatabase(), /app_store is empty/);

    storedRow = {
      id: 'main_store',
      data: {
        users: [],
        transactions: [],
        kycSubmissions: [],
        settings: {},
        botConfig: {},
        botTrades: [],
        supportMessages: []
      }
    };
    await database.initDatabase();

    database.createUser({
      username: 'not-yet-persisted',
      email: 'not-yet-persisted@example.test',
      password: 'test-password',
      status: 'PENDING_VERIFICATION'
    });

    failWrites = true;
    await assert.rejects(database.flushDatabase(), /temporary database outage/);
    assert.match(database.getDatabaseStatus().lastDatabaseError, /temporary database outage/);

    failWrites = false;
    database.createUser({
      username: 'persisted',
      email: 'persisted@example.test',
      password: 'test-password',
      status: 'PENDING_VERIFICATION'
    });
    await database.flushDatabase();

    assert.ok(storedRow.data.users.some(user => user.email === 'not-yet-persisted@example.test'));
    assert.ok(storedRow.data.users.some(user => user.email === 'persisted@example.test'));
    assert.equal(database.getDatabaseStatus().lastDatabaseError, null);
  } finally {
    if (originalEnv.nodeEnv === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = originalEnv.nodeEnv;
    if (originalEnv.supabaseUrl === undefined) delete process.env.SUPABASE_URL;
    else process.env.SUPABASE_URL = originalEnv.supabaseUrl;
    if (originalEnv.serviceRoleKey === undefined) delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    else process.env.SUPABASE_SERVICE_ROLE_KEY = originalEnv.serviceRoleKey;
    await new Promise((resolve, reject) => {
      mockSupabase.close(err => err ? reject(err) : resolve());
    });
  }
});
