import { Repository } from "../repository/repository";
import { Prisma } from "@workspace/db/generated/prisma/client";
import type { Order } from "@workspace/db/generated/prisma/client";

export class Service {
    private readonly illegalTransition = {
        "ORDERED": [],
        "PICKUP_REJECTED": ["PICKUP_ACCEPTED", "ORDER_DELIVERING", "ORDER_DELIVERED", "ORDER_HANDLED"],
        "PICKUP_ACCEPTED": ["PICKUP_REJECTED", "CANCELLED", "ORDER_REJECTED", "ORDER_HANDLED", "ORDER_DELIVERING", "ORDER_DELIVERED", "ORDER_PREPARING", "ORDER_PREPARED"],
        "CANCELLED": ["ORDER_PREPARING", "ORDER_HANDLED", "ORDER_PREPARED", "PICKUP_ACCEPTED", "ORDER_DELIVERED", "ORDER_DELIVERING", "PICKUP_REJECTED", "ORDER_ACCEPTED"],
        "ORDER_ACCEPTED": ["CANCELLED", "ORDER_HANDLED", "ORDER_REJECTED", "ORDER_PREPARING", "ORDER_PREPARED", "PICKUP_REJECTED", "PICKUP_ACCEPTED", "ORDER_DELIVERING", "ORDER_DELIVERED"],
        "ORDER_REJECTED": ["ORDER_PREPARED", "ORDER_PREPARING", "PICKUP_ACCEPTED", "ORDER_HANDLED", "ORDER_DELIVERING", "ORDER_DELIVERED"],
        "ORDER_PREPARING": ["ORDER_DELIVERED", "ORDER_DELIVERING", "CANCELLED", "ORDER_HANDLED"],
        "ORDER_PREPARED": ["CANCELLED", "ORDER_ACCEPTED", "ORDER_REJECTED", "ORDER_PREPARING", "ORDER_DELIVERING", "ORDER_DELIVERED"],
        "ORDER_HANDLED": ["CANCELLED", "ORDER_ACCEPTED", "ORDER_REJECTED", "ORDER_PREPARING", "ORDER_PREPARED", "ORDER_DELIVERED", "PICKUP_REJECTED"],
        "ORDER_DELIVERING": ["CANCELLED", "ORDER_ACCEPTED", "ORDER_REJECTED", "ORDER_PREPARING", "ORDER_PREPARED", "ORDER_HANDLED", "PICKUP_REJECTED"],
        "ORDER_DELIVERED": ["CANCELLED", "ORDER_ACCEPTED", "ORDER_REJECTED", "ORDER_PREPARING", "ORDER_PREPARED", "ORDER_DELIVERING", "ORDER_HANDLED", "PICKUP_REJECTED"]
    }
    private readonly repo: Repository

    constructor(repository: Repository) {
        this.repo = repository
    }

    public async createOrder(userId: string, name: string) {

        const createdOrder = await this.transaction(async (tx): Promise<Order> => {

            const item = await this.repo.findItem(tx, name);

            if (!item) {
                throw Error("Unable to find item")
            }

            const order = await this.repo.createOrder(tx, userId, item.restaurantId, item.id);

            if (!order) {
                throw Error("Unable to create order");
            }

            return order;
        })

        return createdOrder;
    }

    public async viewPendingOrder(restaurantId: string) {
        const orders = await this.repo.viewArrivedOrder(restaurantId);

        if (orders.length <= 0) {
            throw Error("No order at this time")
        }

        return orders;
    }

    public async transition(orderId: string, restaurantId: string, nextAction: keyof typeof this.illegalTransition) {

        const isSuccess = await this.transaction(async (tx): Promise<Boolean> => {

            const orderStatus = await this.repo.getStatus(tx, orderId, restaurantId)

            if (!orderStatus) {
                throw Error("Unable to find order with this id")
            }

            const flag = this.isLegal(nextAction, orderStatus)

            if (flag) {
                throw Error("Illegal transition")
            }

            const order = await this.repo.updateStatus(tx, orderId, restaurantId, orderStatus.status, nextAction);

            if (!order) {
                throw Error("Unable to update order at this time")
            }

            return true;
        })

        return isSuccess;
    }

    public async acceptPickup(orderId: string, restaurantId: string, deliveryAgentUserId: string) {

        const pickupAccepted = await this.transaction(async (tx): Promise<Boolean> => {
            const action = "PICKUP_ACCEPTED"
            const [orderStatus, deliveryOrder] = await Promise.all([

                this.repo.getStatus(tx, orderId, restaurantId),

                tx.deliveryOrder.findFirst({
                    where: {
                        orderId: orderId
                    }
                })
            ])

            if (!orderStatus || deliveryOrder) {
                throw Error("Unable to update this order")
            }

            const isIllegal = this.isLegal(action, orderStatus)

            if (isIllegal) {
                throw Error("Invalid transition")

            }

            await tx.deliveryOrder.create({
                data: {
                    orderId: orderId,
                    deliveryAgentId: deliveryAgentUserId,
                }
            })

            const order = await this.repo.updateStatus(tx, orderId, restaurantId, orderStatus.status, action);

            if (!order) {
                throw Error("Unable to accept pickup at this time")
            }

            return true;
        })

        return pickupAccepted;
    }

    private isLegal(action: keyof typeof this.illegalTransition, order: { status: string }) {
        let flag = false;

        this.illegalTransition[action].forEach((idx) => {
            if (order.status === idx) {
                flag = true
                return
            }
        });

        return flag;
    }

    private async transaction<T>(fn: (tx: Prisma.TransactionClient) => Promise<T>): Promise<T> {
        return this.repo.client.$transaction(fn, {
            maxWait: 5000,
            timeout: 10000,
            isolationLevel: Prisma.TransactionIsolationLevel.Serializable
        })
    }
}
