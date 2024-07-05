import AppError from "../utils/AppError.js";
import { catchAsync } from "../utils/catchAsync.js";
import subCategory from "../Db/models/sub-Category.model.js";

export const createSubCategory = catchAsync(async (req, res, next) => {
  const { name, description, category } = req.body;

  if (!name || !description || !category)
    return next(new AppError(`Please Provide Required Fields`, 400));

  const newSubCategory = await subCategory.create({
    name,
    description,
    category,
  });

  if (!newSubCategory)
    return next(new AppError(`Couldn't Create new Category`, 400));

  res.status(201).json({
    status: "success",
    data: newSubCategory,
  });
});

export const getAllSubCategories = catchAsync(async (req, res, next) => {
  let allSubCategories = subCategory.find();

  // filtering

  const queryString = { ...req.query };
  const excludeFields = ["page", "sort", "limit", "fields"];

  excludeFields.forEach((field) => delete queryString[field]);

  allSubCategories = allSubCategories.find(queryString);
  // sort

  if (req.query.sort) {
    const sortBy = req.query.sort.split(",").join(" ");
    allSubCategories = allSubCategories.sort(sortBy);
  } else {
    allSubCategories = allSubCategories.sort("-createdAt");
  }

  allSubCategories = await allSubCategories.populate({
    path: "category",
    select: "-__v -updatedAt -createdAt",
  });

  if (!allSubCategories)
    return next(new AppError(`No SubCategories Found`, 404));

  res.status(200).json({
    status: "success",
    length: allSubCategories.length,
    data: allSubCategories,
  });
});

export const getSubCategory = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const currentSubCategory = await subCategory.findById(id).populate({
    path: "category",
    select: "-__v -updatedAt -createdAt",
  });

  if (!currentSubCategory)
    return next(new AppError(`No SubCategory with this ID`, 404));

  res.status(200).json({
    status: "success",
    data: currentSubCategory,
  });
});

export const updateSubCategory = catchAsync(async (req, res, next) => {
  if (Object.keys(req.body).length === 0)
    return next(
      new AppError(`Please Provide Values to Update the Category`, 404)
    );

  const { id } = req.params;

  const updatedSubCategory = await subCategory.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  }).populate("category");

  if (!updatedSubCategory)
    return next(
      new AppError(
        `Couldn't Update the SubCategory , No SubCategory with this Id `,
        404
      )
    );

  res.status(200).json({
    status: "success",
    data: updatedSubCategory,
    message: "SubCategory Updated Successfully",
  });
});

export const deleteSubCategory = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const deletedSubCategory = await SubCategory.findByIdAndDelete(id);

  if (!deletedSubCategory)
    return next(new AppError(`No SubCategory with this ID`, 404));

  res.status(204).json({
    status: "success",
    message: "SubCategory Deleted Successfully",
  });
});

export const getFilteredSubCategories = catchAsync(async (req, res, next) => {
  
  const { letters } = req.query;

  let allSubCategories;

  if (letters) {

    let query = {};
    const regex = new RegExp(
      letters
        .split("")
        .map((letters) => `(?=.*${letters})`)
        .join(""),
      "i"
    );

    query.name = regex;

    allSubCategories = await subCategory.find(query);
    
  } else {
    allSubCategories = [];
  }

  if (!allSubCategories)
    return next(new AppError(`No Category in the DB`, 404));

  res.status(200).json({
    status: "success",
    length: allSubCategories.length,
    data: allSubCategories,
  });
});
