-- Optional human label for a contact row (e.g. «دفتر مرکزی», «فکس», «علی»).
ALTER TABLE "TopicLink" ADD COLUMN "label" TEXT;

-- Free-text working hours (structured normalization comes later).
ALTER TABLE "Topic" ADD COLUMN "workingHours" TEXT;

-- Backfill the legacy single phone column into a repeatable PHONE link.
INSERT INTO "TopicLink" ("id", "topicId", "platform", "value", "label")
SELECT gen_random_uuid(), id, 'PHONE', "phone", NULL
FROM "Topic"
WHERE "phone" IS NOT NULL AND "phone" <> '';

-- The single-phone column is superseded by TopicLink rows.
ALTER TABLE "Topic" DROP COLUMN "phone";
