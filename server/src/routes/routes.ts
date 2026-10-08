import { Router } from "express";
import { controller } from "../dependencyInjection/dependency";
import { userMiddleware } from "../middleware/userMiddleware";
import { restaurantMiddleware } from "../middleware/restaurantMiddleware";
import { deliveryMiddleware } from "../middleware/deliveryMiddleware";

const router = Router();

router.post("/user/order", userMiddleware, controller.createOrder.bind(controller));
router.post("/delivery/accept", deliveryMiddleware, controller.acceptDelivery.bind(controller));

router.get("/restaurant/order", restaurantMiddleware, controller.getOrder.bind(controller));

router.patch("/user/order-cancel", userMiddleware, controller.cancelOrder.bind(controller));
router.patch("/restaurant/accept-order", restaurantMiddleware, controller.acceptOrder.bind(controller));
router.patch("/restaurant/status-preparing", restaurantMiddleware, controller.markPreparing.bind(controller));
router.patch("/restaurant/status-prepared", restaurantMiddleware, controller.markPrepared.bind(controller));
router.patch("restaurant/reject-order", restaurantMiddleware, controller.rejectOrder.bind(controller));
router.patch("/delivery/reject", deliveryMiddleware, controller.rejectDelivery.bind(controller));
router.patch("/delivery/delivering", deliveryMiddleware, controller.markOrderDelivering.bind(controller));
router.patch("/delivery/delivered", deliveryMiddleware, controller.markDelivered.bind(controller));

export default router;
