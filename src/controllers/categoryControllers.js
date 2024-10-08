import { catchAsync } from "../utils/catchAsync.js";
import AppError from "../utils/AppError.js";
import Category from "../Db/models/category.model.js";
import subCategory from "../Db/models/sub-Category.model.js";
import Product from "../Db/models/product.model.js";
import ApiFeature from "../utils/ApiFeature.js";
// create category , get all categories , get one cateogry , update one , delete one

export const createCategory = catchAsync(async (req, res, next) => {
  const { name, description } = req.body;

  // if(!name || !description) return next(new AppError(`Please Provide Required Fields`, 404));

  const newCategory = await Category.create({
    name,
    description,
  });

  if (!newCategory)
    return next(new AppError(`We Couldn't Create new Category`, 404));

  res.status(200).json({
    status: "success",
    data: newCategory,
  });
});

export const getAllCategories = catchAsync(async (req, res, next) => {
  let allCategories = Category.find();

  // filter
  const excludeFields = ["page", "limit", "sort"];

  const queryString = { ...req.query };

  excludeFields.forEach((field) => delete queryString[field]);

  allCategories = allCategories.find(queryString);

  // sort

  if (req.query.sort) {
    const sortBy = req.query.sort.split(",").join(" ");

    allCategories = allCategories.sort(sortBy);
  } else {
    allCategories = allCategories.sort("-createdAt");
  }

  allCategories = await allCategories;

  if (!allCategories) return next(new AppError(`No Category in the DB`, 404));

  res.status(200).json({
    status: "success",
    length: allCategories.length,
    data: allCategories,
  });
});

export const getCategory = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const category = await Category.findById(id);

  if (!category) return next(new AppError(`No Category with this ID`, 404));

  res.status(200).json({
    status: "success",
    data: category,
  });
});

export const updateCategory = catchAsync(async (req, res, next) => {
  if (Object.keys(req.body).length === 0)
    return next(
      new AppError(`Please Provide Values to Update the Category`, 404)
    );

  const { id } = req.params;

  const updatedCategory = await Category.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!updatedCategory)
    return next(
      new AppError(
        `Couldn't Update the Category , No Category with this Id `,
        404
      )
    );

  res.status(200).json({
    status: "success",
    data: updatedCategory,
    message: "Category Updated Successfully",
  });
});

export const deleteCategory = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  await subCategory.deleteMany({ category: id });
  await Product.deleteMany({ category: id });

  const deletedCategory = await Category.findByIdAndDelete(id);

  if (!deletedCategory)
    return next(new AppError("No Category with this Id", 404));

  res.status(204).json({
    status: "success",
    message: "Category Deleted Successfully",
  });
});

export const getFilteredCategories = catchAsync(async (req, res, next) => {
  const { lang, letters } = req.query;
  let query = {};



  let allCategories;
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

    allCategories = await Category.find(query);
  } else {
    allCategories = [];
  }

  if (!allCategories) return next(new AppError(`No Category in the DB`, 404));

  res.status(200).json({
    status: "success",
    length: allCategories.length,
    data: allCategories,
  });
});

export const getAllCategoriesAdmin = catchAsync(async (req, res, next) => {
  const totalDocumentCount = await Category.countDocuments();

  const limit = req.query.limit * 1 || 5;

  const apiFeature = new ApiFeature(Category.find(), req.query)
    .sort()
    .limitFields()
    .pagination(totalDocumentCount);

  const allCategories = await apiFeature.query;
  res.status(200).json({
    status: "success",
    result: allCategories.length,
    numPages: Math.ceil(totalDocumentCount / limit),
    data: allCategories,
  });
});
