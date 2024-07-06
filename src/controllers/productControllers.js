import fs from "fs";
import AppError from "../utils/AppError.js";
import Product from "../Db/models/product.model.js";
import { catchAsync } from "../utils/catchAsync.js";
import {
  cloudinaryUploadImg,
  cloudinaryDeleteImg,
} from "../utils/cloudinary.js";
import {
  deletePhotoFromServer,
  uploadToCloudinary,
} from "../utils/uploadImgHelperFunc.js";

export const createProduct = catchAsync(async (req, res, next) => {
  console.log(req.body);
  const {
    name,
    description,
    price,
    category,
    quantity,
    size,
    discount,
    colors,
    subCategory,
  } = req.body;

  if (
    !name ||
    !description ||
    !price ||
    !category ||
    !quantity ||
    !size ||
    !discount
  ) {
    for (let file of req.images) {
      await deletePhotoFromServer(file);
    }
    return next(new AppError(`Please Provide Required Fields`, 400));
  }

  const product = await Product.findOne({ name });
  let images = [];
  if (product) {
    const uploadedImages = await uploadToCloudinary(req.images);
    for (let file of req.images) {
      await deletePhotoFromServer(file);
    }
    images = [...product.images,...uploadedImages ];
  } else {
    images = await uploadToCloudinary(req.images);
    for (let file of req.images) {
      await deletePhotoFromServer(file);
    }
  }

  
  const newProduct = await Product.create({
    name,
    description,
    price: Number(JSON.parse(price)),
    category,
    quantity: Number(JSON.parse(quantity)),
    size: JSON.parse(size),
    discount: Number(JSON.parse(discount)),
    colors: JSON.parse(colors),
    images,
    subCategory,
  });

  if (!newProduct) {
    for (let img of images) {
      await cloudinaryDeleteImg(img.id);
    }
    return next(new AppError(`Couldn't Create new Product`, 400));
  }

  res.status(201).json({
    status: "success",
    data: newProduct,
  });
});

export const getProduct = catchAsync(async (req, res, next) => {
  const { slug } = req.params;
  const products = await Product.aggregate([
    {
      $match: { slug: slug }
    },
    {
      $group: {
        _id: "$size.value",
        name: { $first: "$name" },
        description: { $first: "$description" },
        price: { $first: "$price" },
        category: { $first: "$category" },
        subCategory: { $first: "$subCategory" },
        quantity: { $sum: "$quantity" },
        discount: { $first: "$discount" },
        colors: { $first: "$colors" },
        saleProduct: { 
          $first: { 
            $subtract: ["$price", { $divide: [{ $multiply: ["$price", "$discount"] }, 100] }] 
          } 
        }
      }
    },
    {
      $group: {
        _id: null,
        totalQuantity: { $sum: "$quantity" },
        products: {
          $push: {
            size: "$_id",
            name: "$name",
            description: "$description",
            price: "$price",
            category: "$category",
            subCategory: "$subCategory",
            quantity: "$quantity",
            discount: "$discount",
            colors: "$colors",
            saleProduct: "$saleProduct"
          }
        }
      }
    },
    {
      $lookup: {
        from: 'products',
        localField: 'products.name',
        foreignField: 'name',
        as: 'allProducts'
      }
    },
    {
      $project: {
        _id: 0,
        totalQuantity: 1,
        images: { $arrayElemAt: ["$allProducts.images", 0] },
        products: 1
      }
    }
]);


  if (!products.length) return next(new AppError(`No Product Found`, 404));

  res.status(200).json({
    status: "success",
    data: products[0],
  });
});

export const getAllProducts = catchAsync(async (req, res, next) => {
  let products = Product.find();

  // filtering

  const queryString = { ...req.query };
  const excludeFields = ["page", "sort", "limit", "fields"];

  excludeFields.forEach((field) => delete queryString[field]);

  products = products.find(queryString);

  // sort

  if (req.query.sort) {
    const sortBy = req.query.sort.split(",").join(" ");
    products = products.sort(sortBy);
  } else {
    products = products.sort("-createdAt");
  }

  // pagination

  const page = req.query.page * 1 || 1;
  const limit = req.query.limit * 1 || 2;
  const skip = (page - 1) * limit;

  const documentCounts = await Product.countDocuments();

  if (documentCounts < skip)
    return next(new AppError(`No Products Available in that page`, 404));

  products = products.skip(skip).limit(limit);

  products = await products.populate('category').populate('subCategory')

  if (!products) return next(new AppError(`No Products in DB`, 404));

  res.status(200).json({
    status: "success",
    result: products.length,
    data: products,
  });
});

export const updateProduct = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  
  // find Product
  const bodyImages = req.body.images? JSON.parse(req.body.images): undefined;
  const product = await Product.findById(id);

  if (!product) {
    for (let image of req.images) {
      await deletePhotoFromServer(image);
    }
    return next(new AppError(`No Product with this id`, 404));
  }

  let cloudinaryImages = [];
  const uploadedCloudImages =  await uploadToCloudinary(req.images);
  

  cloudinaryImages.push(...uploadedCloudImages);

  if(bodyImages) cloudinaryImages.push(...bodyImages)

  
  for (let image of req.images) {
    await deletePhotoFromServer(image);
  }
  
  if(bodyImages){
    const requestImageId = bodyImages.map((image)=> image.id);
    const differenceImages = product.images.filter((image)=> !requestImageId.includes(image.id));

    for (let image of differenceImages) {
      await cloudinaryDeleteImg(image.id);  
    }
  }
  else{
    for (let image of product.images) {
      await cloudinaryDeleteImg(image.id);  
    }
  }
  

  const updatedProduct = await Product.findByIdAndUpdate(
    id,
    {
      ...req.body,
      images: cloudinaryImages,
    },
    {
      new: true,
      runValidators: true,
    }
  );

  if (!updatedProduct)
    return next(
      new AppError(
        `Couldn't Update the Product , No Product with this Id `,
        404
      )
    );

  res.status(200).json({
    status: "success",
    message: "Updated Successfully",
    data: updatedProduct,
  });
});



export const deleteProduct = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const product = await Product.findById(id);
  if (!product) return next(new AppError(`No Product with this id`, 404));

  const imgsId = product.images.map((img) => img.id);

  for (let id of imgsId) {
    await cloudinaryDeleteImg(id);
  }
  const deletedProduct = await Product.findByIdAndDelete(id);

  if (!deletedProduct)
    return next(
      new AppError(
        `Couldn't Delete the Product , No Product with this Id `,
        404
      )
    );

  res.status(204).json({
    status: "success",
    message: "Deleted Successfully",
  });
});


export const filterProducts = catchAsync(async (req, res,next)=>{


  let allProducts = [];
  const {letters} = req.query;

  let query ={};

 if(letters){
  const regex = new RegExp(
    letters
      .split("")
      .map((letters) => `(?=.*${letters})`)
      .join(""),
    "i"
  );

  query.name = regex;


  allProducts =  await Product.find(query);
  console.log(allProducts)

 }else{
  allProducts = [];
 }

 console.log(allProducts)
 res.status(200).json({
  status: 'success',
  length: allProducts.length,
  data: allProducts
 })
})