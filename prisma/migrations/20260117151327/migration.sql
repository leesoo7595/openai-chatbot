-- AlterTable
ALTER TABLE "Conversation" ADD COLUMN "systemPrompt" TEXT;

-- AlterTable
ALTER TABLE "Message" ADD COLUMN "model" TEXT;
