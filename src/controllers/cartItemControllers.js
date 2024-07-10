import AppError from "../utils/AppError.js";
import { catchAsync } from "../utils/catchAsync.js";
import CartItem from '../Db/models/cartItem.model.js';
import Cart from '../Db/models/cart.model.js';
import { countCartTotalPrice } from "../utils/helperFunc.js";

export const createCartItem = catchAsync(async (req, res ,next)=>{

    const {product, cart, quantity} = req.body;
    
    const newCartItem = await CartItem.create({product, cart,quantity});

    if(!newCartItem) return next(new AppError(`Couldn't Create new Cart Item`, 400));

    const currentCart = await Cart.findById(newCartItem.cart).populate({
        path:'items',
        populate:'product'
      });


      if(!currentCart) {
        await CartItem.findByIdAndDelete(newCartItem._id);
        return next(new AppError(`No Cart With this id`, 400));
      }

      const totalPrice = countCartTotalPrice(currentCart.items);

       await Cart.findByIdAndUpdate(newCartItem.cart, {totalPrice: totalPrice},{runValidators:true, new:true});


    res.status(201).json({
        status: 'success',
        data:newCartItem
    })
});


export const getCartItemsPerCart = catchAsync(async (req, res, next) => {

    const {id} = req.params;

    const cartItems = await CartItem.find({cart:id}).populate('product cart');

    if(!cartItems) return next(new AppError(`No Cart Items Found For That Cart`, 404));


    res.status(200).json({
        status:'success',
        data: cartItems
    })

});


export const updateCartItem = catchAsync(async (req, res, next) => {

    const {id} = req.params;
    const {quantity} = req.body;
    const updatedCartItem = await CartItem.findByIdAndUpdate(id, {quantity}, {runValidators:true});

    if(!updatedCartItem) return next(new AppError(`No Cart Item With this id`, 404));
    const cart = await Cart.findById(updatedCartItem.cart).populate({
        path:'items',
        populate:'product'
    })
    const totalPrice =  countCartTotalPrice(cart.items);

    await Cart.findByIdAndUpdate(updatedCartItem.cart, {totalPrice: totalPrice},{runValidators:true, new:true});

    res.status(200).json({
        status:'success',
        data: updatedCartItem
    })
});



export const deleteCartItem = catchAsync(async (req, res, next) => {

    const {id}  = req.params;


    const deletedCartItem = await CartItem.findByIdAndDelete(id);
    
    if(!deletedCartItem)    return next(new AppError(`No Cart Item With this id`, 404));

    const cart = await Cart.findById(deletedCartItem.cart).populate({
        path:'items',
        populate:'product'
    })
    
    console.log(cart)
    const totalPrice = countCartTotalPrice(cart.items);
  
    await Cart.findByIdAndUpdate(deletedCartItem.cart, {totalPrice: totalPrice},{runValidators:true, new:true});

    res.status(204).json({
        status:'success',
        message: 'Cart Item Deleted Successfully',
    })
})


