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
  let bodyImages = [];

  let bodyColors = [];

  if (req.body.colors) {
    if (req.body.colors.constructor.name === "Array") {
      bodyColors = req.body.colors
        ? req.body.colors.map((color) => {
            return JSON.parse(color);
          })
        : [];
    } else if (JSON.parse(req.body.colors).constructor.name === "Object") {
      bodyColors = [JSON.parse(req.body.colors)];
    }
  }

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
    if (req.images.length === 3) {
      const uploadedImages = await uploadToCloudinary(req.images);
      for (let file of req.images) {
        await deletePhotoFromServer(file);
      }

      for (let image of product.images) {
        await cloudinaryDeleteImg(image.id);
      }

      images.push(...uploadedImages);

      await Product.findOneAndUpdate({ name }, { images });
    } else if (bodyImages.length === 3) {
      images.push(...bodyImages);
    } else {
      const imagesId = bodyImages.map((image) => image.id);
      const differenceImg = product.images.filter(
        (image) => !imagesId.includes(image.id)
      );
      const uploadedImages = await uploadToCloudinary(req.images);

      for (let file of req.images) {
        await deletePhotoFromServer(file);
      }
      images.push(...uploadedImages);
      images.push(...bodyImages);
      await Product.findOneAndUpdate({ name }, { images });
      for (let image of differenceImg) {
        await cloudinaryDeleteImg(image.id);
      }
    }
  } else {
    images = await uploadToCloudinary(req.images);
    for (let file of req.images) {
      await deletePhotoFromServer(file);
    }
  }

  console.log(req.body);

  const newProduct = await Product.create({
    name,
    description,
    price: Number(JSON.parse(price)),
    category,
    quantity: Number(JSON.parse(quantity)),
    size: JSON.parse(size),
    discount: Number(JSON.parse(discount)),
    colors: bodyColors,
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
  const { params } = req.params;
  console.log(`inside the aggregation `);
  console.log(params);
  const products = await Product.aggregate([
    {
      $match: { slug: params },
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
        productId: { $first: "$_id" },
        salePrice: {
          $first: {
            $subtract: [
              "$price",
              { $divide: [{ $multiply: ["$price", "$discount"] }, 100] },
            ],
          },
        },
      },
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
            productId: "$productId",
            salePrice: "$salePrice",
          },
        },
      },
    },
    {
      $lookup: {
        from: "products",
        localField: "products.name",
        foreignField: "name",
        as: "allProducts",
      },
    },
    {
      $project: {
        _id: 0,
        totalQuantity: 1,
        images: { $arrayElemAt: ["$allProducts.images", 0] },
        products: 1,
      },
    },
  ]);

  console.log(products);
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

  products = await products.populate("category").populate("subCategory");

  if (!products) return next(new AppError(`No Products in DB`, 404));

  res.status(200).json({
    status: "success",
    result: products.length,
    data: products,
  });
});

export const updateProduct = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  console.log(id, req.body);

  if (req.body.colors) {
    req.body.colors = JSON.parse(req.body.colors);
  }

  if (req.body.size) {
    req.body.size = JSON.parse(req.body.size);
  }

  // find Product
  let bodyImages = [];

  if (req.body.images) {
    if (req.body.images.constructor.name === "Array") {
      bodyImages = req.body.images
        ? req.body.images.map((image) => {
            return JSON.parse(image);
          })
        : [];
    } else if (JSON.parse(req.body.images).constructor.name === "Object") {
      bodyImages = [JSON.parse(req.body.images)];
    }
  }
  const product = await Product.findById(id);

  if (!product) {
    for (let image of req.images) {
      await deletePhotoFromServer(image);
    }
    return next(new AppError(`No Product with this id`, 404));
  }

  let cloudinaryImages = [];

  // if(bodyImages.length === 3){
  //   cloudinaryImages.push(...bodyImages)
  // }
  // else
  if (req.images.length === 3) {
    const uploadedCloudImages = await uploadToCloudinary(req.images);
    cloudinaryImages.push(...uploadedCloudImages);
    for (let image of product.images) {
      await cloudinaryDeleteImg(image.id);
    }

    for (let image of req.images) {
      await deletePhotoFromServer(image);
    }
  } else {
    const uploadedCloudImages = await uploadToCloudinary(req.images);
    cloudinaryImages.push(...uploadedCloudImages);
    cloudinaryImages.push(...bodyImages);
    const imagesId = bodyImages.map((image) => image.id);
    const differentImages = product.images.filter(
      (image) => !imagesId.includes(image.id)
    );
    for (let image of differentImages) {
      await cloudinaryDeleteImg(image.id);
    }

    for (let image of req.images) {
      await deletePhotoFromServer(image);
    }
  }

  // if(bodyImages) cloudinaryImages.push(...bodyImages)

  // for (let image of req.images) {
  //   await deletePhotoFromServer(image);
  // }

  // if(bodyImages){
  //   const requestImageId = bodyImages.map((image)=> image.id);
  //   const differenceImages = product.images.filter((image)=> !requestImageId.includes(image.id));

  //   for (let image of differenceImages) {
  //     await cloudinaryDeleteImg(image.id);
  //   }
  // }
  // else{
  //   for (let image of product.images) {
  //     await cloudinaryDeleteImg(image.id);
  //   }
  // }

  console.log(product.slug);

  const updatedProductBySlug = await Product.updateMany(
    {
      slug: product.slug,
    },
    { name, images: cloudinaryImages }
  );

  delete req.body.name;
  delete req.body.images;

  

  const updatedProductById = await Product.findByIdAndUpdate(
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

  await Product.updateMany(
    { slug: updatedProduct.slug },
    { images: cloudinaryImages }
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

export const filterProducts = catchAsync(async (req, res, next) => {
  let allProducts = [];
  const { letters } = req.query;

  let query = {};

  if (letters) {
    const regex = new RegExp(
      letters
        .split("")
        .map((letters) => `(?=.*${letters})`)
        .join(""),
      "i"
    );

    query.name = regex;

    allProducts = await Product.find(query);
  } else {
    allProducts = [];
  }

  res.status(200).json({
    status: "success",
    length: allProducts.length,
    data: allProducts,
  });
});

export const getProductById = catchAsync(async (req, res, next) => {
  const { params } = req.params;

  console.log(params);
  const currentProduct = await Product.findById(params)
    .populate({
      path: "category",
      select: "-__v -updatedAt -createdAt",
    })
    .populate({
      path: "subCategory",
      select: "-__v -updatedAt -createdAt",
    });

  if (!currentProduct)
    return next(new AppError(`No Product with this ID`, 404));

  res.status(200).json({
    status: "success",
    data: currentProduct,
  });
});
