-- AlterTable
-- The page concept: "توضیح کوتاه" is no longer required at creation;
-- it becomes an optional completion field (the page's short introduction).
-- Contact information (phone / website / instagram) is optional completion.
ALTER TABLE "Topic" ADD COLUMN     "instagram" TEXT,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "website" TEXT,
ALTER COLUMN "description" DROP NOT NULL;
