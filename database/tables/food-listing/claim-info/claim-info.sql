
CREATE TABLE IF NOT EXISTS ClaimInfo
(
    claimInfoKey SERIAL PRIMARY KEY
);

ALTER TABLE ClaimInfo ADD COLUMN IF NOT EXISTS receiverAppUserKey   INTEGER NOT NULL REFERENCES AppUser (appUserKey);
ALTER TABLE ClaimInfo ADD COLUMN IF NOT EXISTS foodListingKey       INTEGER NOT NULL REFERENCES FoodListing (foodListingKey);

ALTER TABLE ClaimInfo ADD COLUMN IF NOT EXISTS claimedDate          TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP;

CREATE INDEX IF NOT EXISTS claimInfo_ClaimedByAppUserKey    ON ClaimInfo (receiverAppUserKey);
CREATE INDEX IF NOT EXISTS claimInfo_FoodListingKey         ON ClaimInfo (foodListingKey);
