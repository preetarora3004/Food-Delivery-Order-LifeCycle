import { Router } from "express";
import { controller } from "../dependencyInjection/dependency";

const router = Router()

router.post("/user/order", controller.createOrder.bind(controller));

export default router;
