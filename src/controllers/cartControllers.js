import AppError from "../utils/AppError.js";
import { catchAsync } from "../utils/catchAsync.js";
import Cart from '../Db/models/cart.model.js'

export const createCart = catchAsync(async  (req, res ,next)=>{

    const { user } = req.body;

    const newCart = await Cart.create({user});

    if(!newCart) return next(new AppError(`Couldn't Create new Cart`, 400));    

    res.status(201).json({
        status: 'success',
        data: newCart
    })
});


