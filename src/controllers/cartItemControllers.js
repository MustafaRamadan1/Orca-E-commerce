import AppError from "../utils/AppError.js";
import { catchAsync } from "../utils/catchAsync.js";
import CartItem from "../Db/models/cartItem.model.js";
import CookieCart from '../Db/models/cookieCart.model.js'
import Cart from "../Db/models/cart.model.js";
import { countCartTotalPrice } from "../utils/helperFunc.js";

export const createCartItem = catchAsync(async (req, res, next) => {
  const { cartItems } = req.body;

  await CartItem.deleteMany({cart:cartItems.cart});

  const formattedCartItems = cartItems.map((item) => {
    return {
      cart: item.cart,
      product: item.product,
      quantity: item.quantity,
      color: item.colorId,
    };
  });

  const newCartItems = await CartItem.create(formattedCartItems);

  if (newCartItems.length === 0)
    return next(new AppError(`Couldn't Create Cart Items`, 400));

  const currentCart = await Cart.findById(newCartItems[0].cart).populate({
    path: "items",
    populate: "product",
  });

  console.log(currentCart);

  if (!currentCart) {
    for (const key of newCartItems) {
      await CartItem.findByIdAndDelete(key._id);
    }

    return next(new AppError(`No Cart With this id`, 400));
  }

  const totalPrice = countCartTotalPrice(currentCart.items);

  await Cart.findByIdAndUpdate(
    currentCart._id,
    { totalPrice: totalPrice },
    { runValidators: true, new: true }
  );

  const cookieCart = await CookieCart.create({
    user: currentCart.user._id,
    cartItems:req.cookies.cartItems
  })
  console.log(cookieCart)
  res.status(201).json({
    status: "success",
    data: newCartItems,
  });
});

export const getCartItemsPerCart = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const cartItems = await CartItem.find({ cart: id }).populate("product cart");

  if (!cartItems)
    return next(new AppError(`No Cart Items Found For That Cart`, 404));

  res.status(200).json({
    status: "success",
    data: cartItems,
  });
});

export const updateCartItem = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { quantity } = req.body;
  const updatedCartItem = await CartItem.findByIdAndUpdate(
    id,
    { quantity },
    { runValidators: true }
  );

  if (!updatedCartItem)
    return next(new AppError(`No Cart Item With this id`, 404));
  const cart = await Cart.findById(updatedCartItem.cart).populate({
    path: "items",
    populate: "product",
  });
  const totalPrice = countCartTotalPrice(cart.items);

  await Cart.findByIdAndUpdate(
    updatedCartItem.cart,
    { totalPrice: totalPrice },
    { runValidators: true, new: true }
  );

  res.status(200).json({
    status: "success",
    data: updatedCartItem,
  });
});

export const deleteCartItem = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const deletedCartItem = await CartItem.findByIdAndDelete(id);

  if (!deletedCartItem)
    return next(new AppError(`No Cart Item With this id`, 404));

  const cart = await Cart.findById(deletedCartItem.cart).populate({
    path: "items",
    populate: "product",
  });

  console.log(cart);
  const totalPrice = countCartTotalPrice(cart.items);

  await Cart.findByIdAndUpdate(
    deletedCartItem.cart,
    { totalPrice: totalPrice },
    { runValidators: true, new: true }
  );

  res.status(204).json({
    status: "success",
    message: "Cart Item Deleted Successfully",
  });
});
