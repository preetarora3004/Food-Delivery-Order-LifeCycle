import { Repository } from "../repository/repository";
import { Prisma } from "@workspace/db/generated/prisma/client";

export class Service {
    private readonly repo: Repository

    constructor(repository: Repository) {
        this.repo = repository
    }

    public async createOrder(userId: string, name: string) {

        const item = await this.repo.client.item.findFirst({
            where: {
                name: name
            }
        })

        if (!item) {
            throw Error("Unable to find item")
        }

        const order = await this.repo.client.order.create({
            data: {
                userId: userId,
                restaurantId: item.restaurantId,
                itemId: item.id
            }
        })

        if (!order) {
            throw Error("Unable to create order")
        }

        return order;
    }

    public async viewPendingOrder(orderId: string, restaurantId: string) {
        const orders = await this.repo.client.$queryRaw`
            SELECT * FROM Order
            WHERE 
            orderId = ${orderId}
            AND restaurantId = ${restaurantId}
            AND isAccepted = FALSE
            AND isRejected = FALSE
            AND isPrepared = FALSE
            AND isHAndled = FALSE
            AND createdAt <= NOW() - INTERVAL '2 minutes'
            RETURNING *;
        `;
    }

    public async acceptOrder(orderId: string, restaurantId: string) {
        const updateOrder = await this.repo.client.$queryRaw`
            UPDATE Order
                SET isAccepted = TRUE
            WHERE
            orderId = ${orderId}
            AND restaurantId = ${restaurantId}
            AND isPrepared = FALSE
            AND isHandled = FALSE
            AND isRejected = FALSE
            AND createdAt <= NOW() - INTERVAL '2 minutes'
            RETURNING *;
        `;

        if (!updateOrder) throw Error(`Unable to find order with this ID ${orderId}`)

        return updateOrder;
    }

    public async rejectOrder(orderId: string, restaurantId: string) {

        const updateOrder = await this.repo.client.order.update({
            where: {
                id: orderId,
                restaurantId: restaurantId,
                isPrepared: {
                    not: true
                },
                isHandled: {
                    not: true
                }
            },
            data: {
                isRejected: true,
            }
        })

        if (!updateOrder) throw Error(`Unable to find order with this ID ${orderId}`)

        return updateOrder;
    }

    public async acceptPickup(orderId: string, deliveryAgentUserId: string) {

        const [order, deliveryOrder] = await Promise.all([

            await this.repo.client.order.findFirst({
                where: {
                    id: orderId,
                    isAccepted: true,
                    isHandled: false
                }
            }),

            await this.repo.client.deliveryOrder.findFirst({
                where: {
                    orderId: orderId
                }
            })
        ])


        if (!order || deliveryOrder) {
            throw Error("Unable to update this order")
        }

        const createDelivery = await this.repo.client.deliveryOrder.create({
            data: {
                orderId: orderId,
                deliveryAgentId: deliveryAgentUserId,
                isAccepted: true,
            }
        })

        return createDelivery;
    }

    public async markPrepared(orderId: string) {
        const order = await this.repo.client.order.update({
            where: {
                id: orderId,
                isPrepared: false,
                isAccepted: true,
                isHandled: false,
            },
            data: {
                isPrepared: true
            }
        })

        if (!order) {
            throw Error("Unable to mark prepared at this time")
        }

        return order;
    }

    public async markHandled(orderId: string) {
        const order = await this.repo.client.order.update({
            where: {
                id: orderId,
                isAccepted: true,
                isPrepared: true,
                isRejected: false,
                isHandled: false
            },
            data: {
                isHandled: true
            }
        })

        if (!order) { throw Error("Unable to mark handled at this time") }

        return order;
    }

    public async markPicked(orderId: string, deliveryAgentId: string, restaurantId: string) {

        const deliveryOrder = await this.repo.client.$queryRaw`
            UPDATE DeliveryOrder
                SET isPicked = TRUE
            WHERE 
                orderId = ${orderId} 
                AND deliveryAgentId = ${deliveryAgentId} 
                AND isAccepted = TRUE 
                AND isPicked = FALSE 
                AND isDelivered = FALSE
            RETURNING *;
        `

        if (!deliveryOrder) {
            throw Error("Unable to make picked at this time")
        }

        return deliveryOrder;
    }

    public async markDelivered(orderId: string, deliveryAgentId: string, userId: string) {
        const deliveryOrder = await this.repo.client.$queryRaw`
            UPDATE DeliveryOrder
                SET isDelivered = TRUE
            WHERE 
                orderId = ${orderId}
                AND deliverAgentId = ${deliveryAgentId}
                AND isAccepted = TRUE
                AND isPicked = TRUE
            RETURNING *;
        `

        if (!deliveryOrder) {
            throw Error("Unable to mark delivered at this time")
        }

        return deliveryOrder;
    }

    public async rejectPickup(orderId: string, deliveryAgentId: string) {
        const deliveryOrder = await this.repo.client.deliveryOrder.create({
            data: {
                orderId: orderId,
                deliveryAgentId: deliveryAgentId
            }
        })

        if (!deliveryOrder) {
            throw Error("Unable to reject order at this time")
        }

        return deliveryOrder;
    }

    private async transaction<T>(fn: (tx: Prisma.TransactionClient) => Promise<T>): Promise<T> {
        return this.repo.client.$transaction(fn, {
            maxWait: 5000,
            timeout: 10000,
            isolationLevel: Prisma.TransactionIsolationLevel.Serializable
        })
    }
}
