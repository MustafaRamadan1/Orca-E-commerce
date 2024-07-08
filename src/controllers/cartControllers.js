import AppError from "../utils/AppError.js";
import { catchAsync } from "../utils/catchAsync.js";
import Cart from "../Db/models/cart.model.js";

export const createCart = catchAsync(async (req, res, next) => {
  const { user } = req.body;

  const newCart = await Cart.create({ user });

  if (!newCart) return next(new AppError(`Couldn't Create new Cart`, 400));

  res.status(201).json({
    status: "success",
    data: newCart,
  });
});

export const getAllCarts = catchAsync(async (req, res, next) => {
  const allCarts = await Cart.find().populate({
    path: "user",
    select: "-__v -password -createdAt -updatedAt -passwordChangedAt",
  });


  if (!allCarts) return next(new AppError(`No Carts Found`, 404));

  res.status(200).json({
    status: "success",
    data: allCarts,
  });
});


export const getCartByUserId = catchAsync(async (req, res, next) => {

    const {id} = req.params;

    const userCart = await Cart.findOne({user:id}).populate({
        path: 'user',
        select: "-__v -password -createdAt -updatedAt -passwordChangedAt",
    });


    if(!userCart) return next(new AppError(`No User with this ID`, 400));


    res.status(200).json({
        status: 'success',
        data: userCart
    })
});


export const deleteCart = catchAsync(async (req, res ,next)=>{

  const {id} = req.params;

  const deletedCart = await Cart.findByIdAndDelete(id);

  if(!deletedCart) return next(new AppError(`No Cart With this id`, 400));

  res.status(204).json({
    status: 'success',
    message: 'Cart Deleted Successfully'
  })
})


export const getCart = catchAsync(async (req, res, next) => {

  const {id} = req.params;

  const currentCart = await Cart.findById(id).populate({
    path: 'user',
    select: "-__v -password -createdAt -updatedAt -passwordChangedAt",
});

if(!currentCart) return next(new AppError(`No Cart With this id`, 400));


res.status(200).json({
  status: 'success',
  data: currentCart
})
})