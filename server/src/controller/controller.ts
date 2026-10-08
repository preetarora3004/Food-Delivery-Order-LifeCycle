import type { Request, Response } from "express";
import type { Service } from "../service/service";

export class Controller {

    private readonly service: Service

    constructor(service: Service) {
        this.service = service
    }

    public async createOrder(req: Request, res: Response) {
        const { name } = req.body
        const userId = req.body.userId

        if (!name || !userId) {
            throw Error("Invalid input")
        }

        const order = this.service.createOrder(userId, name)

        return res.status(201).json({
            success: true,
            body: order
        })
    }

    public async cancelOrder(req: Request, res: Response) {

        const { orderId, restaurantId } = req.body

        if (!orderId || !restaurantId) {
            throw Error("Invalid input")
        }

        const isSuccess = await this.service.transition(orderId, restaurantId, "CANCELLED");

        return res.status(200).json({
            success: isSuccess
        })
    }

    public async getItem(req: Request, res: Response) {

    }

    public async getOrder(req: Request, res: Response) {
        const { restaurantId } = req.body

        if (!restaurantId) {
            throw Error("Invalid input")
        }

        const orders = this.service.viewPendingOrder(restaurantId);

        return res.status(200).json({
            success: true,
            body: orders
        })
    }

    public async acceptOrder(req: Request, res: Response) {
        const { orderId, restaurantId } = req.body

        if (!orderId || !restaurantId) {
            throw Error("Invalid input")
        }

        const isSuccess = await this.service.transition(orderId, restaurantId, "ORDER_ACCEPTED");

        return res.status(200).json({
            success: isSuccess
        })
    }

    public async rejectOrder(req: Request, res: Response) {

        const { orderId, restaurantId } = req.body

        if (!orderId || !restaurantId) {
            throw Error("Invalid input")
        }

        const isSuccess = await this.service.transition(orderId, restaurantId, "ORDER_REJECTED");

        return res.status(200).json({
            success: isSuccess
        })
    }

    public async markPreparing(req: Request, res: Response) {

        const { orderId, restaurantId } = req.body

        if (!orderId || !restaurantId) {
            throw Error("Invalid input")
        }

        const isSuccess = await this.service.transition(orderId, restaurantId, "ORDER_PREPARING");

        return res.status(200).json({
            success: isSuccess
        })
    }

    public async markPrepared(req: Request, res: Response) {

        const { orderId, restaurantId } = req.body

        if (!orderId || !restaurantId) {
            throw Error("Invalid input")
        }

        const isSuccess = await this.service.transition(orderId, restaurantId, "ORDER_PREPARED");

        return res.status(200).json({
            success: isSuccess
        })
    }

    public async getDeliveryOrder(req: Request, res: Response) {

    }

    public async acceptDelivery(req: Request, res: Response) {
        const { orderId, restaurantId, deliveryAgentId } = req.body

        if (!orderId || !restaurantId || !deliveryAgentId) {
            throw Error("Invalid input")
        }

        const isSuccess = await this.service.acceptPickup(orderId, restaurantId, deliveryAgentId);

        return res.status(200).json({
            success: isSuccess
        })
    }

    public async rejectDelivery(req: Request, res: Response) {

        const { orderId, restaurantId } = req.body

        if (!orderId || !restaurantId) {
            throw Error("Invalid input")
        }

        const isSuccess = await this.service.transition(orderId, restaurantId, "PICKUP_REJECTED");

        return res.status(200).json({
            success: isSuccess
        })
    }

    public async markOrderPicked(req: Request, res: Response) {

        const { orderId, restaurantId } = req.body

        if (!orderId || !restaurantId) {
            throw Error("Invalid input")
        }

        const isSuccess = await this.service.transition(orderId, restaurantId, "ORDER_HANDLED");

        return res.status(200).json({
            success: isSuccess
        })
    }

    public async markOrderDelivering(req: Request, res: Response) {

        const { orderId, restaurantId } = req.body

        if (!orderId || !restaurantId) {
            throw Error("Invalid input")
        }

        const isSuccess = await this.service.transition(orderId, restaurantId, "ORDER_DELIVERING");

        return res.status(200).json({
            success: isSuccess
        })
    }

    public async markDelivered(req: Request, res: Response) {

        const { orderId, restaurantId } = req.body

        if (!orderId || !restaurantId) {
            throw Error("Invalid input")
        }

        const isSuccess = await this.service.transition(orderId, restaurantId, "ORDER_DELIVERED");

        return res.status(200).json({
            success: isSuccess
        })
    }
}
