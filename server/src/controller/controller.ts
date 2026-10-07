import type { Request, Response } from "express";
import type { Service } from "../service/service";

export class Controller {

    private readonly service: Service

    constructor(service: Service) {
        this.service = service
    }

    public async createOrder(req: Request, res: Response) {

    }

    public async getItem(req: Request, res: Response) {

    }

    public async getOrder(req: Request, res: Response) {

    }

    public async acceptOrder(req: Request, res: Response) {

    }

    public async getDeliverOrder(req: Request, res: Response) {

    }

    public async createDelivery(req: Request, res: Response) {

    }

    public async markOrderPicked(req: Request, res: Response) {

    }

    public async markOrderDelivering(req: Request, res: Response) {

    }

    public async markDelivered(req: Request, res: Response) {

    }
}
