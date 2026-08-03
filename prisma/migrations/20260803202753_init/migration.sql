-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "TopicType" AS ENUM ('person', 'business', 'place', 'product', 'education', 'medical', 'organization', 'other');

-- CreateEnum
CREATE TYPE "ModerationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "ModerationAction" AS ENUM ('APPROVE', 'REJECT');

-- CreateTable
CREATE TABLE "User" (
    "id" UUID NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "phone" TEXT,
    "displayName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Province" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,

    CONSTRAINT "Province_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "City" (
    "id" UUID NOT NULL,
    "provinceId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,

    CONSTRAINT "City_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Topic" (
    "id" UUID NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "TopicType" NOT NULL,
    "description" TEXT NOT NULL,
    "imageUrl" TEXT,
    "cityId" UUID,
    "status" "ModerationStatus" NOT NULL DEFAULT 'PENDING',
    "submittedById" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approvedAt" TIMESTAMP(3),

    CONSTRAINT "Topic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Comment" (
    "id" UUID NOT NULL,
    "topicId" UUID NOT NULL,
    "body" TEXT NOT NULL,
    "status" "ModerationStatus" NOT NULL DEFAULT 'PENDING',
    "authorId" UUID,
    "submissionId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Submission" (
    "id" UUID NOT NULL,
    "status" "ModerationStatus" NOT NULL DEFAULT 'PENDING',
    "topicId" UUID NOT NULL,
    "submittedById" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "decidedAt" TIMESTAMP(3),

    CONSTRAINT "Submission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ModerationLog" (
    "id" UUID NOT NULL,
    "action" "ModerationAction" NOT NULL,
    "reason" TEXT,
    "adminId" UUID,
    "submissionId" UUID,
    "topicId" UUID,
    "commentId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ModerationLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "Province_name_key" ON "Province"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Province_slug_key" ON "Province"("slug");

-- CreateIndex
CREATE INDEX "Province_name_idx" ON "Province"("name");

-- CreateIndex
CREATE INDEX "Province_slug_idx" ON "Province"("slug");

-- CreateIndex
CREATE INDEX "City_provinceId_idx" ON "City"("provinceId");

-- CreateIndex
CREATE INDEX "City_name_idx" ON "City"("name");

-- CreateIndex
CREATE INDEX "City_slug_idx" ON "City"("slug");

-- CreateIndex
CREATE INDEX "City_provinceId_name_idx" ON "City"("provinceId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "City_provinceId_name_key" ON "City"("provinceId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "City_provinceId_slug_key" ON "City"("provinceId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "Topic_slug_key" ON "Topic"("slug");

-- CreateIndex
CREATE INDEX "Topic_status_createdAt_idx" ON "Topic"("status", "createdAt");

-- CreateIndex
CREATE INDEX "Topic_cityId_type_status_idx" ON "Topic"("cityId", "type", "status");

-- CreateIndex
CREATE INDEX "Topic_type_name_cityId_idx" ON "Topic"("type", "name", "cityId");

-- CreateIndex
CREATE INDEX "Topic_name_idx" ON "Topic"("name");

-- CreateIndex
CREATE INDEX "Topic_createdAt_idx" ON "Topic"("createdAt");

-- CreateIndex
CREATE INDEX "Topic_submittedById_idx" ON "Topic"("submittedById");

-- CreateIndex
CREATE UNIQUE INDEX "Comment_submissionId_key" ON "Comment"("submissionId");

-- CreateIndex
CREATE INDEX "Comment_topicId_status_createdAt_idx" ON "Comment"("topicId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "Comment_status_createdAt_idx" ON "Comment"("status", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Submission_topicId_key" ON "Submission"("topicId");

-- CreateIndex
CREATE INDEX "Submission_status_createdAt_idx" ON "Submission"("status", "createdAt");

-- CreateIndex
CREATE INDEX "Submission_submittedById_idx" ON "Submission"("submittedById");

-- CreateIndex
CREATE INDEX "ModerationLog_submissionId_idx" ON "ModerationLog"("submissionId");

-- CreateIndex
CREATE INDEX "ModerationLog_topicId_idx" ON "ModerationLog"("topicId");

-- CreateIndex
CREATE INDEX "ModerationLog_commentId_idx" ON "ModerationLog"("commentId");

-- CreateIndex
CREATE INDEX "ModerationLog_adminId_createdAt_idx" ON "ModerationLog"("adminId", "createdAt");

-- CreateIndex
CREATE INDEX "ModerationLog_action_createdAt_idx" ON "ModerationLog"("action", "createdAt");

-- CreateIndex
CREATE INDEX "ModerationLog_createdAt_idx" ON "ModerationLog"("createdAt");

-- AddForeignKey
ALTER TABLE "City" ADD CONSTRAINT "City_provinceId_fkey" FOREIGN KEY ("provinceId") REFERENCES "Province"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Topic" ADD CONSTRAINT "Topic_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "City"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Topic" ADD CONSTRAINT "Topic_submittedById_fkey" FOREIGN KEY ("submittedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "Submission"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_submittedById_fkey" FOREIGN KEY ("submittedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModerationLog" ADD CONSTRAINT "ModerationLog_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModerationLog" ADD CONSTRAINT "ModerationLog_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "Submission"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModerationLog" ADD CONSTRAINT "ModerationLog_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModerationLog" ADD CONSTRAINT "ModerationLog_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "Comment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
