-- D1 schema for jesunahmadushno.com (Cloudflare free tier). Apply: npx wrangler d1 execute jesun --file=schema.sql
CREATE TABLE IF NOT EXISTS briefs (id TEXT PRIMARY KEY, created_at TEXT NOT NULL, name TEXT NOT NULL, email TEXT NOT NULL, type TEXT, budget TEXT, timeline TEXT, message TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS guestbook (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, note TEXT NOT NULL, created_at TEXT NOT NULL, hidden INTEGER NOT NULL DEFAULT 0);
CREATE TABLE IF NOT EXISTS rate (k TEXT NOT NULL, bucket TEXT NOT NULL, hour TEXT NOT NULL, n INTEGER NOT NULL, PRIMARY KEY (k, bucket, hour));
CREATE TABLE IF NOT EXISTS visits (day TEXT NOT NULL, k TEXT NOT NULL, PRIMARY KEY (day, k));
CREATE TABLE IF NOT EXISTS counters (name TEXT PRIMARY KEY, n INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS trap_hits (at TEXT NOT NULL, k TEXT NOT NULL, ua TEXT, path TEXT);
-- Retention: briefs kept until Jesun deletes them; rate and visits rows older than 30 days are purged by the API itself (functions/_lib.js purgeOld), about once every 50 requests.
