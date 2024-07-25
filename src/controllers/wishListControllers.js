import { catchAsync } from "../utils/catchAsync.js";
import AppError from "../utils/AppError.js";
import WishList from '../Db/models/wishList.model.js'
export const addItemToWishList = catchAsync(async (req, res ,next)=>{
  
    const {item} = req.body;

    let currentWishList = await WishList.findOne({user: req.user._id});

    if(!currentWishList){

         currentWishList = await WishList.create({user: req.user._id, items:[item]});

        if(!currentWishList) return next(new AppError(`Couldn't create wishList and add item on it `, 400));
    }
    else{
        currentWishList.items = [...currentWishList.items, item]
       currentWishList =  await currentWishList.save();
    }


    res.status(201).json({
        status:'success',
        data:currentWishList
    })


});


export const getAllWishLists = catchAsync(async (req, res ,next)=>{

    const totalDocumentNumber = await WishList.countDocuments();
    
    let allWishLists =  WishList.find().populate({
        path:'user',
        select:'-createdAt -updatedAt  -passwordChangedAt -otpCode -otpExpired'
    }).populate({
        path:'items',
        select:'-createdAt -updatedAt -__v'
    });


    allWishLists = allWishLists.sort('-createdAt');


    const limit = req.query.limit *1  || 3;
    const page = req.query.page * 1 || 1;
    const skip = (page - 1 ) * limit;

    allWishLists = allWishLists.skip(skip).limit(limit);


    if(skip >= totalDocumentNumber){

        allWishLists = new Promise((resolve)=>{

            resolve([])
        });
    }

    allWishLists = await allWishLists;

    res.status(200).json({
        status:'success',
        result: allWishLists.length,
        numPages: Math.ceil(totalDocumentNumber / limit),
        data:allWishLists
    })

});



export const getWishListForUser = catchAsync(async (req, res ,next)=>{

    const {userId} = req.params;


    const userWishList = await WishList.findOne({user:userId}).populate({
        path:'user',
        select:'-createdAt -updatedAt  -passwordChangedAt -otpCode -otpExpired'
    }).populate({
        path:'items',
        select:'-createdAt -updatedAt -__v'
    });


    if(!userWishList) return next(new AppError(`No WishList for that user`,404));

    res.status(200).json({
        status:'success',
        data:userWishList
    })
});


export const deleteItemFromUserWishList = catchAsync(async (req, res , next)=>{
  
    const {itemId} = req.body;
    const userWishList = await WishList.findOne({user: req.user._id});

    if(!userWishList) return next(new AppError(`No WishList created for that user`,400));


    userWishList.items = [...userWishList.items.filter((item)=> item !== itemId)];
    const updatedWishList = (await userWishList.save())


    res.status(200).json({
        status:'success',
        message: 'WishList Item Deleted Successfully',
        data:updatedWishList
})
})