/*
  Warnings:

  - You are about to drop the `Price` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `logoUrl` on the `Supplier` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `TariffType` table. All the data in the column will be lost.
  - You are about to drop the column `offerId` on the `TariffType` table. All the data in the column will be lost.
  - Added the required column `code` to the `Offer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `code` to the `Supplier` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdAt` to the `Supplier` table without a default value. This is not possible if the table is not empty.
  - Added the required column `code` to the `TariffType` table without a default value. This is not possible if the table is not empty.
  - Added the required column `label` to the `TariffType` table without a default value. This is not possible if the table is not empty.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Price";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "OfferOption" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "offerId" INTEGER NOT NULL,
    CONSTRAINT "OfferOption_offerId_fkey" FOREIGN KEY ("offerId") REFERENCES "Offer" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MeterPower" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "code" TEXT NOT NULL,
    "kva" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "PriceComponent" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "code" TEXT NOT NULL,
    "label" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "PriceComponentValue" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "priceHt" REAL NOT NULL,
    "priceTtc" REAL NOT NULL,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME,
    "offerOptionId" INTEGER NOT NULL,
    "meterPowerId" INTEGER NOT NULL,
    "componentId" INTEGER NOT NULL,
    "tariffTypeId" INTEGER NOT NULL,
    CONSTRAINT "PriceComponentValue_offerOptionId_fkey" FOREIGN KEY ("offerOptionId") REFERENCES "OfferOption" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "PriceComponentValue_meterPowerId_fkey" FOREIGN KEY ("meterPowerId") REFERENCES "MeterPower" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "PriceComponentValue_componentId_fkey" FOREIGN KEY ("componentId") REFERENCES "PriceComponent" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "PriceComponentValue_tariffTypeId_fkey" FOREIGN KEY ("tariffTypeId") REFERENCES "TariffType" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ConsumptionProfile" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "code" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "annualKwh" INTEGER NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Offer" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME,
    "active" BOOLEAN NOT NULL,
    "supplierId" INTEGER NOT NULL,
    CONSTRAINT "Offer_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Offer" ("active", "endDate", "id", "name", "startDate", "supplierId") SELECT "active", "endDate", "id", "name", "startDate", "supplierId" FROM "Offer";
DROP TABLE "Offer";
ALTER TABLE "new_Offer" RENAME TO "Offer";
CREATE UNIQUE INDEX "Offer_code_key" ON "Offer"("code");
CREATE TABLE "new_Supplier" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL,
    "closedAt" DATETIME,
    "active" BOOLEAN NOT NULL,
    "logoUrl" TEXT
);
INSERT INTO "new_Supplier" ("active", "id", "name") SELECT "active", "id", "name" FROM "Supplier";
DROP TABLE "Supplier";
ALTER TABLE "new_Supplier" RENAME TO "Supplier";
CREATE UNIQUE INDEX "Supplier_code_key" ON "Supplier"("code");
CREATE TABLE "new_TariffType" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "code" TEXT NOT NULL,
    "label" TEXT NOT NULL
);
INSERT INTO "new_TariffType" ("id") SELECT "id" FROM "TariffType";
DROP TABLE "TariffType";
ALTER TABLE "new_TariffType" RENAME TO "TariffType";
CREATE UNIQUE INDEX "TariffType_code_key" ON "TariffType"("code");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "OfferOption_code_offerId_key" ON "OfferOption"("code", "offerId");

-- CreateIndex
CREATE UNIQUE INDEX "MeterPower_code_key" ON "MeterPower"("code");

-- CreateIndex
CREATE UNIQUE INDEX "PriceComponent_code_key" ON "PriceComponent"("code");

-- CreateIndex
CREATE UNIQUE INDEX "ConsumptionProfile_code_key" ON "ConsumptionProfile"("code");
