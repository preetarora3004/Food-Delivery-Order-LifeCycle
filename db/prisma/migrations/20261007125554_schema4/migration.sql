/*
  Warnings:

  - You are about to drop the column `isAccepted` on the `DeliveryOrder` table. All the data in the column will be lost.
  - You are about to drop the column `isDelivered` on the `DeliveryOrder` table. All the data in the column will be lost.
  - You are about to drop the column `isPicked` on the `DeliveryOrder` table. All the data in the column will be lost.
  - You are about to drop the column `isAccepted` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `isHandled` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `isPrepared` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `isRejected` on the `Order` table. All the data in the column will be lost.
  - Added the required column `deliveryStatus` to the `DeliveryOrder` table without a default value. This is not possible if the table is not empty.
  - Added the required column `restaurantStatus` to the `Order` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "RestaurantStatus" AS ENUM ('ORDERED', 'CANCELLED', 'ORDER_ACCEPTED', 'ORDER_REJECTED', 'ORDER_PREPARING', 'ORDER_PREPARED', 'ORDER_HANDLED');

-- CreateEnum
CREATE TYPE "DeliveryStatus" AS ENUM ('PICKUP_ACCEPTED', 'PICKUP_REJECTED', 'ORDER_DELIVERING', 'ORDER_DELIVERED');

-- AlterTable
ALTER TABLE "DeliveryOrder" DROP COLUMN "isAccepted",
DROP COLUMN "isDelivered",
DROP COLUMN "isPicked",
ADD COLUMN     "deliveryStatus" "DeliveryStatus" NOT NULL;

-- AlterTable
ALTER TABLE "Order" DROP COLUMN "isAccepted",
DROP COLUMN "isHandled",
DROP COLUMN "isPrepared",
DROP COLUMN "isRejected",
ADD COLUMN     "restaurantStatus" "RestaurantStatus" NOT NULL;
