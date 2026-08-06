-- CreateEnum
CREATE TYPE "LocationScope" AS ENUM ('NATIONAL', 'PROVINCE', 'CITY', 'ADDRESS');

-- CreateTable
CREATE TABLE "TopicTypeSuggestion" (
    "id" UUID NOT NULL,
    "label" TEXT NOT NULL,
    "status" "ModerationStatus" NOT NULL DEFAULT 'PENDING',
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "decidedAt" TIMESTAMP(3),

    CONSTRAINT "TopicTypeSuggestion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TopicTypeSuggestion_label_key" ON "TopicTypeSuggestion"("label");

-- CreateIndex
CREATE INDEX "TopicTypeSuggestion_status_submittedAt_idx" ON "TopicTypeSuggestion"("status", "submittedAt");

-- CreateIndex
CREATE INDEX "TopicTypeSuggestion_label_idx" ON "TopicTypeSuggestion"("label");

-- AlterTable (free-text topic type)
-- Switch the column type first (enum -> text conversion is automatic), then
-- map the legacy enum values to readable Persian labels.
ALTER TABLE "Topic" ALTER COLUMN "type" SET DATA TYPE TEXT;

UPDATE "Topic" SET "type" = CASE "type"
    WHEN 'person' THEN 'شخص'
    WHEN 'business' THEN 'کسب‌وکار'
    WHEN 'place' THEN 'مکان'
    WHEN 'product' THEN 'محصول'
    WHEN 'education' THEN 'آموزش'
    WHEN 'medical' THEN 'پزشک'
    WHEN 'organization' THEN 'سازمان'
    ELSE 'سایر'
END;

-- DropEnum
DROP TYPE "TopicType";

-- AlterTable (activity area / location scope)
ALTER TABLE "Topic" ADD COLUMN "scope" "LocationScope" NOT NULL DEFAULT 'NATIONAL';
ALTER TABLE "Topic" ADD COLUMN "provinceId" UUID;
ALTER TABLE "Topic" ADD COLUMN "address" TEXT;
ALTER TABLE "Topic" ADD COLUMN "latitude" DOUBLE PRECISION;
ALTER TABLE "Topic" ADD COLUMN "longitude" DOUBLE PRECISION;

-- Existing rows that carry a city belong to a city-level activity area.
UPDATE "Topic" SET "scope" = 'CITY' WHERE "cityId" IS NOT NULL;

-- CreateIndex
CREATE INDEX "Topic_provinceId_type_status_idx" ON "Topic"("provinceId", "type", "status");

-- CreateIndex
CREATE INDEX "Topic_scope_idx" ON "Topic"("scope");

-- CreateIndex
CREATE INDEX "Topic_provinceId_idx" ON "Topic"("provinceId");

-- AddForeignKey
ALTER TABLE "Topic" ADD CONSTRAINT "Topic_provinceId_fkey" FOREIGN KEY ("provinceId") REFERENCES "Province"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
