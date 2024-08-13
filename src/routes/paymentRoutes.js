import crypto from "crypto";
import { Router } from "express";
import mongoose, { Mongoose } from "mongoose";
import { catchAsync } from "../utils/catchAsync.js";
import Cart from "../Db/models/cart.model.js";
import AppError from "../utils/AppError.js";
import CartItem from "../Db/models/cartItem.model.js";
import {
  countCartTotalPrice,
  formatItemsForPayment,
  generatePaymentLink,
} from "../utils/helperFunc.js";
import { createPaymentLinkMultiMethods } from "../payment/paymentHandler.js";
import Payment from "../Db/models/payment.model.js";
import Order from "../Db/models/order.model.js";
import Product from "../Db/models/product.model.js";
import { formatBilling_Data } from "../utils/paymentHelperFunc.js";
import isAuth from "../middlewares/authentication.js";
import restrictTo from "../middlewares/Authorization.js";
import CookieCart from "../Db/models/cookieCart.model.js";
import logger from "../utils/logger.js";
import {validateCartItemsQuantity} from '../utils/helperFunc.js'
const router = Router();

router.post("/pay", async (req, res, next) => {
  const { cartItems } = req.body;

  // create cart items and then get the cart id and find by id
  try {
    const newCartItem = await CartItem.create(cartItems);

    if (newCartItem.length === 0)
      return next(new AppError(`Couldn't Create Cart Items`, 400));

    const currentCart = await Cart.findById(newCartItem[0].cart).populate({
      path: "items",
      populate: "product",
    });

    const totalPrice = countCartTotalPrice(currentCart.items);

    const updatedCart = await Cart.findByIdAndUpdate(
      currentCart._id,
      { totalPrice },
      { new: true, runValidator: true }
    )
      .populate({
        path: "items",
        populate: "product",
      })
      .populate("user");
    const items = updatedCart.items.map((item) => {
      return {
        product_id: item.product._id.toString(),
        name: item.product.name,
        amount_cents: item.product.price * 100,
        quantity: item.quantity,
      };
    });

    const response = await getPaymentKeyCreditCard(
      updatedCart.user,
      totalPrice,
      items,
      process.env.PAYMOB_CARD_INTEGRATION
    );

    res.status(200).json({
      status: "success",
      data: response,
    });
  } catch (err) {
    console.log(err);
  }
});

// put the isAuth middleware and it's allowed for users only

router.post(
  "/checkout",
  isAuth,
  restrictTo("user"),
  catchAsync(async (req, res, next) => {
    const { cartItems } = req.body;

    console.log("cartItems", cartItems);

    
    const productNExist = await validateCartItemsQuantity(cartItems);
 
    if (productNExist.length > 0) {
      return res.status(400).json({
        status: "fail",
        message: {
          en: productNExist.map((item) => item.en).join(" "),
          ar: productNExist.map((item) => item.ar).join(" "),
        },
      });
    }

    const formattedCartItems = cartItems.map((item) => {
      return {
        cart: item.cart,
        product: item.product,
        quantity: item.quantity,
        color: item.colorId,
      };
    });

    await CartItem.deleteMany({
      cart: formattedCartItems[0].cart,
    });

    logger.info(` deleting cartItems from cart ${formattedCartItems[0].cart} before creating new cartItems
      for the order`);

    const newCartItems = await CartItem.create(formattedCartItems);

    if (newCartItems.length === 0) {
      logger.error(`Couldn't Create Cart Items for the user ${req.user._id}`);
      return next(new AppError(`Couldn't Create Cart Items`, 400));
    }

    console.log("created Cart Items", newCartItems);

    const cart = await Cart.findById(newCartItems[0].cart)
      .populate({
        path: "items",
        populate: "product",
      })
      .populate("user");

      console.log(cart);
    if (!cart) {
      await CartItem.deleteMany({ cart: newCartItems[0].cart._id });

      logger.error(`Delete cartItems cuz no Cart with the id of them `);
      return next(new AppError(`No Cart with this ID`, 400));
    }

    for (let item of cart.items) {
      for (let color of item.product.colors) {
        if (color.id === item.color) {
          if (color.quantity < item.quantity) {
            await CartItem.findByIdAndDelete(item._id);

            logger.error(
              `Delete cartItems cuz the needed quantity more than the available `
            );
            return next(
              new AppError(`Your needed quantity more than the available `, 400)
            );
          }
        }
      }
    }
    const totalPrice = countCartTotalPrice(cart.items);

    const updatedCart = await Cart.findByIdAndUpdate(
      cart._id,
      { totalPrice },
      { new: true, runValidators: true }
    )
      .populate({
        path: "items",
        populate: "product",
      })
      .populate("user");

    const formattedItems = formatItemsForPayment(
      updatedCart.items,
      req.body.locale
    );

    // log the axios error

    const response = await createPaymentLinkMultiMethods(
      updatedCart.totalPrice,
      [
        +process.env.PAYMOB_CARD_INTEGRATION,
        +process.env.PAYMOB_WALLET_INTEGRATION,
      ],
      formattedItems,
      req.body.billing_data
    );

    const paymentDoc = await Payment.create({
      intention_id: response.data.id,
      user: updatedCart.user._id,
      cartItems: updatedCart.items.map((item) => item._id),
    });

    logger.info(
      `Created new Payment for user ${updatedCart.user._id} , Create Intention for the payment`
    );

    console.log("paymentDoc", paymentDoc);

    const userCookieCart = await CookieCart.findById(updatedCart.user._id);

    // if (userCookieCart) {
    //   await CookieCart.findByIdAndUpdate(
    //     { user: new mongoose.Types.ObjectId(updatedCart.user._id) },
    //     { cartItems: [] }
    //   );
    // }

    logger.info(`Created Payment Link for Multiple Method`);
    const url = generatePaymentLink(response.data.client_secret);
    res.status(200).json({
      status: "success",
      url,
    });
  })
);

