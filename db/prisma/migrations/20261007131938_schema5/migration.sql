/*
  Warnings:

  - You are about to drop the column `deliveryStatus` on the `DeliveryOrder` table. All the data in the column will be lost.
  - Changed the type of `restaurantStatus` on the `Order` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "Status" AS ENUM ('ORDERED', 'CANCELLED', 'ORDER_ACCEPTED', 'ORDER_REJECTED', 'ORDER_PREPARING', 'ORDER_PREPARED', 'ORDER_HANDLED', 'PICKUP_ACCEPTED', 'PICKUP_REJECTED', 'ORDER_DELIVERING', 'ORDER_DELIVERED');

-- AlterTable
ALTER TABLE "DeliveryOrder" DROP COLUMN "deliveryStatus";

-- AlterTable
ALTER TABLE "Order" DROP COLUMN "restaurantStatus",
ADD COLUMN     "restaurantStatus" "Status" NOT NULL;

-- DropEnum
DROP TYPE "DeliveryStatus";

-- DropEnum
DROP TYPE "RestaurantStatus";
