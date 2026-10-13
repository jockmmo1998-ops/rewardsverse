-- Operational indexes only: safe, additive, and idempotent.
CREATE INDEX IF NOT EXISTS users_created_at_idx ON users ("createdAt" DESC);
CREATE INDEX IF NOT EXISTS withdrawals_status_created_at_idx ON withdrawals (status, "createdAt" DESC);
CREATE INDEX IF NOT EXISTS postbacks_provider_created_at_idx ON postbacks (provider, "createdAt" DESC);
CREATE INDEX IF NOT EXISTS postback_logs_status_created_at_idx ON postback_logs (status, "createdAt" DESC);
CREATE INDEX IF NOT EXISTS offer_history_status_created_at_idx ON offer_history (status, "createdAt" DESC);
CREATE INDEX IF NOT EXISTS audit_logs_created_at_idx ON audit_logs ("createdAt" DESC);
