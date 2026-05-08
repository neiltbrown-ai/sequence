-- Phase 3 follow-on (2026-05-07): allow up to 3 sub-disciplines per
-- assessment so creatives who genuinely span sub-areas within an
-- industry can capture that (a designer doing Brand Identity AND
-- Product/UX, a media person running a Newsletter AND a Podcast, etc.).
--
-- Changes assessments.sub_discipline from TEXT to TEXT[]. Existing
-- single string values become 1-element arrays. NULL stays NULL.
-- Idempotent in spirit — once the column type is TEXT[], re-running
-- the USING expression on TEXT[] values is a no-op (Postgres rejects
-- the conversion). In practice: apply once, then this migration is
-- complete; no future runs needed.

ALTER TABLE assessments
  ALTER COLUMN sub_discipline
  SET DATA TYPE TEXT[]
  USING CASE
    WHEN sub_discipline IS NULL THEN NULL
    ELSE ARRAY[sub_discipline]
  END;
