import {
  NotAuthorizedError,
  NotFoundError,
  OrderStatus,
  requireAuth,
  validateRequest,
} from "@lyubomyr.rudko/common";
import express, { Request, Response } from "express";
import { param } from "express-validator";
import mongoose from "mongoose";
import { Order } from "../models/order";
import { OrderCancelledPublisher } from "../events/publishers/order-cancelled-publisher";
import { natsWrapper } from "../nats-wrapper";

const router = express.Router();

router.delete(
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
    const order = await Order.findById(req.params.orderId).populate("ticket");

    if (!order) {
      throw new NotFoundError();
    }

    if (order.userId !== req.currentUser!.id) {
      throw new NotAuthorizedError();
    }

    order.populate("ticket");

    order.status = OrderStatus.Cancelled;
    await order.save();

    // Publish an event saying that an order was cancelled
    new OrderCancelledPublisher(natsWrapper.client).publish({
      id: order.id,
      version: order.version,
      ticket: {
        id: order.ticket.id,
      },
    });

    res.status(204).send();
  }
);

export { router as deleteOrderRouter };

// router.get(
//     "/api/orders/:orderId",
//     requireAuth,
//     [
//       param("orderId")
//         .not()
//         .isEmpty()
//         .custom((input: string) => mongoose.Types.ObjectId.isValid(input))
//         .withMessage("OrderId must be provided"),
//     ],
//     validateRequest,
//     async (req: Request, res: Response) => {
//   const order = await Order.findById(req.params.orderId).populate("ticket");

//   if (!order) {
//     throw new NotFoundError();
//   }

//   if (order.userId !== req.currentUser!.id) {
//     throw new NotAuthorizedError();
//   }

//   order.populate("ticket");

//   res.send(order);
// }
//   );

//   export { router as showOrderRouter };
