-- CreateEnum
CREATE TYPE "ContactPlatform" AS ENUM ('INSTAGRAM', 'TELEGRAM', 'WHATSAPP', 'BALE', 'EITAA', 'RUBIKA', 'LINKEDIN', 'X', 'YOUTUBE', 'FACEBOOK', 'WEBSITE', 'OTHER');

-- CreateTable
CREATE TABLE "TopicLink" (
    "id" UUID NOT NULL,
    "topicId" UUID NOT NULL,
    "platform" "ContactPlatform" NOT NULL,
    "value" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TopicLink_pkey" PRIMARY KEY ("id")
);

-- Backfill: migrate the old website / instagram columns into repeatable links.
INSERT INTO "TopicLink" ("id", "topicId", "platform", "value")
SELECT gen_random_uuid(), id, 'WEBSITE', "website"
FROM "Topic"
WHERE "website" IS NOT NULL AND "website" <> '';

INSERT INTO "TopicLink" ("id", "topicId", "platform", "value")
SELECT gen_random_uuid(), id, 'INSTAGRAM', "instagram"
FROM "Topic"
WHERE "instagram" IS NOT NULL AND "instagram" <> '';

-- AlterTable
ALTER TABLE "Topic" DROP COLUMN "instagram",
DROP COLUMN "website";

-- CreateIndex
CREATE INDEX "TopicLink_topicId_idx" ON "TopicLink"("topicId");

-- AddForeignKey
ALTER TABLE "TopicLink" ADD CONSTRAINT "TopicLink_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE CASCADE ON UPDATE CASCADE;
