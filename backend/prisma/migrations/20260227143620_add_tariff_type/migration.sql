/*
  Warnings:

  - You are about to drop the column `offerId` on the `Price` table. All the data in the column will be lost.
  - You are about to drop the column `subscriptionPrice` on the `Price` table. All the data in the column will be lost.
  - Added the required column `tariffTypeId` to the `Price` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "TariffType" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "offerId" INTEGER NOT NULL,
    CONSTRAINT "TariffType_offerId_fkey" FOREIGN KEY ("offerId") REFERENCES "Offer" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Price" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "priceKwh" REAL NOT NULL,
    "validFrom" DATETIME NOT NULL,
    "validTo" DATETIME,
    "tariffTypeId" INTEGER NOT NULL,
    CONSTRAINT "Price_tariffTypeId_fkey" FOREIGN KEY ("tariffTypeId") REFERENCES "TariffType" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Price" ("id", "priceKwh", "validFrom", "validTo") SELECT "id", "priceKwh", "validFrom", "validTo" FROM "Price";
DROP TABLE "Price";
ALTER TABLE "new_Price" RENAME TO "Price";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "TariffType_name_offerId_key" ON "TariffType"("name", "offerId");
