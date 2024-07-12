import { Router } from "express";
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

router.post(
  "/checkout",
  catchAsync(async (req, res, next) => {
    const { cartItems } = req.body;

    const newCartItems = await CartItem.create(cartItems);

    if (!newCartItems)
      return next(new AppError(`Couldn't Create Cart Items`, 400));

    const cart = await Cart.findById(newCartItems[0].cart)
      .populate({
        path: "items",
        populate: "product",
      })
      .populate("user");

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

    const formattedItems = formatItemsForPayment(updatedCart.items);

    const response = await createPaymentLinkMultiMethods(
      updatedCart.totalPrice,
      [
        +process.env.PAYMOB_CARD_INTEGRATION,
        +process.env.PAYMOB_WALLET_INTEGRATION,
      ],
      formattedItems,
      cart.user
    );
    console.log(`Response is next`);
    console.log(response)
    const url = generatePaymentLink(response.data.client_secret);
    res.status(200).json({
      status: "success",
      url,
    });
  })
);


router.post('/webHook', (req, res , next)=>{

    console.log(req.body, req.params, req.query);

    res.status(200).send(`<h1>Welcome to the webhook</h1>`)
})
export default router;
