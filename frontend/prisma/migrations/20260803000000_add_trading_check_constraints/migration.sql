-- Backstop invariants enforced by Postgres on every write, independent of app code.
-- The Server Actions already guard these via conditional UPDATE ... WHERE, but a
-- future migration, admin script, or refactor that drops the guard must not be able
-- to leave a wallet or a position negative.

ALTER TABLE "User"
ADD CONSTRAINT "User_mockBalance_non_negative" CHECK ("mockBalance" >= 0);

ALTER TABLE "Holding"
ADD CONSTRAINT "Holding_shares_non_negative" CHECK ("shares" >= 0);