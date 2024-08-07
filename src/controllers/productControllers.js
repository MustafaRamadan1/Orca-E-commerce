import ApiFeature from "../utils/ApiFeature.js";
import AppError from "../utils/AppError.js";
import Product from "../Db/models/product.model.js";
import { catchAsync } from "../utils/catchAsync.js";
import {
  cloudinaryUploadImg,
  cloudinaryDeleteImg
} from "../utils/cloudinary.js";
import {
  deletePhotoFromServer,
  uploadToCloudinary
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
  let { name, description, price, category, quantity, size, discount, colors } =
    req.body;

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

  const colorsQuantity = bodyColors.reduce((total, cur) => {
    return total + cur.quantity;
  }, 0);

  if (+colorsQuantity !== +req.body.quantity)
    return next(
      new AppError(
        `colors total quantity not qual quantity please provide valide value `,
        400
      )
    );

  let subCategory = req.body.subCategory;

  if (req.body.subCategory) {
    subCategory = [...new Set([...subCategory])];

    console.log("subCategory", subCategory);
  }

  name = JSON.parse(name);

  description = JSON.parse(description);

  const product = await Product.findOne({ "name.en": name.en });

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
    subCategory
  });

  if (!newProduct) {
    for (let img of images) {
      await cloudinaryDeleteImg(img.id);
    }
    return next(new AppError(`Couldn't Create new Product`, 400));
  }

  res.status(201).json({
    status: "success",
    data: newProduct
  });
});

