import {
  NotAuthorizedError,
  NotFoundError,
  requireAuth,
  validateRequest,
} from "@lyubomyr.rudko/common";
import express, { Request, Response } from "express";
import { param } from "express-validator";
import mongoose from "mongoose";
import { Order } from "../models/order";

const router = express.Router();

router.get(
  "/api/orders/:orderId",
  requireAuth,
  [
    param("orderId")
      .not()
      .isEmpty()
      .custom((input: string) => mongoose.Types.ObjectId.isValid(input))
      .withMessage("OrderId must be provided"),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    console.log("--> req.params.orderId", req.params.orderId);

    const order = await Order.findById(req.params.orderId).populate("ticket");

    if (!order) {
      throw new NotFoundError();
    }

    if (order.userId !== req.currentUser!.id) {
      throw new NotAuthorizedError();
    }

    order.populate("ticket");

    res.send(order);
  }
);

export { router as showOrderRouter };
