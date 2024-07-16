import { Router } from "express";
import mongoose from "mongoose";
import sha512 from 'js-sha512'
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
import isAuth from '../middlewares/authentication.js';
import restrictTo from '../middlewares/Authorization.js';
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
  "/checkout", isAuth,restrictTo('user'),
  catchAsync(async (req, res, next) => {
    const { cartItems } = req.body;
    console.log(cartItems);
    const formattedCartItems = cartItems.map((item) => {
      
      return {
        cart: item.cart,
        product: item.product,
        quantity: item.quantity,
        color: item.colorId,
      };
    });

    console.log(formattedCartItems);
    const newCartItems = await CartItem.create(formattedCartItems);

    if (newCartItems.length === 0)
      return next(new AppError(`Couldn't Create Cart Items`, 400));

    const cart = await Cart.findById(newCartItems[0].cart)
      .populate({
        path: "items",
        populate: "product",
      })
      .populate("user");

    if (!cart) {

      await CartItem.deleteMany({cart:newCartItems[0].cart._id});
      return next(new AppError(`No Cart with this ID`, 400))
    };


    for(let item of cart.items){

      for(let color of item.product.colors){
        if(color.id === item.color){
          if(color.quantity < item.quantity){
            await CartItem.findByIdAndDelete(item._id)
            return next(new AppError(`Your needed quantity more than the available `,400))
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

    const formattedItems = formatItemsForPayment(updatedCart.items);

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

    console.log(response.data);
    const paymentDoc = await Payment.create({
      intention_id: response.data.id,
      user: updatedCart.user._id,
      cartItems: updatedCart.items.map((item) => item._id),
    });

    const url = generatePaymentLink(response.data.client_secret);
    res.status(200).json({
      status: "success",
      url,
    });
  })
);

router.post("/webHook", async (req, res, next) => {
  
  const {obj} = req.body;
  const {hmac} = req.query;
  
  const payment_key_claims  = obj.payment_key_claims;
  const billing_data = obj.payment_key_claims.billing_data

  
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

try{

 
  const payment = await Payment.findOne({
    intention_id: req.body.obj.payment_key_claims.next_payment_intention,
  }).populate({
    path: "cartItems",
    populate: "product cart",
  })

  console.log(payment)
  // return and log the error  that 
  if(!payment) return next(new AppError(`No Payment with this Intention`,400));

  const billingData=  formatBilling_Data(billing_data)
  const newOrder = await Order.create({
    transaction_id: obj.id,
    user: payment.user,
    orderPrice: obj.amount_cents / 100,
    items: payment.cartItems.map((item) => {
      return {
        product: item.product._id,
        price: item.product.saleProduct,
        quantity: item.quantity,
        color:item.product.colors.filter((color)=> color.id === item.color)[0]
      };
    }),
    billingData,
    paymentOrderId: obj.order.id,
  });

  // log the error and return  
  if(!newOrder) return next(new AppError(`couldn't create new order`,400))

    console.log(`we are in the webook`)
  for (let item of payment.cartItems) {
    const product = await Product.findById(item.product._id);
    const colors = product.colors.map((color) =>
      color.id === item.color
        ? { ...color, quantity: color.quantity - item.quantity }
        : color
    );
    const quantity = colors.reduce((total, color) => total + color.quantity, 0);
    product.colors = colors;
    product.quantity = quantity;
    await product.save();
  }
  console.log(payment.cartItems)

  await CartItem.deleteMany({cart:new mongoose.Types.ObjectId(payment.cartItems[0].cart._id)});
  await Cart.findByIdAndUpdate(payment.cartItems[0].cart._id, {totalPrice:0});


}
catch(err){
  // log the error 
  console.log(err);

  return next(new AppError(err.message,400))
}
 
});

router.get('/acceptPayment',async (req,res )=>{
  let success = req.query.success;

  try {
    if (success === "true") {
      res.redirect("https://developers.paymob.com/egypt/checkout-api/integration-guide-and-api-reference/create-intention-payment-api");
    } else {
      res.redirect("https://arkan-ten.vercel.app/payment-failed");
    }
  } catch (error) {
    next(createError(500, error.message));
  }
})
export default router;
