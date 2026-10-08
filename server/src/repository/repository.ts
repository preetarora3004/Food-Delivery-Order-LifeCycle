import { Prisma, type PrismaClient } from "@workspace/db/generated/prisma/client"
import type { Order } from "@workspace/db/generated/prisma/client";

export class Repository {
    public readonly client: PrismaClient

    constructor(client: PrismaClient) {
        this.client = client
    }

    public async findItem(tx: Prisma.TransactionClient, name: string) {
        return await tx.item.findFirst({
            where: {
                name: name
            }
        });
    }

    public async createOrder(tx: Prisma.TransactionClient, userId: string, restaurantId: string, itemId: string) {
        return await tx.order.create({
            data: {
                userId: userId,
                status: "ORDERED",
                restaurantId: restaurantId,
                itemId: itemId
            }
        });
    }

    public async updateStatus(tx: Prisma.TransactionClient, orderId: string, restaurantId: string, from: string, to: string) {
        const order = await tx.order.updateManyAndReturn({
            where: {
                id: orderId,
                restaurantId: restaurantId,
                status: from
            },
            data: {
                status: to
            }
        })

        return order;
    }

    public async getStatus(tx: Prisma.TransactionClient, orderId: string, restaurantId: string) {

        const order = await tx.order.findUnique({
            where: {
                id: orderId,
                restaurantId: restaurantId
            },
            select: {
                status: true
            }
        })

        return order;
    }

    public async viewArrivedOrder(restaurantId: string): Promise<Order[]> {

        const orders = (await this.client.$queryRaw<Order[]>`
            SELECT * FROM Order
            WHERE 
            restaurantId = ${restaurantId}
            AND status = ORDERED
            AND createdAt <= NOW() - INTERVAL '2 minutes';
        `);

        return orders;
    }
}
