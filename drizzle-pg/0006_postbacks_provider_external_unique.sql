DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM postbacks
    GROUP BY provider, "externalId"
    HAVING COUNT(*) > 1
  ) THEN
    RAISE EXCEPTION 'Cannot add postbacks_provider_external_unique: duplicate provider/externalId rows exist';
  END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS postbacks_provider_external_unique
  ON postbacks (provider, "externalId");