export const getProduct = catchAsync(async (req, res, next) => {
  const { slug } = req.params;

  const products = await Product.aggregate([
    {
      $match: { slug }
    },
    {
      $group: {
        _id: "$size.value",
        slug: { $first: "$slug" },
        name: { $first: "$name" },
        description: { $first: "$description" },
        price: { $first: "$price" },
        category: { $first: "$category" },
        subCategory: { $first: "$subCategory" },
        quantity: { $sum: "$quantity" },
        discount: { $first: "$discount" },
        colors: { $first: "$colors" },
        productId: { $first: "$_id" },
        saleProduct: {
          $first: {
            $subtract: [
              "$price",
              { $divide: [{ $multiply: ["$price", "$discount"] }, 100] }
            ]
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
            slug: "$slug",
            description: "$description",
            price: "$price",
            category: "$category",
            subCategory: "$subCategory",
            quantity: "$quantity",
            discount: "$discount",
            colors: "$colors",
            productId: "$productId",
            saleProduct: "$saleProduct"
          }
        }
      }
    },
    {
      $lookup: {
        from: "products",
        localField: "products.name",
        foreignField: "name",
        as: "allProducts"
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

  console.log(products);
  if (!products.length) return next(new AppError(`No Product Found`, 404));

  console.log(products);

  res.status(200).json({
    status: "success",
    data: products[0]
  });
});

export const getAllProducts = catchAsync(async (req, res, next) => {
  const totalDocumentCount = await Product.countDocuments();

  const limit = req.query.limit * 1 || 5;

  const apiFeature = new ApiFeature(Product.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .pagination(totalDocumentCount);

  const pagesNumber = await new ApiFeature(Product.find(), req.query).filter()
    .query;

  const products = await apiFeature.query;

  res.status(200).json({
    status: "success",
    result: products.length,
    pagesNumber: Math.ceil(pagesNumber.length / limit),
    data: products
  });
});

export const updateProduct = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  let images = [];
  let bodyColors = [];
  let bodyImages = [];
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

    req.body.colors = bodyColors;
  }

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

  if (req.body.size) {
    req.body.size = JSON.parse(req.body.size);
  }

  const colorsQuantity = bodyColors.reduce((total, cur) => {
    return total + cur.quantity;
  }, 0);

  console.log(colorsQuantity, +req.body.quantity);

  if (+colorsQuantity !== +req.body.quantity)
    return next(
      new AppError(
        `colors total quantity not qual quantity please provide valide value `,
        400
      )
    );

  let subCategory = req.body.subCategory;

  if (req.body.subCategory) {
    subCategory = [...new Set([...subCategory])];

    console.log("subCategory", subCategory);
  }

  const product = await Product.findById(id);

  if (!product) {
    for (let image of req.images) {
      await deletePhotoFromServer(image);
    }
    return next(new AppError(`No Product with this id`, 404));
  }

  if (req.images.length === 3) {
    const uploadedImages = await uploadToCloudinary(req.images);
    for (let file of req.images) {
      await deletePhotoFromServer(file);
    }

    for (let image of product.images) {
      await cloudinaryDeleteImg(image.id);
    }

    images.push(...uploadedImages);

    // await Product.findOneAndUpdate({ name:product.name }, { images });
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
    // await Product.findOneAndUpdate({ name:product.name }, { images });
    for (let image of differenceImg) {
      await cloudinaryDeleteImg(image.id);
    }
  }

  req.body.description = JSON.parse(req.body.description);

  const updatedProductBySlug = await Product.updateMany(
    {
      slug: product.slug
    },
    { name: JSON.parse(req.body.name) || product.name, images }
  );

  delete req.body.name;
  delete req.body.images;

  const updatedProductById = await Product.findByIdAndUpdate(
    id,
    {
      ...req.body,
      subCategory,
      images
    },
    {
      new: true,
      runValidators: true
    }
  );

  console.log("updatedProductById", updatedProductById);

  if (!updatedProductById)
    return next(
      new AppError(
        `Couldn't Update the Product , No Product with this Id `,
        404
      )
    );

  // await Product.updateMany(
  //   { slug: updatedProductById.slug },
  //   { images }
  // );

  res.status(200).json({
    status: "success",
    message: "Updated Successfully",
    data: updatedProductById
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
    message: "Deleted Successfully"
  });
});

export const filterProducts = catchAsync(async (req, res, next) => {
  let allProducts = [];
  const { lang, letters } = req.query;

  let query = {};

  if (letters) {
    const regex = new RegExp(
      letters
        .split("")
        .map((letters) => `(?=.*${letters})`)
        .join(""),
      "i"
    );

    if (lang === "en") {
      query["name.en"] = regex;
    } else if (lang === "ar") {
      query["name.ar"] = regex;
    }

    allProducts = await Product.find(query);
  } else {
    allProducts = [];
  }

  console.log(allProducts);

  res.status(200).json({
    status: "success",
    length: allProducts.length,
    data: allProducts
  });
});

export const getProductById = catchAsync(async (req, res, next) => {
  const { params } = req.params;

  console.log(params);
  const currentProduct = await Product.findById(params)
    .populate({
      path: "category",
      select: "-__v -updatedAt -createdAt"
    })
    .populate({
      path: "subCategory",
      select: "-__v -updatedAt -createdAt"
    });

  if (!currentProduct)
    return next(new AppError(`No Product with this ID`, 404));

  res.status(200).json({
    status: "success",
    data: currentProduct
  });
});

export const getProductsColors = catchAsync(async (req, res, next) => {
  const allProducts = await Product.find({}, { colors: 1, _id: 0 });

  const colors = [];

  for (let product of allProducts) {
    const productsColors = product.colors.map((color) => color.label);

    colors.push(...productsColors);
  }

  const uniqueColors = new Set(colors);

  res.status(200).json({
    status: "success",
    data: [...uniqueColors]
  });
});

export const getAllProductsAdmin = catchAsync(async (req, res, next) => {
  const totalDocumentCount = await Product.countDocuments();

  const limit = req.query.limit * 1 || 5;

  const apiFeature = new ApiFeature(Product.find(), req.query)
    .sort()
    .limitFields()
    .pagination(totalDocumentCount);

  const allProducts = await apiFeature.query;
  res.status(200).json({
    status: "success",
    result: allProducts.length,
    numPages: Math.ceil(totalDocumentCount / limit),
    data: allProducts
  });
});
