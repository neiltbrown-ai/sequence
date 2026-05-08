-- Phase 3 of the case-study taxonomy rollout. Renames the 8 legacy
-- assessments.discipline values to align with the canonical 16-industry
-- vocabulary in src/lib/case-studies/taxonomy.ts (and Q1 of the
-- assessment, which now reads from that module).
--
-- Idempotent — filters on the old slug values only. design and writing
-- are unchanged. The 6 net-new slugs (photography, comics, comedy,
-- media, hospitality, gaming) require no backfill since no existing
-- rows hold those values.

UPDATE assessments SET discipline = 'visual_art'   WHERE discipline = 'visual_arts';
UPDATE assessments SET discipline = 'film_tv'      WHERE discipline = 'film_video';
UPDATE assessments SET discipline = 'music'        WHERE discipline = 'music_audio';
UPDATE assessments SET discipline = 'theater'      WHERE discipline = 'performing_arts';
UPDATE assessments SET discipline = 'architecture' WHERE discipline = 'architecture_interiors';
UPDATE assessments SET discipline = 'fashion'      WHERE discipline = 'fashion_apparel';
UPDATE assessments SET discipline = 'advertising'  WHERE discipline = 'advertising_marketing';
UPDATE assessments SET discipline = 'technology'   WHERE discipline = 'technology_creative_tech';
