-- CreateEnum
CREATE TYPE "TopicTypeKind" AS ENUM ('PRIMARY', 'SECONDARY');

-- CreateTable
CREATE TABLE "TopicTypeTag" (
    "id" UUID NOT NULL,
    "topicId" UUID NOT NULL,
    "typeId" UUID NOT NULL,
    "kind" "TopicTypeKind" NOT NULL DEFAULT 'SECONDARY',
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "TopicTypeTag_pkey" PRIMARY KEY ("id")
);

-- Backfill: ensure a TopicTypeSuggestion row exists for every distinct
-- legacy Topic.type value so it can be attached as a PRIMARY tag.
INSERT INTO "TopicTypeSuggestion" ("id", "label", "status")
SELECT gen_random_uuid(), topic."type", 'APPROVED'
FROM (SELECT DISTINCT "type" FROM "Topic") topic
WHERE NOT EXISTS (
    SELECT 1 FROM "TopicTypeSuggestion" s WHERE s.label = topic."type"
);

-- Backfill: attach each existing topic's type as its PRIMARY tag.
INSERT INTO "TopicTypeTag" ("id", "topicId", "typeId", "kind", "order")
SELECT gen_random_uuid(), topic.id, s.id, 'PRIMARY', 0
FROM "Topic" topic
JOIN "TopicTypeSuggestion" s ON s.label = topic."type";

-- DropIndex
DROP INDEX "Topic_cityId_type_status_idx";

-- DropIndex
DROP INDEX "Topic_provinceId_type_status_idx";

-- DropIndex
DROP INDEX "Topic_type_name_cityId_idx";

-- AlterTable
ALTER TABLE "Topic" DROP COLUMN "type";

-- AlterTable
ALTER TABLE "TopicTypeSuggestion" ADD COLUMN "parentId" UUID;

-- CreateIndex
CREATE INDEX "TopicTypeTag_topicId_idx" ON "TopicTypeTag"("topicId");

-- CreateIndex
CREATE INDEX "TopicTypeTag_typeId_idx" ON "TopicTypeTag"("typeId");

-- CreateIndex
CREATE INDEX "TopicTypeTag_typeId_kind_idx" ON "TopicTypeTag"("typeId", "kind");

-- CreateIndex
CREATE UNIQUE INDEX "TopicTypeTag_topicId_typeId_key" ON "TopicTypeTag"("topicId", "typeId");

-- CreateIndex
CREATE INDEX "TopicTypeSuggestion_parentId_idx" ON "TopicTypeSuggestion"("parentId");

-- AddForeignKey
ALTER TABLE "TopicTypeSuggestion" ADD CONSTRAINT "TopicTypeSuggestion_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "TopicTypeSuggestion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TopicTypeTag" ADD CONSTRAINT "TopicTypeTag_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TopicTypeTag" ADD CONSTRAINT "TopicTypeTag_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "TopicTypeSuggestion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
