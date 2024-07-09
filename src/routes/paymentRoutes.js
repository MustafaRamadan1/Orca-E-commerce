import {Router} from 'express';
import Cart from '../Db/models/cart.model.js'
import AppError from '../utils/AppError.js';
import CartItem from '../Db/models/cartItem.model.js';
import { countCartTotalPrice } from '../utils/helperFunc.js';
import { getPaymentKeyCreditCard} from '../payment/paymentHandler.js';
const router = Router();

// router.post('/pay',async (req, res ,next)=>{
    
//     const {cart, product, quantity} = req.body;
//     // create cart items and then get the cart id and find by id
//     try{
            

//         const newCartItem = await CartItem.create({product, cart,quantity});

//         if(!newCartItem) return next(new AppError(`Couldn't Create new Cart Item`, 400));

//         const currentCart = await Cart.findById(newCartItem.cart).populate({
//             path:'items',
//             populate:'product'
//         });

//         const totalPrice = countCartTotalPrice(currentCart.items);

//         const updatedCart = await Cart.findByIdAndUpdate(currentCart._id, {totalPrice}, {new:true, runValidator:true})
//         .populate({
//             path:'items',
//             populate:'product'
//         })

        

//         res.status(200).json({
//             status:'success',
//             data:updatedCart
//         })
//     }
//     catch(err){
//         console.log(err)
//     }
// })


router.post('/pay',async (req, res ,next)=>{
    
        const {cartItems}= req.body;
        // create cart items and then get the cart id and find by id
        try{
                
    
            const newCartItem = await CartItem.create(cartItems);
    
            if(newCartItem.length === 0) return next(new AppError(`Couldn't Create Cart Items`, 400));
    
            const currentCart = await Cart.findById(newCartItem[0].cart).populate({
                path:'items',
                populate:'product'
            });
    
            const totalPrice = countCartTotalPrice(currentCart.items);
    
            const updatedCart = await Cart
            .findByIdAndUpdate(currentCart._id, {totalPrice}, {new:true, runValidator:true})
            .populate({
                path:'items',
                populate:'product'
            }).populate('user')
            const items = updatedCart.items.map((item)=>{
                return { 
                    product_id: item.product._id.toString(),
                    name: item.product.name,
                    amount_cents: item.product.price * 100,
                    quantity: item.quantity
                }
            });

           const response = await  getPaymentKeyCreditCard(updatedCart.user,totalPrice,items,process.env.PAYMOB_WALLET_INTEGERATION);
            
    
            res.status(200).json({
                status:'success',
                data:response
            })
        }
        catch(err){
            console.log(err)
        }
    })
    
export default router;