router.post("/webHook", async (req, res, next) => {
  const { obj } = req.body;
  const { hmac } = req.query;

  console.log(req.body, req.query);

  const billing_data = obj.payment_key_claims.billing_data;

  console.log("billing_data", billing_data);

  const amount_cents = obj.amount_cents;
  const created_at = obj.created_at;
  const currency = obj.currency;
  const error_occured = obj.error_occured;
  const has_parent_transaction = obj.has_parent_transaction;
  const id = obj.id;
  const integration_id = obj.integration_id;
  const is_3d_secure = obj.is_3d_secure;
  const is_auth = obj.is_auth;
  const is_capture = obj.is_capture;
  const is_refunded = obj.is_refunded;
  const is_standalone_payment = obj.is_standalone_payment;
  const is_voided = obj.is_voided;
  const order_id = obj.order.id;
  const owner = obj.owner;
  const pending = obj.pending;
  const source_data_pan = obj.source_data.pan;
  const source_data_sub_type = obj.source_data.sub_type;
  const source_data_type = obj.source_data.type;
  const success = obj.success;

  const request_string =
    amount_cents +
    created_at +
    currency +
    error_occured +
    has_parent_transaction +
    id +
    integration_id +
    is_3d_secure +
    is_auth +
    is_capture +
    is_refunded +
    is_standalone_payment +
    is_voided +
    order_id +
    owner +
    pending +
    source_data_pan +
    source_data_sub_type +
    source_data_type +
    success;

  try {
    const hash = crypto
      .createHmac("sha512", process.env.HMAC)
      .update(request_string)
      .digest("hex");

    console.log(hash, req.query.hmac);
    if (hmac === hash && success === true) {
      const payment = await Payment.findOne({
        intention_id: req.body.obj.payment_key_claims.next_payment_intention,
      }).populate({
        path: "cartItems",
        populate: "product cart",
      });

      // return and log the error  that
      if (!payment) {
        logger.error(
          `Payment with the id of ${req.body.obj.payment_key_claims.next_payment_intention} not found `
        );
        return next(new AppError(`No Payment with this Intention`, 400));
      }

      console.log("payment", payment);

      const billingData = formatBilling_Data(billing_data);

      payment.cartItems.forEach((item) => console.log(item.product));

      console.log("Formated Billing Data", billingData);

      console.log(payment.cartItems.map((item) => item.product));
      const newOrder = await Order.create({
        transaction_id: obj.id,
        user: payment.user,
        orderPrice: obj.amount_cents / 100,
        items: payment.cartItems.map((item) => {
          return {
            product: {
              name: item.product.name,
              size: item.product.size,
              images: item.product.images,
            },
            price: item.product.saleProduct,
            quantity: item.quantity,
            color: item.product.colors.filter(
              (color) => color.id === item.color
            )[0],
          };
        }),
        billingData,
        paymentOrderId: obj.order.id,
      });

      // log the error and return
      if (!newOrder) {
        logger.error(`Couldn't create new order`);
        return next(new AppError(`couldn't create new order`, 400));
      }

      logger.info(`Created new order for user ${payment.user._id} `, {
        orderId: newOrder._id,
      });

      for (let item of payment.cartItems) {
        const product = await Product.findById(item.product._id);
        const colors = product.colors.map((color) =>
          color.id === item.color
            ? { ...color, quantity: color.quantity - item.quantity }
            : color
        );
        const quantity = colors.reduce(
          (total, color) => total + color.quantity,
          0
        );
        product.colors = colors;
        product.quantity = quantity;
        await product.save();
      }

      await CartItem.deleteMany({
        cart: new mongoose.Types.ObjectId(payment.cartItems[0].cart._id),
      });

      logger.info(`Delete the cart Items after create the order for it `);
      await Cart.findByIdAndUpdate(payment.cartItems[0].cart._id, {
        totalPrice: 0,
      });

      await CookieCart.findOneAndUpdate(
        {
          user: new mongoose.Types.ObjectId(payment.user),
        },
        {
          cartItems: [],
        }
      );
    }
  } catch (err) {
    // log the error
    console.log(err);

    return next(new AppError(err.message, 400));
  }
});

router.get("/acceptPayment", async (req, res) => {
  let success = req.query.success;

  console.log(req.body, req.query, req.params);
  try {
    if (success === "true") {
      res.redirect("http://localhost:3000/en/user/payment/status=success");
    } else {
      res.redirect("http://localhost:3000/en/user/payment/status=failed");
    }
  } catch (error) {
    next(createError(500, error.message));
  }
});

// router.get("/acceptPayment", async (req, res) => {
//   let success = req.query.success;

//   console.log(req.body, req.query, req.params);
//   try {
//     if (success === "true") {
//       res.redirect("https://ecs-commerce.vercel.app/en/user/payment/status=success");
//     } else {
//       res.redirect("https://ecs-commerce.vercel.app/en/user/payment/status=failed");
//     }
//   } catch (error) {
//     next(createError(500, error.message));
//   }
// });
export default router;
