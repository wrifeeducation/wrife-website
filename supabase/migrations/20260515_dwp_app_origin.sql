-- Add 'dwp' to the app_origin check constraint on home_accounts
-- (or whichever table the direct_signup_framework uses app_origin on).
-- Per wrife-brand-ecosystem skill — DWP is a full WriFe sub-app alongside PWP and IP.

-- Drop the old constraint and recreate with 'dwp' included.
-- home_accounts.app_origin is used to record which sub-app a direct sign-up came from.
ALTER TABLE home_accounts
  DROP CONSTRAINT IF EXISTS home_accounts_app_origin_check;

ALTER TABLE home_accounts
  ADD CONSTRAINT home_accounts_app_origin_check
  CHECK (app_origin IN ('pwp', 'ip', 'dwp'));
