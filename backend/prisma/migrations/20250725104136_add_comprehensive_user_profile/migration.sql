/*
  Warnings:

  - You are about to drop the column `date` on the `matches` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "MatchResult" AS ENUM ('WIN', 'LOSS', 'DRAW');

-- CreateEnum
CREATE TYPE "VisibilityType" AS ENUM ('PUBLIC', 'PRIVATE', 'FRIENDS_ONLY');

-- CreateEnum
CREATE TYPE "SkillLevel" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'PROFESSIONAL');

-- CreateEnum
CREATE TYPE "AchievementType" AS ENUM ('MVP', 'TOP_SCORER', 'BEST_DEFENSE', 'TEAM_PLAYER', 'CAPTAIN', 'TOURNAMENT_WINNER', 'STREAK_WINNER', 'COMEBACK_KING');

-- CreateEnum
CREATE TYPE "TrophyType" AS ENUM ('GOLD', 'SILVER', 'BRONZE', 'PARTICIPATION', 'SPECIAL');

-- AlterTable
ALTER TABLE "matches" DROP COLUMN "date",
ADD COLUMN     "matchDate" TIMESTAMP(3),
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "reportedById" TEXT,
ADD COLUMN     "result" "MatchResult";

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "bio" TEXT,
ADD COLUMN     "city" TEXT,
ADD COLUMN     "country" TEXT,
ADD COLUMN     "dateOfBirth" TIMESTAMP(3),
ADD COLUMN     "emailNotifications" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "emailVisibility" "VisibilityType" NOT NULL DEFAULT 'PRIVATE',
ADD COLUMN     "facebookUrl" TEXT,
ADD COLUMN     "favoritePlayers" TEXT[],
ADD COLUMN     "favoriteSports" TEXT[],
ADD COLUMN     "favoriteTeams" TEXT[],
ADD COLUMN     "gender" TEXT,
ADD COLUMN     "highlightVideos" TEXT[],
ADD COLUMN     "instagramUrl" TEXT,
ADD COLUMN     "isVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "linkedinUrl" TEXT,
ADD COLUMN     "photoGallery" TEXT[],
ADD COLUMN     "preferredPositions" TEXT[],
ADD COLUMN     "profileCompleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "profileVisibility" "VisibilityType" NOT NULL DEFAULT 'PUBLIC',
ADD COLUMN     "pushNotifications" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "qrCode" TEXT,
ADD COLUMN     "skillLevel" "SkillLevel",
ADD COLUMN     "totalAssists" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "totalGoals" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "totalMatches" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "totalWins" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "twitterUrl" TEXT,
ADD COLUMN     "weeklyAvailability" JSONB,
ADD COLUMN     "willingToJoinTeams" BOOLEAN NOT NULL DEFAULT true;

-- CreateTable
CREATE TABLE "achievements" (
    "id" TEXT NOT NULL,
    "type" "AchievementType" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "icon" TEXT,
    "dateEarned" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "achievements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trophies" (
    "id" TEXT NOT NULL,
    "type" "TrophyType" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "icon" TEXT,
    "dateEarned" TIMESTAMP(3) NOT NULL,
    "event" TEXT,
    "position" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "trophies_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "matches_reportedById_fkey" FOREIGN KEY ("reportedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "achievements" ADD CONSTRAINT "achievements_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trophies" ADD CONSTRAINT "trophies_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
