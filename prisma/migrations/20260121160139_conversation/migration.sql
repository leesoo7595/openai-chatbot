/*
  Warnings:

  - Added the required column `updatedAt` to the `Conversation` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Conversation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "systemPrompt" TEXT,
    "updatedAt" DATETIME NOT NULL,
    "lastMessageAt" DATETIME,
    "lastMessagePreview" TEXT
);
INSERT INTO "new_Conversation" ("createdAt", "id", "systemPrompt", "title") SELECT "createdAt", "id", "systemPrompt", "title" FROM "Conversation";
DROP TABLE "Conversation";
ALTER TABLE "new_Conversation" RENAME TO "Conversation";
CREATE INDEX "Conversation_lastMessageAt_idx" ON "Conversation"("lastMessageAt");
CREATE INDEX "Conversation_updatedAt_idx" ON "Conversation"("updatedAt");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
