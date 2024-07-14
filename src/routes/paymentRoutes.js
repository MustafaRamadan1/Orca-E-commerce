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
import Payment from '../Db/models/payment.model.js'
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
  catchAsync(async (req, res, next) => {
    const { cartItems } = req.body;
    
    const formattedCartItems = cartItems.map((item)=>{
      return {
        cart:item.cart,
        product:item.product,
        quantity:item.quantity,
        color:item.color
      }
    });
    const newCartItems = await CartItem.create(formattedCartItems);

    if (newCartItems.length === 0)
      return next(new AppError(`Couldn't Create Cart Items`, 400));

    const cart = await Cart.findById(newCartItems[0].cart)
      .populate({
        path: "items",
        populate: "product",
      })
      .populate("user");

      if(!cart) return next(new AppError(`No Cart with this ID`,400));

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

    const paymentDoc = await Payment.create({intention_id:response.data.id, user:updatedCart.user._id,
      cartItems:updatedCart.items.map((item)=> item._id)
    });

    const url = generatePaymentLink(response.data.client_secret);
    res.status(200).json({
      status: "success",
      url,
    });
}));


router.post('/webHook', async (req, res , next)=>{

    console.log(req.body, req.params, req.query);

    console.log(req.body.obj.payment_key_claims.next_payment_intention);
    const payment  = await Payment.findById(req.body.obj.payment_key_claims.next_payment_intention).populate('cartItems')
    // transaction id , success boolean true if transaction success , integration_id  the payment method  
    console.log(req.body.obj.order.shipping_data);
    console.log(req.body.obj.order.items);
    console.log(req.body.obj.payment_key_claims.billing_data);
    console.log(req.body.obj.payment_key_claims.next_payment_intention);

    console.log(payment)
    res.status(200).send(`<h1>Welcome to the webhook</h1>`)
})
export default router;
