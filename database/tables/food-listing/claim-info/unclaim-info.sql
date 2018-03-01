-- Keeps records of all unclaimed food listings.

CREATE TABLE IF NOT EXISTS UnclaimInfo
(
    unclaimInfoKey SERIAL PRIMARY KEY
);

ALTER TABLE UnclaimInfo ADD COLUMN IF NOT EXISTS claimInfoKey   INTEGER     NOT NULL REFERENCES ClaimInfo (claimInfoKey);

ALTER TABLE UnclaimInfo ADD COLUMN IF NOT EXISTS unclaimReason  TEXT        NOT NULL;

ALTER TABLE UnclaimInfo ADD COLUMN IF NOT EXISTS unclaimTime    TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP;

CREATE INDEX IF NOT EXISTS unclaimInfo_ClaimInfoKey ON UnclaimInfo (claimInfoKey);
