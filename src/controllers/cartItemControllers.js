import AppError from "../utils/AppError.js";
import { catchAsync } from "../utils/catchAsync.js";
import CartItem from "../Db/models/cartItem.model.js";
import CookieCart from "../Db/models/cookieCart.model.js";
import Cart from "../Db/models/cart.model.js";
import User from "../Db/models/user.model.js";
import logger from "../utils/logger.js";
import { countCartTotalPrice } from "../utils/helperFunc.js";
import WishList from "../Db/models/wishList.model.js";
import Product from "../Db/models/product.model.js";

export const createCartItem = catchAsync(async (req, res, next) => {
  console.log("req.body: ", req.body);
  const { cartItems, wishListItems } = req.body;

  const user = await User.findById(req.body.user).populate("cart");

  if (!user) {
    logger.error(`Invalid User Id for creating cartItems`);
    return next(new AppError(`Invalid User Id`, 400));
  }

  const newCartItemsBody = [];

  for (let item of cartItems) {
    const product = await Product.findById(item.product);
    if (product) {
      product.colors.forEach((color) => {
        if (color.id === item.colorId) {
          color.quantity >= item.quantity ? newCartItemsBody.push(item) : null;
        }
      });
    }
  }

  await CookieCart.findOneAndDelete({ user: user._id });

  await CartItem.deleteMany({ cart: user.cart._id });

  await WishList.findOneAndUpdate({ user: user._id }, { items: [] });
  const formattedCartItems = newCartItemsBody.map((item) => {
    return {
      cart: user.cart._id,
      product: item.product,
      quantity: item.quantity,
      color: item.colorId
    };
  });

  const newCartItems = await CartItem.create(formattedCartItems);

  if (newCartItems.length === 0) {
    logger.error(`Couldn't Create Cart Items for the user ${user._id}`);
    return next(new AppError(`Couldn't Create Cart Items`, 400));
  }

  const currentCart = await Cart.findById(newCartItems[0].cart).populate({
    path: "items",
    populate: "product"
  });

  if (!currentCart) {
    for (const key of newCartItems) {
      await CartItem.findByIdAndDelete(key._id);
    }

    logger.error(
      `No Cart With this id and deleted the created Cart Items for the user ${user._id}`
    );
    return next(new AppError(`No Cart With this id`, 400));
  }

  const totalPrice = countCartTotalPrice(currentCart.items);

  await Cart.findByIdAndUpdate(
    currentCart._id,
    { totalPrice: totalPrice },
    { runValidators: true, new: true }
  );

  logger.info(`Update the cart total Id with the updated TotalPrice`, {
    totalPrice: totalPrice,
    userId: user._id
  });

  const wishListFormat = wishListItems.map((item) => item.product);

  await WishList.findOneAndUpdate(
    { user: user._id },
    { items: wishListFormat }
  );
  const cookieCart = await CookieCart.create({
    user: currentCart.user._id,
    cartItems: newCartItemsBody,
    wishListItems
  });

  logger.info(`Created Cart Items For The User ${user._id}`, {
    userId: user._id,
    cartItems: [...currentCart.items.map((item) => item.product._id)]
  });
  res.status(201).json({
    status: "success",
    data: newCartItems
  });
});

export const getCartItemsPerCart = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const cartItems = await CartItem.find({ cart: id }).populate("product cart");

  if (cartItems.length === 0) {
    logger.error(`No Cart Items Found For That Cart`, {
      userId: req.user._id,
      cartId: id
    });
    return next(new AppError(`No Cart Items Found For That Cart`, 404));
  }

  res.status(200).json({
    status: "success",
    data: cartItems
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

  if (!updatedCartItem) {
    logger.error(`No Cart Item With this id`, {
      userId: req.user._id,
      cartItemId: id
    });
    return next(new AppError(`No Cart Item With this id`, 404));
  }

  const cart = await Cart.findById(updatedCartItem.cart).populate({
    path: "items",
    populate: "product"
  });
  const totalPrice = countCartTotalPrice(cart.items);

  await Cart.findByIdAndUpdate(
    updatedCartItem.cart,
    { totalPrice: totalPrice },
    { runValidators: true, new: true }
  );

  logger.info(
    `Updated the cartItem with id ${id} and updated quantity ${quantity}`,
    {
      userId: req.user._id,
      cartItemId: id,
      quantity: quantity
    }
  );
  res.status(200).json({
    status: "success",
    data: updatedCartItem
  });
});

export const deleteCartItem = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const deletedCartItem = await CartItem.findByIdAndDelete(id);

  if (!deletedCartItem) {
    logger.error(`No Cart Item With this id`, {
      userId: req.user._id,
      cartItemId: id
    });
    return next(new AppError(`No Cart Item With this id`, 404));
  }

  const cart = await Cart.findById(deletedCartItem.cart).populate({
    path: "items",
    populate: "product"
  });

  console.log(cart);
  const totalPrice = countCartTotalPrice(cart.items);

  await Cart.findByIdAndUpdate(
    deletedCartItem.cart,
    { totalPrice: totalPrice },
    { runValidators: true, new: true }
  );

  logger.info(`Delete cart Item with id ${id} , Update the cart TotalPrice`, {
    userId: req.user._id,
    cartItemId: id,
    totalPrice: totalPrice
  });
  res.status(204).json({
    status: "success",
    message: "Cart Item Deleted Successfully"
  });
});
