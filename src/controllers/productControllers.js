import AppError from "../utils/AppError.js";
import Product from "../Db/models/product.model.js";
import { catchAsync } from "../utils/catchAsync.js";

export const createProduct = catchAsync(async (req, res, next) => {
  const { name, description, price, category, quantity, size, discount } =
    req.body;

  if (
    !name ||
    !description ||
    !price ||
    !category ||
    !quantity ||
    !size ||
    !discount
  )
    return next(new AppError(`Please Provide Required Fields`, 404));

  const newProduct = await Product.create({
    name,
    description,
    price,
    category,
    quantity,
    size,
    discount,
  });

  if (!newProduct)
    return next(new AppError(`Couldn't Create new Product`, 400));

  res.status(201).json({
    status: "success",
    data: newProduct,
  });
});

export const getProduct = catchAsync(async (req, res, next) => {
  const { slug } = req.params;
  const products = await Product.aggregate([
    { $match: { slug } },
    // Lookup to fetch category and subcategory details
    {
      $lookup: {
        from: "categories",
        localField: "category",
        foreignField: "_id",
        as: "category",
      },
    },
    {
      $lookup: {
        from: "subcategories",
        localField: "subCategory",
        foreignField: "_id",
        as: "subcategory",
      },
    },
    // Unwind sizes array to work with each size individually
    { $unwind: "$size" },
    // Group by slug and size to calculate quantity and price details
    {
      $group: {
        _id: { slug: "$slug", size: "$size" },
        productId: { $first: "$_id" },
        name: { $first: "$name" },
        description: { $first: "$description" },
        slug: { $first: "$slug" },
        category: { $first: "$category" },
        subcategory: { $first: "$subcategory" },
        quantity: { $sum: "$quantity" },
        price: { $first: "$price" },
        discount: { $first: "$discount" },
        productSalePrice: {
          $first: {
            $round: [
              {
                $subtract: [
                  "$price",
                  { $multiply: ["$price", { $divide: ["$discount", 100] }] },
                ],
              },
              2,
            ],
          },
        },
      },
    },
    // Group again by slug to calculate total quantity across all sizes
    {
      $group: {
        _id: "$_id.slug",
        productId: { $first: "$productId" },
        name: { $first: "$name" },
        description: { $first: "$description" },
        slug: { $first: "$_id.slug" },
        category: { $first: "$category" },
        subcategory: { $first: "$subcategory" },
        sizes: {
          $push: {
            size: "$_id.size",
            quantity: "$quantity",
            price: "$price",
            discount: "$discount",
            productSalePrice: "$productSalePrice",
          },
        },
        totalQuantity: { $sum: "$quantity" },
      },
    },
    {
      $project: { _id: 0 },
    },
  ]);

  if(!products.length) return next(new AppError(`No Product Found`, 404));


  res.status(200).json({
    status: "success",
    data: products[0],
  });
});

export const getAllProducts = catchAsync(async (req, res, next) => {

    let products =  Product.find();

    
    // filtering 
    
    const queryString  = {...req.query};
    const excludeFields = ['page', 'sort', 'limit', 'fields'];
    
    excludeFields.forEach((field) => delete queryString[field]);
    
    products = products.find(queryString);
    
    // sort 
    
    if(req.query.sort){
        const sortBy = req.query.sort.split(',').join(' ');
        products = products.sort(sortBy);
    }
    else{
        products = products.sort('-createdAt');
    }

    // pagination 
    
    const page = req.query.page * 1 || 1;
    const limit  = req.query.limit * 1 || 2;
    const skip = (page - 1) * limit;

    const documentCounts = await Product.countDocuments();

    if(documentCounts < skip) return next(new AppError(`No Products Available in that page`, 404));
    
    products = products.skip(skip).limit(limit);

    products = await products;
    
    if(!products) return next(new AppError(`No Products in DB`,404));
    
    res.status(200).json({
    status: "success",
    data: products,
  });
});
